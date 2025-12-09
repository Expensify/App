// copied from https://raw.githubusercontent.com/wooorm/markdown-table/main/index.js, turned into cmjs

type MarkdownTableOptions = {
    /**
     *   One style for all columns, or styles for their respective columns.
     *   Each style is either `'l'` (left), `'r'` (right), or `'c'` (center).
     *   Other values are treated as `''`, which doesn’t place the colon in the
     *   alignment row but does align left.
     *   *Only the lowercased first character is used, so `Right` is fine.*
     */
    align?: string | null | Array<string | null | undefined>;

    /**
     *   Whether to add a space of padding between delimiters and cells.
     *
     *   When `true`, there is padding:
     *
     *   ```markdown
     *   | Alpha | B     |
     *   | ----- | ----- |
     *   | C     | Delta |
     *   ```
     *
     *   When `false`, there is no padding:
     *
     *   ```markdown
     *   |Alpha|B    |
     *   |-----|-----|
     *   |C    |Delta|
     *   ```
     */
    padding?: boolean;

    /**
     *   Whether to begin each row with the delimiter.
     *
     *   > 👉 **Note**: please don’t use this: it could create fragile structures
     *   > that aren’t understandable to some markdown parsers.
     *
     *   When `true`, there are starting delimiters:
     *
     *   ```markdown
     *   | Alpha | B     |
     *   | ----- | ----- |
     *   | C     | Delta |
     *   ```
     *
     *   When `false`, there are no starting delimiters:
     *
     *   ```markdown
     *   Alpha | B     |
     *   ----- | ----- |
     *   C     | Delta |
     *   ```
     */
    delimiterStart?: boolean;
    /**
     *   Whether to end each row with the delimiter.
     *
     *   > 👉 **Note**: please don’t use this: it could create fragile structures
     *   > that aren’t understandable to some markdown parsers.
     *
     *   When `true`, there are ending delimiters:
     *
     *   ```markdown
     *   | Alpha | B     |
     *   | ----- | ----- |
     *   | C     | Delta |
     *   ```
     *
     *   When `false`, there are no ending delimiters:
     *
     *   ```markdown
     *   | Alpha | B
     *   | ----- | -----
     *   | C     | Delta
     *   ```
     */
    delimiterEnd?: boolean;

    /**
     *   Whether to align the delimiters.
     *   By default, they are aligned:
     *
     *   ```markdown
     *   | Alpha | B     |
     *   | ----- | ----- |
     *   | C     | Delta |
     *   ```
     *
     *   Pass `false` to make them staggered:
     *
     *   ```markdown
     *   | Alpha | B |
     *   | - | - |
     *   | C | Delta |
     *   ```
     */
    alignDelimiters?: boolean;

    /**
     *   Function to detect the length of table cell content.
     *   This is used when aligning the delimiters (`|`) between table cells.
     *   Full-width characters and emoji mess up delimiter alignment when viewing
     *   the markdown source.
     *   To fix this, you can pass this function, which receives the cell content
     *   and returns its “visible” size.
     *   Note that what is and isn’t visible depends on where the text is displayed.
     *
     *   Without such a function, the following:
     *
     *   ```js
     *   markdownTable([
     *     ['Alpha', 'Bravo'],
     *     ['中文', 'Charlie'],
     *     ['👩‍❤️‍👩', 'Delta']
     *   ])
     *   ```
     *
     *   Yields:
     *
     *   ```markdown
     *   | Alpha | Bravo |
     *   | - | - |
     *   | 中文 | Charlie |
     *   | 👩‍❤️‍👩 | Delta |
     *   ```
     *
     *   With [`string-width`](https://github.com/sindresorhus/string-width):
     *
     *   ```js
     *   import stringWidth from 'string-width'
     *
     *   markdownTable(
     *     [
     *       ['Alpha', 'Bravo'],
     *       ['中文', 'Charlie'],
     *       ['👩‍❤️‍👩', 'Delta']
     *     ],
     *     {stringLength: stringWidth}
     *   )
     *   ```
     *
     *   Yields:
     *
     *   ```markdown
     *   | Alpha | Bravo   |
     *   | ----- | ------- |
     *   | 中文  | Charlie |
     *   | 👩‍❤️‍👩    | Delta   |
     *   ```
     */
    stringLength?: (value: string) => number;
};

function serialize(value: string | null | undefined): string {
    return value === null || value === undefined ? '' : String(value);
}

function defaultStringLength(value: string): number {
    return value.length;
}

function toAlignment(value: string | null | undefined): number {
    const code = typeof value === 'string' ? value.codePointAt(0) : 0;

    if (code === 67 /* `C` */ || code === 99 /* `c` */) {
        return 99; /* `c` */
    }

    if (code === 76 /* `L` */ || code === 108 /* `l` */) {
        return 108; /* `l` */
    }

    if (code === 82 /* `R` */ || code === 114 /* `r` */) {
        return 114; /* `r` */
    }

    return 0;
}

/** Generate a markdown ([GFM](https://docs.github.com/en/github/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables)) table.. */
function markdownTable(table: Array<Array<string | null | undefined>>, options: MarkdownTableOptions = {}) {
    const align = (options.align ?? []).concat();
    const stringLength = options.stringLength ?? defaultStringLength;
    /** Character codes as symbols for alignment per column. */
    const alignments: number[] = [];
    /** Cells per row. */
    const cellMatrix: string[][] = [];
    /** Sizes of each cell per row. */
    const sizeMatrix: number[][] = [];
    const longestCellByColumn: number[] = [];
    let mostCellsPerRow = 0;
    let rowIndex = -1;

    // This is a superfluous loop if we don’t align delimiters, but otherwise we’d
    // do superfluous work when aligning, so optimize for aligning.
    while (++rowIndex < table.length) {
        const row: string[] = [];
        const sizes: number[] = [];
        let columnIndex = -1;

        const rowData = table.at(rowIndex) ?? [];

        if (rowData.length > mostCellsPerRow) {
            mostCellsPerRow = rowData.length;
        }

        while (++columnIndex < rowData.length) {
            const cell = serialize(rowData.at(columnIndex));

            if (options.alignDelimiters !== false) {
                const size = stringLength(cell);
                sizes[columnIndex] = size;

                if (longestCellByColumn.at(columnIndex) === undefined || size > (longestCellByColumn.at(columnIndex) ?? 0)) {
                    longestCellByColumn[columnIndex] = size;
                }
            }

            row.push(cell);
        }

        cellMatrix[rowIndex] = row;
        sizeMatrix[rowIndex] = sizes;
    }

    // Figure out which alignments to use.
    let columnIndex = -1;

    if (typeof align === 'object' && 'length' in align) {
        while (++columnIndex < mostCellsPerRow) {
            alignments[columnIndex] = toAlignment(align.at(columnIndex));
        }
    } else {
        const code = toAlignment(align);

        while (++columnIndex < mostCellsPerRow) {
            alignments[columnIndex] = code;
        }
    }

    // Inject the alignment row.
    columnIndex = -1;
    const row: string[] = [];
    const sizes: number[] = [];

    while (++columnIndex < mostCellsPerRow) {
        const code = alignments.at(columnIndex);
        let before = '';
        let after = '';

        if (code === 99 /* `c` */) {
            before = ':';
            after = ':';
        } else if (code === 108 /* `l` */) {
            before = ':';
        } else if (code === 114 /* `r` */) {
            after = ':';
        }

        // There *must* be at least one hyphen-minus in each alignment cell.
        let size = options.alignDelimiters === false ? 1 : Math.max(1, (longestCellByColumn.at(columnIndex) ?? 0) - before.length - after.length);

        const cell = before + '-'.repeat(size) + after;

        if (options.alignDelimiters !== false) {
            size = before.length + size + after.length;

            if (size > (longestCellByColumn.at(columnIndex) ?? 0)) {
                longestCellByColumn[columnIndex] = size;
            }

            sizes[columnIndex] = size;
        }

        row[columnIndex] = cell;
    }

    // Inject the alignment row.
    cellMatrix.splice(1, 0, row);
    sizeMatrix.splice(1, 0, sizes);

    rowIndex = -1;
    const lines: string[] = [];

    while (++rowIndex < cellMatrix.length) {
        const matrixRow = cellMatrix.at(rowIndex);
        const matrixSizes = sizeMatrix.at(rowIndex);
        columnIndex = -1;
        const line: string[] = [];

        while (++columnIndex < mostCellsPerRow) {
            const cell = matrixRow?.at(columnIndex) ?? '';
            let before = '';
            let after = '';

            if (options.alignDelimiters !== false) {
                const size = (longestCellByColumn.at(columnIndex) ?? 0) - (matrixSizes?.at(columnIndex) ?? 0);
                const code = alignments.at(columnIndex);

                if (code === 114 /* `r` */) {
                    before = ' '.repeat(size);
                } else if (code === 99 /* `c` */) {
                    if (size % 2) {
                        before = ' '.repeat(size / 2 + 0.5);
                        after = ' '.repeat(size / 2 - 0.5);
                    } else {
                        before = ' '.repeat(size / 2);
                        after = before;
                    }
                } else {
                    after = ' '.repeat(size);
                }
            }

            if (options.delimiterStart !== false && !columnIndex) {
                line.push('|');
            }

            if (
                options.padding !== false &&
                // Don’t add the opening space if we’re not aligning and the cell is
                // empty: there will be a closing space.
                !(options.alignDelimiters === false && cell === '') &&
                (options.delimiterStart !== false || columnIndex)
            ) {
                line.push(' ');
            }

            if (options.alignDelimiters !== false) {
                line.push(before);
            }

            line.push(cell);

            if (options.alignDelimiters !== false) {
                line.push(after);
            }

            if (options.padding !== false) {
                line.push(' ');
            }

            if (options.delimiterEnd !== false || columnIndex !== mostCellsPerRow - 1) {
                line.push('|');
            }
        }

        lines.push(options.delimiterEnd === false ? line.join('').replaceAll(/ +$/g, '') : line.join(''));
    }

    return lines.join('\n');
}

export default markdownTable;
