const fs = require('fs');
const path = require('path');

const files = [
  "frontend/app/facilities/page.tsx",
  "frontend/app/needs/page.tsx",
  "frontend/app/volunteers/page.tsx",
  "frontend/app/resources/page.tsx",
  "frontend/app/upload/page.tsx",
  "frontend/app/tasks/page.tsx",
  "frontend/app/page.tsx",
  "frontend/app/login/page.tsx",
  "frontend/app/signup/page.tsx",
  "frontend/app/volunteer-login/page.tsx",
  "frontend/app/volunteer-dashboard/page.tsx"
];

files.forEach(file => {
  const fullPath = path.join('c:/Users/Anshi/Desktop/mainTask', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Pattern to fix: ${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/some/path'
    // Should be: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'}/some/path`
    
    content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/127\.0\.0\.1:5000'\}([^\s'"`]*)(['"])/g, (match, p1, p2) => {
        return '`${process.env.NEXT_PUBLIC_API_URL || \'http://127.0.0.1:5000\'}' + p1 + '`';
    });

    // Also catch cases where the opening backtick is missing but the rest is okay
    content = content.replace(/(axios\.(post|get|put|delete)\()(\$\{process\.env)/g, '$1`$3');
    content = content.replace(/(const (API_BASE|MODULES_BASE|REASSIGN_URL) = )(\$\{process\.env)/g, '$1`$3');

    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${file}`);
  }
});
