/**
 * Per-file error baseline for a TypeScript project that still has known errors.
 *
 * The native app project starts with errors that are removed over a planned series of PRs. Until they are gone, its
 * errors are counted per file and compared with a checked-in baseline: a file that isn't in the baseline, or has more
 * errors than recorded, fails the typecheck, and counts are only allowed to go down. Line numbers and error codes are
 * deliberately ignored, because fixing one error can uncover another in the same file and the net count is what matters.
 */
import TSVUtils from './TSVUtils';

const BASELINE_FILE_HEADER = `# Known errors per file in the native TypeScript project (tsconfig.app.native.json).
# A new file or a higher count fails \`npm run typecheck\`. Lower counts are written back automatically on main.
# docs: contributingGuides/philosophies/CROSS-PLATFORM.md#native-typecheck-baseline`;

// tsc prints a located error as `path(line,col): error TS1234: message` when the output isn't a terminal.
const LOCATED_ERROR_REGEX = /^(.+?)\(\d+,\d+\): error TS\d+:/;
const ERROR_REGEX = /^error TS\d+:|: error TS\d+:/;

type ParsedErrors = {
    /** Every error message grouped by file, including the indented lines that continue a message */
    errorsByFile: Map<string, string[]>;

    /** Errors tsc reports without a file, such as a missing tsconfig. These can never be baselined. */
    unlocatedErrors: string[];
};

type FileCount = {
    file: string;
    count: number;
    allowed: number;
};

type BaselineComparison = {
    /** Files with more errors than the baseline allows, including files that aren't in it at all */
    exceeded: FileCount[];

    /** Files with fewer errors than the baseline records, including files that no longer have any */
    improved: FileCount[];
};

function parseErrors(output: string): ParsedErrors {
    const errorsByFile = new Map<string, string[]>();
    const unlocatedErrors: string[] = [];
    let currentMessages: string[] | undefined;

    for (const line of output.split(/\r?\n/)) {
        const locatedMatch = LOCATED_ERROR_REGEX.exec(line);
        if (locatedMatch) {
            const file = locatedMatch[1].replaceAll('\\', '/');
            currentMessages = errorsByFile.get(file) ?? [];
            errorsByFile.set(file, currentMessages);
            currentMessages.push(line);
            continue;
        }
        if (ERROR_REGEX.test(line)) {
            unlocatedErrors.push(line);
            currentMessages = unlocatedErrors;
            continue;
        }
        // tsc indents the lines that continue the previous message, such as the elaboration of a type mismatch.
        if (currentMessages && /^\s+\S/.test(line)) {
            const previousMessage = currentMessages.pop() ?? '';
            currentMessages.push(`${previousMessage}\n${line}`);
            continue;
        }
        currentMessages = undefined;
    }

    return {errorsByFile, unlocatedErrors};
}

function countErrors(errorsByFile: Map<string, string[]>): Map<string, number> {
    return new Map([...errorsByFile].map(([file, messages]) => [file, messages.length]));
}

function parseBaseline(text: string): Map<string, number> {
    const baseline = new Map<string, number>();
    for (const [index, row] of TSVUtils.parse(text).rows.entries()) {
        const [file, count] = row.cells;
        if (row.cells.length !== 2 || typeof file !== 'string' || typeof count !== 'number' || !Number.isInteger(count) || count < 1) {
            throw new Error(`Invalid typecheck baseline row ${index + 1}: expected a JSON file path and a positive integer error count.`);
        }
        baseline.set(file, count);
    }
    return baseline;
}

function serializeBaseline(counts: Map<string, number>): string {
    const rows = [...counts].filter(([, count]) => count > 0).map(([file, count]) => ({cells: [file, count], comments: ''}));
    return TSVUtils.serialize({leadingComments: BASELINE_FILE_HEADER, trailingComments: '', rows}, {sort: true});
}

function compareWithBaseline(counts: Map<string, number>, baseline: Map<string, number>): BaselineComparison {
    const exceeded: FileCount[] = [];
    const improved: FileCount[] = [];

    for (const [file, count] of counts) {
        const allowed = baseline.get(file) ?? 0;
        if (count > allowed) {
            exceeded.push({file, count, allowed});
        } else if (count < allowed) {
            improved.push({file, count, allowed});
        }
    }
    for (const [file, allowed] of baseline) {
        if (!counts.has(file)) {
            improved.push({file, count: 0, allowed});
        }
    }

    const byFile = (left: FileCount, right: FileCount) => left.file.localeCompare(right.file);
    return {exceeded: exceeded.sort(byFile), improved: improved.sort(byFile)};
}

/** Lower every count that went down, and drop files that no longer have errors, without raising anything. */
function tightenBaseline(baseline: Map<string, number>, counts: Map<string, number>): Map<string, number> {
    const tightened = new Map<string, number>();
    for (const [file, allowed] of baseline) {
        const count = Math.min(allowed, counts.get(file) ?? 0);
        if (count > 0) {
            tightened.set(file, count);
        }
    }
    return tightened;
}

const TypecheckBaseline = {parseErrors, countErrors, parseBaseline, serializeBaseline, compareWithBaseline, tightenBaseline};

export default TypecheckBaseline;
export type {BaselineComparison, FileCount, ParsedErrors};
