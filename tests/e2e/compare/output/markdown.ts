// From: https://raw.githubusercontent.com/callstack/reassure/main/packages/reassure-compare/src/output/markdown.ts
import fs from 'node:fs/promises';
import path from 'path';
import type {Stats} from 'tests/e2e/measure/math';
import * as Logger from '../../utils/logger';
import type {Data, Entry} from './console';
import * as format from './format';
import markdownTable from './markdownTable';

const tableHeader = ['Name', 'Duration'];

const collapsibleSection = (title: string, content: string) => `<details>\n<summary>${title}</summary>\n\n${content}\n</details>\n\n`;

const buildDurationDetails = (title: string, entry: Stats, unit: string) => {
    const relativeStdev = entry.stdev / entry.mean;

    return [
        `**${title}**`,
        `Mean: ${format.formatMetric(entry.mean, unit)}`,
        `Stdev: ${format.formatMetric(entry.stdev, unit)} (${format.formatPercent(relativeStdev)})`,
        entry.entries ? `Runs: ${entry.entries.join(' ')}` : '',
    ]
        .filter(Boolean)
        .join('<br/>');
};

const buildDurationDetailsEntry = (entry: Entry) =>
    ['baseline' in entry ? buildDurationDetails('Baseline', entry.baseline, entry.unit) : '', 'current' in entry ? buildDurationDetails('Current', entry.current, entry.unit) : '']
        .filter(Boolean)
        .join('<br/><br/>');

const formatEntryDuration = (entry: Entry): string => {
    if ('baseline' in entry && 'current' in entry) {
        return format.formatMetricDiffChange(entry);
    }

    if ('baseline' in entry) {
        return format.formatMetric((entry as Entry).baseline.mean, (entry as Entry).unit);
    }

    if ('current' in entry) {
        return format.formatMetric((entry as Entry).current.mean, (entry as Entry).unit);
    }

    return '';
};

const buildDetailsTable = (entries: Entry[]) => {
    if (!entries.length) {
        return '';
    }

    const rows = entries.map((entry) => [entry.name, buildDurationDetailsEntry(entry)]);
    const content = markdownTable([tableHeader, ...rows]);

    return collapsibleSection('Show details', content);
};

const buildSummaryTable = (entries: Entry[], collapse = false) => {
    if (!entries.length) {
        return '_There are no entries_';
    }

    const rows = entries.map((entry) => [entry.name, formatEntryDuration(entry)]);
    const content = markdownTable([tableHeader, ...rows]);

    return collapse ? collapsibleSection('Show entries', content) : content;
};

const buildMarkdown = (data: Data) => {
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

const writeToFile = (filePath: string, content: string) =>
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

const writeToMarkdown = (filePath: string, data: Data) => {
    const markdown = buildMarkdown(data);
    return writeToFile(filePath, markdown).catch((error) => {
        console.error(error);
        throw error;
    });
};

export default writeToMarkdown;
export {buildMarkdown};
