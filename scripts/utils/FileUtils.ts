/**
 * Get the line and column from an index in a source string.
 * @param source - The source string.
 * @param index - The index in the source string.
 * @returns The line and column.
 */
function getLineAndColumnFromIndex(source: string, index: number): {line: number; column: number} {
    const substring = source.slice(0, index);
    const line = substring.split('\n').length;
    const lastLineBreakIndex = substring.lastIndexOf('\n');
    const column = lastLineBreakIndex === -1 ? index + 1 : index - lastLineBreakIndex;
    return {line, column};
}

// eslint-disable-next-line import/prefer-default-export
export {getLineAndColumnFromIndex};
