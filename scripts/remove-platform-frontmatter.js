#!/usr/bin/env node
/**
 * Removes platform frontmatter from all .md files under the given directories.
 * Use to revert platform from expensify-classic and new-expensify.
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'docs', 'articles');
const DIRS_TO_REVERT = ['expensify-classic', 'new-expensify'];

function removePlatform(filePath) {
  const full = path.join(ARTICLES_DIR, filePath);
  if (!fs.existsSync(full)) return false;
  let content = fs.readFileSync(full, 'utf8');
  const orig = content;
  // Remove a line that is exactly "platform: Expensify_Classic" or "platform: New_Expensify" (with optional trailing whitespace)
  content = content.replace(/\nplatform: (?:Expensify_Classic|New_Expensify)\s*\n/g, '\n');
  if (content !== orig) {
    fs.writeFileSync(full, content);
    return true;
  }
  return false;
}

const { execSync } = require('child_process');
let count = 0;
for (const dir of DIRS_TO_REVERT) {
  const fullDir = path.join(ARTICLES_DIR, dir);
  if (!fs.existsSync(fullDir)) continue;
  const out = execSync(`find . -name "*.md"`, { encoding: 'utf8', cwd: fullDir });
  const files = out.trim().split('\n').filter(Boolean);
  for (const f of files) {
    const rel = path.join(dir, f);
    if (removePlatform(rel)) {
      console.log('Reverted:', rel);
      count++;
    }
  }
}
console.log('Reverted platform from', count, 'files.');
