#!/usr/bin/env node
/**
 * Adds `platform` frontmatter to test articles only.
 * Test articles live under docs/articles/consolidated/billing (source for docs/consolidated/hubs/billing).
 * Only Specific (single-platform) articles get platform; Universal and Semi-Universal stay without platform.
 */

const fs = require('fs');
const path = require('path');

const ARTICLES_DIR = path.join(__dirname, '..', 'docs', 'articles');

// Specific articles that apply to one platform only (add platform)
const CONSOLIDATED_CLASSIC = [
  'billing/other-billing-scenarios/Personal-and-Corporate-Karma.md',
  'billing/other-billing-scenarios/Tax-Exempt.md',
  'billing/subscription-management/How-to-Manage-Billing-and-Subscriptions-in-Expensify-Classic.md',
  'billing/subscription-setup-and-billing-ownership/How-to-configure-your-subscription-in-Expensify-Classic.md',
  'billing/plans-and-pricing/Expensify-Classic-Plans-Track-Submit-and-Legacy-Pricing.md',
];
const CONSOLIDATED_NEW = [
  'billing/subscription-management/How-to-Manage-Subscriptions-and-Billing-in-New-Expensify.md',
  'billing/subscription-setup-and-billing-ownership/How-to-configure-your-subscription-in-New-Expensify.md',
];

function addPlatformToFrontmatter(content, platformValue) {
  if (content.includes('platform:') && /^\s*platform:\s*\S+/m.test(content)) {
    return null; // already has platform
  }
  const firstFence = content.indexOf('---');
  if (firstFence === -1) return null;
  const afterFirstFence = content.slice(firstFence);
  if (!afterFirstFence.startsWith('---\n')) return null;
  const secondFence = afterFirstFence.indexOf('\n---\n', 4);
  if (secondFence === -1) return null;
  const closeFenceStart = firstFence + secondFence;
  const before = content.slice(0, closeFenceStart);
  const after = content.slice(closeFenceStart);
  const platformBlock = `\nplatform: ${platformValue}\n---\n`;
  return before + platformBlock + after.slice(5);
}

function processFile(filePath, platformValue) {
  const fullPath = path.join(ARTICLES_DIR, filePath);
  if (!fs.existsSync(fullPath)) return;
  let content = fs.readFileSync(fullPath, 'utf8');
  const newContent = addPlatformToFrontmatter(content, platformValue);
  if (newContent) {
    fs.writeFileSync(fullPath, newContent);
    console.log('Updated:', filePath);
  }
}

// Only consolidated/billing test articles
for (const rel of CONSOLIDATED_CLASSIC) {
  processFile(path.join('consolidated', rel), 'Expensify_Classic');
}
for (const rel of CONSOLIDATED_NEW) {
  processFile(path.join('consolidated', rel), 'New_Expensify');
}

console.log('Done.');
