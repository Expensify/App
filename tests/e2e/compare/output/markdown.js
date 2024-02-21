// From: https://raw.githubusercontent.com/callstack/reassure/main/packages/reassure-compare/src/output/markdown.ts
import fs from 'node:fs/promises';
import path from 'path';
import _ from 'underscore';
import * as Logger from '../../utils/logger';
import * as format from './format';
import markdownTable from './markdownTable';

const tableHeader = ['Name', 'Duration'];

const collapsibleSection = (title, content) => `<details>\n<summary>${title}</summary>\n\n${content}\n</details>\n\n`;

const buildDurationDetails = (title, entry) => {
    const relativeStdev = entry.stdev / entry.mean;

    return _.filter(
        [
            `**${title}**`,
            `Mean: ${format.formatDuration(entry.mean)}`,
            `Stdev: ${format.formatDuration(entry.stdev)} (${format.formatPercent(relativeStdev)})`,
            entry.entries ? `Runs: ${entry.entries.join(' ')}` : '',
        ],
        Boolean,
    ).join('<br/>');
};

const buildDurationDetailsEntry = (entry) =>
    _.filter(['baseline' in entry ? buildDurationDetails('Baseline', entry.baseline) : '', 'current' in entry ? buildDurationDetails('Current', entry.current) : ''], Boolean).join(
        '<br/><br/>',
    );

const formatEntryDuration = (entry) => {
    if ('baseline' in entry && 'current' in entry) {
        return format.formatDurationDiffChange(entry);
    }
    if ('baseline' in entry) {
        return format.formatDuration(entry.baseline.mean);
    }
    if ('current' in entry) {
        return format.formatDuration(entry.current.mean);
    }
    return '';
};

const buildDetailsTable = (entries) => {
    if (!entries.length) {
        return '';
    }

    const rows = _.map(entries, (entry) => [entry.name, buildDurationDetailsEntry(entry)]);
    const content = markdownTable([tableHeader, ...rows]);

    return collapsibleSection('Show details', content);
};

const buildSummaryTable = (entries, collapse = false) => {
    if (!entries.length) {
        return '_There are no entries_';
    }

    const rows = _.map(entries, (entry) => [entry.name, formatEntryDuration(entry)]);
    const content = markdownTable([tableHeader, ...rows]);

    return collapse ? collapsibleSection('Show entries', content) : content;
};

const buildMarkdown = (data) => {
    let result = '## Performance Comparison Report 📊';

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

const writeToFile = (filePath, content) =>
    fs
        .writeFile(filePath, content)
        .then(() => {
            Logger.info(`✅  Written output markdown output file ${filePath}`);
            Logger.info(`🔗 ${path.resolve(filePath)}\n`);
        })
        .catch((error) => {
            Logger.info(`❌  Could not write markdown output file ${filePath}`);
            Logger.info(`🔗 ${path.resolve(filePath)}`);
            console.error(error);
            throw error;
        });

const writeToMarkdown = (filePath, data) => {
    const markdown = buildMarkdown(data);
    return writeToFile(filePath, markdown).catch((error) => {
        console.error(error);
        throw error;
    });
};

export default writeToMarkdown;
