// From: https://raw.githubusercontent.com/callstack/reassure/main/packages/reassure-compare/src/output/markdown.ts
import fs from 'node:fs/promises';
import path from 'path';
import * as Logger from '../../utils/logger';
import type {AddedEntry, CompareEntry, CompareResult, PerformanceEntry, RemovedEntry} from '../types';
import * as format from './format';
import markdownTable from './markdownTable';

const tableHeader = ['Name', 'Duration'];

const collapsibleSection = (title: string, content: string): string => `<details>\n<summary>${title}</summary>\n\n${content}\n</details>\n\n`;

const buildDurationDetails = (title: string, entry: PerformanceEntry): string => {
    const relativeStdev = entry.stdev / entry.mean;

    return [
        `**${title}**`,
        `Mean: ${format.formatDuration(entry.mean)}`,
        `Stdev: ${format.formatDuration(entry.stdev)} (${format.formatPercent(relativeStdev)})`,
        entry.entries ? `Runs: ${entry.entries.join(' ')}` : '',
    ]
        .filter(Boolean)
        .join('<br/>');
};

const buildDurationDetailsEntry = (entry: CompareEntry | AddedEntry | RemovedEntry): string =>
    ['baseline' in entry ? buildDurationDetails('Baseline', entry.baseline) : '', 'current' in entry ? buildDurationDetails('Current', entry.current) : '']
        .filter(Boolean)
        .join('<br/><br/>');

const formatEntryDuration = (entry: CompareEntry | AddedEntry | RemovedEntry): string => {
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

const buildDetailsTable = (entries: Array<CompareEntry | AddedEntry | RemovedEntry>): string => {
    if (!entries.length) {
        return '';
    }

    const rows = entries.map((entry) => [entry.name, buildDurationDetailsEntry(entry)]);
    const content = markdownTable([tableHeader, ...rows]);

    return collapsibleSection('Show details', content);
};

const buildSummaryTable = (entries: Array<CompareEntry | AddedEntry | RemovedEntry>, collapse = false): string => {
    if (!entries.length) {
        return '_There are no entries_';
    }

    const rows = entries.map((entry) => [entry.name, formatEntryDuration(entry)]);
    const content = markdownTable([tableHeader, ...rows]);

    return collapse ? collapsibleSection('Show entries', content) : content;
};

const buildMarkdown = (data: CompareResult): string => {
    let result = '## Performance Comparison Report 📊';

    if (data.errors?.length) {
        result += '\n\n### Errors\n';
        data.errors.forEach((message) => {
            result += ` 1. 🛑 ${message}\n`;
        });
    }

    if (data.warnings?.length) {
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

const writeToFile = (filePath: string, content: string): Promise<void> =>
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

const writeToMarkdown = (filePath: string, data: CompareResult): Promise<void> => {
    const markdown = buildMarkdown(data);
    return writeToFile(filePath, markdown).catch((error) => {
        console.error(error);
        throw error;
    });
};

export default writeToMarkdown;
