const fs = require('fs');
try {
  const content = fs.readFileSync('vercel.json', 'utf8');
  JSON.parse(content);
  console.log('Valid JSON');
} catch (e) {
  console.log('Invalid JSON:', e.message);
}
