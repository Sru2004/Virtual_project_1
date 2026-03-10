const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'vercel.json');
const content = fs.readFileSync(filePath, 'utf8');
console.log(content);
