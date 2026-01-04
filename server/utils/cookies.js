export function getCookieOptions(req) {
  const isProduction = process.env.NODE_ENV === 'production';

  // If behind a TLS-terminating proxy (Render/Heroku/etc), Express needs to trust it
  // for secure cookies to work via X-Forwarded-Proto.
  const secure = isProduction;

  return {
    httpOnly: true,
    secure,
    sameSite: isProduction ? 'lax' : 'lax',
    path: '/',
    // You can set `domain` if you need cross-subdomain cookies.
  };
}
