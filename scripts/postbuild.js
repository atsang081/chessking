import fs from 'fs';
import path from 'path';

const distDir = path.resolve('./dist');

// Create .nojekyll file
const nojekyllPath = path.join(distDir, '.nojekyll');
fs.writeFileSync(nojekyllPath, '', 'utf8');
console.log('✓ Created .nojekyll file');

// Copy CNAME file
const cnameSourcePath = path.join('./public', 'CNAME');
const cnameDestPath = path.join(distDir, 'CNAME');
if (fs.existsSync(cnameSourcePath)) {
  fs.copyFileSync(cnameSourcePath, cnameDestPath);
  console.log('✓ Copied CNAME file');
} else {
  console.warn('⚠ CNAME file not found in public folder');
}

console.log('✓ Build post-processing completed');
