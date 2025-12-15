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
};

export default FileUtils;
export {ERROR_MESSAGES};
