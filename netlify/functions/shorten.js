const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, '../../urls.json');

function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const formData = new URLSearchParams(event.body);
  const original_url = formData.get('original_url');
  const custom_code = formData.get('custom_code');

  let data = {};
  if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }

  let short_code;
  if (custom_code) {
    if (data[custom_code]) {
      return {
        statusCode: 400,
        body: 'Custom code already taken.',
      };
    }
    short_code = custom_code;
  } else {
    do {
      short_code = generateShortCode();
    } while (data[short_code]);
  }

  data[short_code] = original_url;
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));

  const host = event.headers['host'] || 'localhost';
  const protocol = event.headers['x-forwarded-proto'] || 'https';
  const short_url = `${protocol}://${host}/${short_code}`;

  return {
    statusCode: 200,
    body: JSON.stringify({ short_url }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
};
