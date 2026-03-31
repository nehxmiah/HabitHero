import fs from 'fs';
import path from 'path';

const dir = path.join(process.cwd(), 'src', 'app', 'components');

const replacements = [
  { regex: /bg-\[#1a1a1a\]/g, replacement: 'bg-[var(--hh-bg)]' },
  { regex: /bg-\[#0a0a0a\]/g, replacement: 'bg-[var(--hh-card)]' },
  { regex: /bg-\[#111111\]/g, replacement: 'bg-[var(--hh-card)]' },
  { regex: /border-gray-800/g, replacement: 'border-[var(--hh-border)]' },
  { regex: /border-gray-700/g, replacement: 'border-[var(--hh-border)]' },
  { regex: /text-\[#4ADE80\]/g, replacement: 'text-[var(--hh-accent)]' },
  { regex: /bg-\[#4ADE80\]/g, replacement: 'bg-[var(--hh-btn)]' }, // mostly buttons
  { regex: /border-\[#4ADE80\]/g, replacement: 'border-[var(--hh-accent)]' },
  { regex: /ring-\[#4ADE80\]/g, replacement: 'ring-[var(--hh-accent)]' },
  { regex: /text-black/g, replacement: 'text-[var(--hh-btn-text)]' },
  { regex: /hover:bg-gray-800/g, replacement: 'hover:bg-[var(--hh-border)]' },
  { regex: /hover:bg-\[#3DC970\]/g, replacement: 'hover:opacity-90' },
  { regex: /bg-gray-800/g, replacement: 'bg-[var(--hh-border)]' },
  { regex: /bg-gray-700/g, replacement: 'bg-[var(--hh-muted)]' },
  { regex: /text-gray-400/g, replacement: 'text-[var(--hh-muted)]' },
  { regex: /text-gray-500/g, replacement: 'text-[var(--hh-muted)]' },
  { regex: /text-white/g, replacement: 'text-[var(--hh-text)]' },
];

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('AuthPage.tsx') && !fullPath.includes('Root.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      replacements.forEach(({ regex, replacement }) => {
        content = content.replace(regex, replacement);
      });

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(dir);
console.log('Done replacing!');
