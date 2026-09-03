type TSVParseOptions = {
    onInvalidRow?: (error: Error, line: string, lineNumber: number) => void;
};

type TSVSerializeOptions = {
    sort?: boolean;
};

type TSVDocument = {
    comments: string;
    rows: unknown[][];
};

const COMMENT_LINE_REGEX = /^\s*#/;
const NON_EMPTY_LINE_REGEX = /\S+/;

function decodeRow(line: string, lineNumber: number): unknown[] {
    return line.split('\t').map((cell, columnIndex) => {
        try {
            return JSON.parse(cell) as unknown;
        } catch {
            throw new Error(`Invalid JSON in column ${columnIndex + 1} at line ${lineNumber}`);
        }
    });
}

function encodeRow(row: readonly unknown[]): string {
    return `${row.map((cell) => JSON.stringify(cell)).join('\t')}\n`;
}

const TSVUtils = {
    parse(text: string, options: TSVParseOptions = {}): TSVDocument {
        const rows: unknown[][] = [];
        const commentLines: string[] = [];
        const rawLines = text.split(/\r?\n/);
        for (const [index, rawLine] of rawLines.entries()) {
            if (!NON_EMPTY_LINE_REGEX.test(rawLine)) {
                continue;
            }
            if (COMMENT_LINE_REGEX.test(rawLine)) {
                commentLines.push(rawLine);
                continue;
            }
            const lineNumber = index + 1;
            try {
                rows.push(decodeRow(rawLine, lineNumber));
            } catch (error) {
                const parsedError = error instanceof Error ? error : new Error(String(error));
                if (!options.onInvalidRow) {
                    throw parsedError;
                }
                options.onInvalidRow(parsedError, rawLine, lineNumber);
            }
        }
        return {comments: commentLines.join('\n'), rows};
    },

    serialize(rows: readonly unknown[][], comments = '', options: TSVSerializeOptions = {}): string {
        const encoded = rows.map(encodeRow);
        if (options.sort) {
            encoded.sort();
        }
        const body = encoded.join('');
        return comments ? `${comments}\n\n${body}` : body;
    },
};

export default TSVUtils;
export type {TSVDocument, TSVParseOptions, TSVSerializeOptions};
