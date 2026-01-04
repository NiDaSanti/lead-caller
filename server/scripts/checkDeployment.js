import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let dotenv;
try {
  ({ default: dotenv } = await import('dotenv'));
} catch (err) {
  console.warn('⚠️  dotenv package not found; continuing without automatic .env loading.');
  dotenv = null;
}

const loadEnvFile = (targetPath) => {
  if (!targetPath || !fs.existsSync(targetPath)) {
    return false;
  }
  if (dotenv && typeof dotenv.config === 'function') {
    dotenv.config({ path: targetPath });
    return true;
  }

  const contents = fs.readFileSync(targetPath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      return;
    }
    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
  return true;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');

const args = process.argv.slice(2);
let envFileArg;
let envOverride;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === '--env-file' || arg === '-f') {
    envFileArg = args[i + 1];
    i += 1;
  } else if (arg === '--env' || arg === '-e') {
    envOverride = args[i + 1];
    i += 1;
  }
}

const defaultEnvPath = path.resolve(repoRoot, '.env');
if (envFileArg) {
  const directPath = path.isAbsolute(envFileArg)
    ? envFileArg
    : path.resolve(process.cwd(), envFileArg);
  const repoRelativePath = path.resolve(repoRoot, envFileArg);
  const candidatePath = fs.existsSync(directPath)
    ? directPath
    : repoRelativePath;
  if (loadEnvFile(candidatePath)) {
    // loaded successfully
  } else {
    console.warn(`⚠️  Provided env file not found: ${envFileArg}`);
  }
} else if (loadEnvFile(defaultEnvPath)) {
  // default .env loaded
} else {
  loadEnvFile(path.resolve(process.cwd(), '.env'));
}

const envName = (envOverride || process.env.NODE_ENV || 'development').toLowerCase();

const errors = [];
const warnings = [];

const note = (message) => warnings.push(message);

const requireVar = (name, description) => {
  const value = process.env[name];
  if (!value) {
    errors.push(`${name} – ${description}`);
  }
  return value;
};

const optionalVar = (name, description) => {
  const value = process.env[name];
  if (!value) {
    note(`${name} (optional) – ${description}`);
  }
  return value;
};

requireVar('OPENAI_API_KEY', 'needed so the OpenAI client can authenticate when generating replies.');
optionalVar('OPENAI_MODEL', 'defaults to gpt-3.5-turbo; set to adjust which model is used.');
optionalVar('OPENAI_TEMPERATURE', 'defaults to 0.7; lower for deterministic answers.');
if (envName === 'development') {
  optionalVar('OPENAI_DEV_MAX_CALLS', 'limits how many OpenAI requests can be made during development.');
}

// Twilio is required for auto-dial / live calling, but the app can still run (UI + lead mgmt)
// during local development without it.
if (envName === 'production') {
  requireVar('TWILIO_SID', 'required to initialize the Twilio client.');
  requireVar('TWILIO_AUTH', 'required to authenticate with Twilio.');
  const twilioNumberVar = 'TWILIO_PHONE_PROD';
  const twilioNumber = requireVar(twilioNumberVar, `Twilio caller ID for the ${envName} environment.`);
  if (twilioNumber && !/^\+\d{10,}$/.test(twilioNumber)) {
    note(`${twilioNumberVar} does not look like an E.164 formatted number (e.g., +15551234567).`);
  }
} else {
  optionalVar('TWILIO_SID', 'required to initialize Twilio (optional for basic local dev).');
  optionalVar('TWILIO_AUTH', 'required to authenticate with Twilio (optional for basic local dev).');
  const twilioNumberVar = 'TWILIO_PHONE_DEV';
  const twilioNumber = optionalVar(twilioNumberVar, 'Twilio caller ID for development (optional for basic local dev).');
  if (twilioNumber && !/^\+\d{10,}$/.test(twilioNumber)) {
    note(`${twilioNumberVar} does not look like an E.164 formatted number (e.g., +15551234567).`);
  }
}

const serverBaseUrl = requireVar('SERVER_BASE_URL', 'used to construct Twilio webhook URLs. Must be publicly reachable.');
if (serverBaseUrl) {
  try {
    const parsed = new URL(serverBaseUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      errors.push('SERVER_BASE_URL must start with http:// or https://');
    }
    if (envName === 'production' && parsed.protocol !== 'https:') {
      warnings.push('SERVER_BASE_URL should use HTTPS in production so Twilio can reach it securely.');
    }
  } catch (err) {
    errors.push(`SERVER_BASE_URL is not a valid URL: ${err.message}`);
  }
}

const schedulerFile = requireVar('SCHEDULER_FILE', 'defines the auto-dialer schedule.');
const leadsFile = requireVar('LEADS_FILE', 'stores lead data so callbacks can update call status.');

const ensureFile = (label, relativePath) => {
  if (!relativePath) {
    return;
  }
  const absolutePath = path.resolve(repoRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    warnings.push(`${label} (${relativePath}) does not exist yet. Create it or verify the path before deploying.`);
  }
};

ensureFile('Scheduler config', schedulerFile);
ensureFile('Leads datastore', leadsFile);

if (errors.length > 0) {
  console.error('\n❌ Deployment readiness check failed. Fix the following:');
  errors.forEach((msg) => console.error(`  • ${msg}`));
  if (warnings.length > 0) {
    console.error('\nWarnings:');
    warnings.forEach((msg) => console.error(`  • ${msg}`));
  }
  process.exit(1);
}

console.log(`\n✅ Required environment variables present for ${envName} deployment.`);
if (warnings.length > 0) {
  console.log('\nWarnings:');
  warnings.forEach((msg) => console.log(`  • ${msg}`));
}

console.log("\nYou're ready to deploy AI responses and Twilio auto-calls!");
