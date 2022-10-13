/* eslint-disable @lwc/lwc/no-async-await,rulesdir/prefer-underscore-method */
// from: https://raw.githubusercontent.com/callstack/reassure/main/packages/reassure-compare/src/output/markdown.ts

const fs = require('fs/promises');
const path = require('path');
const markdownTable = require('./markdownTable');
const {
    formatDuration,
    formatPercent,
    formatDurationDiffChange,
} = require('./format');
const Logger = require('../../utils/logger');

const tableHeader = ['Name', 'Duration'];

const collapsibleSection = (title, content) => `<details>\n<summary>${title}</summary>\n\n${content}\n</details>\n\n`;

const buildDurationDetails = (title, entry) => {
    const relativeStdev = entry.stdev / entry.mean;

    return [
        `**${title}**`,
        `Mean: ${formatDuration(entry.mean)}`,
        `Stdev: ${formatDuration(entry.stdev)} (${formatPercent(relativeStdev)})`,
        entry.entries ? `Runs: ${entry.entries.join(' ')}` : '',
    ]
        .filter(Boolean)
        .join('<br/>');
};

const buildDurationDetailsEntry = entry => [
    'baseline' in entry ? buildDurationDetails('Baseline', entry.baseline) : '',
    'current' in entry ? buildDurationDetails('Current', entry.current) : '',
]
    .filter(Boolean)
    .join('<br/><br/>');

const formatEntryDuration = (entry) => {
    if ('baseline' in entry && 'current' in entry) { return formatDurationDiffChange(entry); }
    if ('baseline' in entry) { return formatDuration(entry.baseline.mean); }
    if ('current' in entry) { return formatDuration(entry.current.mean); }
    return '';
};

const buildDetailsTable = (entries) => {
    if (!entries.length) { return ''; }

    const rows = entries.map(entry => [entry.name, buildDurationDetailsEntry(entry)]);
    const content = markdownTable([tableHeader, ...rows]);

    return collapsibleSection('Show details', content);
};

const buildSummaryTable = (entries, collapse = false) => {
    if (!entries.length) { return '_There are no entries_'; }

    const rows = entries.map(entry => [entry.name, formatEntryDuration(entry)]);
    const content = markdownTable([tableHeader, ...rows]);

    return collapse ? collapsibleSection('Show entries', content) : content;
};

const buildMarkdown = (data) => {
    let result = '# Performance Comparison Report';

    if (data.errors && data.errors.length) {
        result += '\n\n### Errors\n';
        data.errors.forEach((message) => {
            result += ` 1. 🛑 ${message}\n`;
        });
    }

    if (data.warnings && data.warnings.length) {
        result += '\n\n### Warnings\n';
        data.warnings.forEach((message) => {
            result += ` 1. 🟡 ${message}\n`;
        });
    }

    result += '\n\n### Significant Changes To Duration';
    result += `\n${buildSummaryTable(data.significance)}`;
    result += `\n${buildDetailsTable(data.significance)}`;
    result += '\n\n### Meaningless Changes To Duration';
    result += `\n${buildSummaryTable(data.meaningless, true)}`;
    result += `\n${buildDetailsTable(data.meaningless)}`;
    result += '\n';

    return result;
};

const writeToFile = async (filePath, content) => {
    try {
        await fs.writeFile(filePath, content);

        Logger.info(`✅  Written output markdown output file ${filePath}`);
        Logger.info(`🔗 ${path.resolve(filePath)}\n`);
    } catch (error) {
        Logger.info(`❌  Could not write markdown output file ${filePath}`);
        Logger.info(`🔗 ${path.resolve(filePath)}`);
        console.error(error);
        throw error;
    }
};

const writeToMarkdown = async (filePath, data) => {
    try {
        const markdown = buildMarkdown(data);
        await writeToFile(filePath, markdown);
    } catch (error) {
        console.error(error);
        throw error;
    }
};

module.exports = writeToMarkdown;
