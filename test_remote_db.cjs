const pg = require('pg');

async function test() {
  const client = new pg.Client({
    host: '148.113.4.193',
    port: 5432,
    user: 'prasowla_hendry_root',
    password: '&vW^m8Ts;K5TtveM',
    database: 'prasowla_project_master',
    connectionTimeoutMillis: 5000,
  });
  try {
    await client.connect();
    console.log('SUCCESS! Connected to remote database!');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.log(`Failed: ${err.message}`);
    process.exit(1);
  }
}

test();
