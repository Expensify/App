import fs from 'fs';
import {globSync} from 'glob';
import path from 'path';

const DEFAULT_EXTENSIONS = ['.ts', '.tsx'];

const ERROR_MESSAGES = {
    SOURCE_CANNOT_BE_EMPTY: 'Source cannot be empty',
    INDEX_CANNOT_BE_NEGATIVE: 'Index cannot be negative',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    INDEX_OUT_OF_BOUNDS: (sourceLength: number, index: number) => `Index ${index} is out of bounds for source length ${sourceLength}`,
} as const;

const FileUtils = {
    /**
     * Get the line and column from an index in a source string.
     * @param source - The source string.
     * @param index - The index in the source string.
     * @returns The line and column.
     */
    getLineAndColumnFromIndex: (source: string, index: number): {line: number; column: number} => {
        if (source.length === 0) {
            throw new Error(ERROR_MESSAGES.SOURCE_CANNOT_BE_EMPTY);
        }

        if (index < 0) {
            throw new Error(ERROR_MESSAGES.INDEX_CANNOT_BE_NEGATIVE);
        }

        if (index > source.length) {
            throw new Error(ERROR_MESSAGES.INDEX_OUT_OF_BOUNDS(source.length, index));
        }

        const substring = source.slice(0, index);
        const line = substring.split('\n').length;
        const lastLineBreakIndex = substring.lastIndexOf('\n');
        const column = lastLineBreakIndex === -1 ? index + 1 : index - lastLineBreakIndex;
        return {line, column};
    },

    /**
     * Resolve a list of inputs (file paths, directories, or glob patterns) to concrete file paths.
     * Directories are expanded recursively. Results are deduplicated.
     *
     * @param inputs - File paths, directories, or glob patterns
     * @param extensions - File extensions to include (default: .ts, .tsx)
     */
    resolveFilePaths: (inputs: string[], extensions: string[] = DEFAULT_EXTENSIONS): string[] => {
        const resolved = new Set<string>();

        for (const input of inputs) {
            const absoluteInput = path.resolve(input);
            const exists = fs.existsSync(absoluteInput);
            const stat = exists ? fs.statSync(absoluteInput) : null;

            if (exists && stat?.isDirectory()) {
                const pattern = path.join(absoluteInput, '**', `*{${extensions.join(',')}}`);
                for (const file of globSync(pattern)) {
                    resolved.add(file);
                }
                continue;
            }

            if (exists && stat?.isFile()) {
                resolved.add(absoluteInput);
                continue;
            }

            for (const file of globSync(input, {absolute: true})) {
                if (extensions.some((ext) => file.endsWith(ext))) {
                    resolved.add(file);
                }
            }
        }

        return Array.from(resolved);
    },
};

export default FileUtils;
export {ERROR_MESSAGES};
