type TSVParseOptions = {
    onInvalidRow?: (error: Error, line: string, lineNumber: number) => void;
};

type TSVSerializeOptions = {
    sort?: boolean;
};

type TSVRow = {
    cells: unknown[];
    comments: string;
};

type TSVDocument = {
    leadingComments: string;
    trailingComments: string;
    rows: TSVRow[];
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

function joinCommentLines(lines: readonly string[]): string {
    return lines.join('\n');
}

function appendBlock(output: string, block: string): string {
    if (!block) {
        return output;
    }
    return output + (block.endsWith('\n') ? block : `${block}\n`);
}

const TSVUtils = {
    /**
     * Comments are either leading (before any data), trailing (after the last
     * data row), or attached to the next data row. Inline comments therefore
     * travel with that row when `serialize` sorts.
     */
    parse(text: string, options: TSVParseOptions = {}): TSVDocument {
        const rows: TSVRow[] = [];
        const leadingCommentLines: string[] = [];
        const pendingCommentLines: string[] = [];
        let seenData = false;
        const rawLines = text.split(/\r?\n/);
        for (const [index, rawLine] of rawLines.entries()) {
            if (!NON_EMPTY_LINE_REGEX.test(rawLine)) {
                continue;
            }
            if (COMMENT_LINE_REGEX.test(rawLine)) {
                if (seenData) {
                    pendingCommentLines.push(rawLine);
                } else {
                    leadingCommentLines.push(rawLine);
                }
                continue;
            }
            const lineNumber = index + 1;
            try {
                rows.push({cells: decodeRow(rawLine, lineNumber), comments: joinCommentLines(pendingCommentLines)});
                pendingCommentLines.length = 0;
                seenData = true;
            } catch (error) {
                const parsedError = error instanceof Error ? error : new Error(String(error));
                if (!options.onInvalidRow) {
                    throw parsedError;
                }
                options.onInvalidRow(parsedError, rawLine, lineNumber);
            }
        }
        return {
            leadingComments: joinCommentLines(leadingCommentLines),
            trailingComments: joinCommentLines(pendingCommentLines),
            rows,
        };
    },

    serialize(document: TSVDocument, options: TSVSerializeOptions = {}): string {
        const items = document.rows.map((row) => ({comments: row.comments, encoded: encodeRow(row.cells)}));
        if (options.sort) {
            items.sort((left, right) => left.encoded.localeCompare(right.encoded));
        }
        let output = '';
        if (document.leadingComments) {
            output = appendBlock(output, document.leadingComments);
            output += '\n';
        }
        for (const item of items) {
            output = appendBlock(output, item.comments);
            output += item.encoded;
        }
        return appendBlock(output, document.trailingComments);
    },
};

export default TSVUtils;
export type {TSVDocument, TSVParseOptions, TSVRow, TSVSerializeOptions};
