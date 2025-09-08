import fs from 'fs';
import csv from 'csv-parser';

const filePath = process.argv[2];

if (!filePath) {
  console.error('Usage: node importLeads.js <file.csv>');
  process.exit(1);
}

let successes = 0;
let failures = 0;

async function run() {
  const stream = fs.createReadStream(filePath).pipe(csv());

  for await (const row of stream) {
    const payload = {
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
      address: {
        street: row.address,
        city: row.city,
        state: row.state,
        zip: row.zipcode,
      },
      note: row.note,
    };

    try {
      const res = await fetch('http://localhost:3000/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        successes++;
        console.log(`✅ Imported ${payload.firstName} ${payload.lastName}`);
      } else {
        failures++;
        console.error(`❌ Failed ${payload.firstName} ${payload.lastName}: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      failures++;
      console.error(`❌ Failed ${payload.firstName} ${payload.lastName}: ${err.message}`);
    }
  }

  console.log(`\nImport complete. Successes: ${successes}, Failures: ${failures}`);
  process.exit(failures ? 1 : 0);
}

run();
