#!/usr/bin/env node
/**
 * Combine per-shard jest-memory*.json files and emit a Markdown summary.
 * Usage: node tests/utils/summarizeMemory.js <directoryWithArtifacts>
 */
const fs = require('fs');
const path = require('path');

const artifactsDir = process.argv[2] || '.';
const files = fs.readdirSync(artifactsDir).filter((f) => f.startsWith('jest-memory-') && f.endsWith('.json'));

if (!files.length) {
    console.log('No jest-memory-*.json artifacts found.');
    process.exit(0);
}

const allEntries = [];

files.forEach((file) => {
    const shard = file.replace(/^jest-memory-/, '').replace(/\.json$/, '');
    const data = JSON.parse(fs.readFileSync(path.join(artifactsDir, file), 'utf8'));
    data.forEach((entry) => allEntries.push({...entry, shard}));
});

const maxRss = Math.max(...allEntries.map((e) => e.rssMB));
const avgRss = Math.round(allEntries.reduce((sum, e) => sum + e.rssMB, 0) / allEntries.length);

const byShard = files.map((file) => {
    const shard = file.replace(/^jest-memory-/, '').replace(/\.json$/, '');
    const data = JSON.parse(fs.readFileSync(path.join(artifactsDir, file), 'utf8'));
    const shardMax = Math.max(...data.map((e) => e.rssMB));
    return {shard, max: shardMax};
});

const top = [...allEntries].sort((a, b) => b.rssMB - a.rssMB).slice(0, 10);

const summaryLines = [];
summaryLines.push(`Jest memory summary`);
summaryLines.push(`Files: ${allEntries.length}`);
summaryLines.push(`Shards: ${files.length}`);
summaryLines.push(`Overall max RSS: ${maxRss} MB`);
summaryLines.push(`Average RSS: ${avgRss} MB`);
summaryLines.push('');
summaryLines.push(`Top ${top.length} suites by RSS:`);
summaryLines.push(`| Suite | Shard | RSS (MB) | Delta (MB) |`);
summaryLines.push(`| --- | --- | --- | --- |`);
top.forEach((t) => {
    summaryLines.push(`| ${path.relative(process.cwd(), t.path)} | ${t.shard} | ${t.rssMB} | ${t.deltaMB} |`);
});
summaryLines.push('');
summaryLines.push(`Max RSS per shard:`);
summaryLines.push(`| Shard | Max RSS (MB) |`);
summaryLines.push(`| --- | --- |`);
byShard.forEach(({shard, max}) => summaryLines.push(`| ${shard} | ${max} |`));

const summary = summaryLines.join('\n');

// Write to summary for GitHub Actions.
if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
}

// Also print to stdout for logs or local use.
console.log(summary);
