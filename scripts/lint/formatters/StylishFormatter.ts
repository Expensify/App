import path from 'node:path';

import type {FormatterResult, LintMessage} from '../types';

import Formatter from '../Formatter';

function relativePath(projectRoot: string, filePath: string): string {
    return path.relative(projectRoot, filePath) || filePath;
}

function formatMessage(projectRoot: string, message: LintMessage): string {
    const loc = `${relativePath(projectRoot, message.filePath)}:${message.line}:${message.column}`;
    const level = message.severity >= 2 ? 'error' : 'warning';
    const rule = message.ruleID ? `  ${message.ruleID}` : '';
    return `${loc}\n  ${level}  ${message.message}${rule}`;
}

class StylishFormatter extends Formatter {
    readonly name = 'stylish';

    constructor(
        private readonly projectRoot: string,
        private readonly showWarnings: boolean,
    ) {
        super();
    }

    format(messages: LintMessage[]): FormatterResult {
        const visible = this.showWarnings ? messages : messages.filter((message) => message.severity >= 2);
        const errorCount = messages.filter((message) => message.severity >= 2).length;
        const warningCount = messages.filter((message) => message.severity < 2).length;

        if (visible.length === 0) {
            return {text: '', errorCount, warningCount};
        }

        const byFile = new Map<string, LintMessage[]>();
        for (const message of visible) {
            const list = byFile.get(message.filePath) ?? [];
            list.push(message);
            byFile.set(message.filePath, list);
        }

        const blocks: string[] = [];
        for (const fileMessages of byFile.values()) {
            blocks.push(fileMessages.map((message) => formatMessage(this.projectRoot, message)).join('\n'));
        }

        const summary = this.showWarnings
            ? `\n\n${errorCount} error${errorCount === 1 ? '' : 's'}, ${warningCount} warning${warningCount === 1 ? '' : 's'}`
            : `\n\n${errorCount} error${errorCount === 1 ? '' : 's'}`;

        return {text: `${blocks.join('\n\n')}${summary}`, errorCount, warningCount};
    }
}

export default StylishFormatter;
