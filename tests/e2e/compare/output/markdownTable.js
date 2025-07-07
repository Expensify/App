"use strict";
// copied from https://raw.githubusercontent.com/wooorm/markdown-table/main/index.js, turned into cmjs
Object.defineProperty(exports, "__esModule", { value: true });
function serialize(value) {
    return value === null || value === undefined ? '' : String(value);
}
function defaultStringLength(value) {
    return value.length;
}
function toAlignment(value) {
    var code = typeof value === 'string' ? value.codePointAt(0) : 0;
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
function markdownTable(table, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (options === void 0) { options = {}; }
    var align = ((_a = options.align) !== null && _a !== void 0 ? _a : []).concat();
    var stringLength = (_b = options.stringLength) !== null && _b !== void 0 ? _b : defaultStringLength;
    /** Character codes as symbols for alignment per column. */
    var alignments = [];
    /** Cells per row. */
    var cellMatrix = [];
    /** Sizes of each cell per row. */
    var sizeMatrix = [];
    var longestCellByColumn = [];
    var mostCellsPerRow = 0;
    var rowIndex = -1;
    // This is a superfluous loop if we don’t align delimiters, but otherwise we’d
    // do superfluous work when aligning, so optimize for aligning.
    while (++rowIndex < table.length) {
        var row_1 = [];
        var sizes_1 = [];
        var columnIndex_1 = -1;
        var rowData = (_c = table.at(rowIndex)) !== null && _c !== void 0 ? _c : [];
        if (rowData.length > mostCellsPerRow) {
            mostCellsPerRow = rowData.length;
        }
        while (++columnIndex_1 < rowData.length) {
            var cell = serialize(rowData.at(columnIndex_1));
            if (options.alignDelimiters !== false) {
                var size = stringLength(cell);
                sizes_1[columnIndex_1] = size;
                if (longestCellByColumn.at(columnIndex_1) === undefined || size > ((_d = longestCellByColumn.at(columnIndex_1)) !== null && _d !== void 0 ? _d : 0)) {
                    longestCellByColumn[columnIndex_1] = size;
                }
            }
            row_1.push(cell);
        }
        cellMatrix[rowIndex] = row_1;
        sizeMatrix[rowIndex] = sizes_1;
    }
    // Figure out which alignments to use.
    var columnIndex = -1;
    if (typeof align === 'object' && 'length' in align) {
        while (++columnIndex < mostCellsPerRow) {
            alignments[columnIndex] = toAlignment(align.at(columnIndex));
        }
    }
    else {
        var code = toAlignment(align);
        while (++columnIndex < mostCellsPerRow) {
            alignments[columnIndex] = code;
        }
    }
    // Inject the alignment row.
    columnIndex = -1;
    var row = [];
    var sizes = [];
    while (++columnIndex < mostCellsPerRow) {
        var code = alignments.at(columnIndex);
        var before = '';
        var after = '';
        if (code === 99 /* `c` */) {
            before = ':';
            after = ':';
        }
        else if (code === 108 /* `l` */) {
            before = ':';
        }
        else if (code === 114 /* `r` */) {
            after = ':';
        }
        // There *must* be at least one hyphen-minus in each alignment cell.
        var size = options.alignDelimiters === false ? 1 : Math.max(1, ((_e = longestCellByColumn.at(columnIndex)) !== null && _e !== void 0 ? _e : 0) - before.length - after.length);
        var cell = before + '-'.repeat(size) + after;
        if (options.alignDelimiters !== false) {
            size = before.length + size + after.length;
            if (size > ((_f = longestCellByColumn.at(columnIndex)) !== null && _f !== void 0 ? _f : 0)) {
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
    var lines = [];
    while (++rowIndex < cellMatrix.length) {
        var matrixRow = cellMatrix.at(rowIndex);
        var matrixSizes = sizeMatrix.at(rowIndex);
        columnIndex = -1;
        var line = [];
        while (++columnIndex < mostCellsPerRow) {
            var cell = (_g = matrixRow === null || matrixRow === void 0 ? void 0 : matrixRow.at(columnIndex)) !== null && _g !== void 0 ? _g : '';
            var before = '';
            var after = '';
            if (options.alignDelimiters !== false) {
                var size = ((_h = longestCellByColumn.at(columnIndex)) !== null && _h !== void 0 ? _h : 0) - ((_j = matrixSizes === null || matrixSizes === void 0 ? void 0 : matrixSizes.at(columnIndex)) !== null && _j !== void 0 ? _j : 0);
                var code = alignments.at(columnIndex);
                if (code === 114 /* `r` */) {
                    before = ' '.repeat(size);
                }
                else if (code === 99 /* `c` */) {
                    if (size % 2) {
                        before = ' '.repeat(size / 2 + 0.5);
                        after = ' '.repeat(size / 2 - 0.5);
                    }
                    else {
                        before = ' '.repeat(size / 2);
                        after = before;
                    }
                }
                else {
                    after = ' '.repeat(size);
                }
            }
            if (options.delimiterStart !== false && !columnIndex) {
                line.push('|');
            }
            if (options.padding !== false &&
                // Don’t add the opening space if we’re not aligning and the cell is
                // empty: there will be a closing space.
                !(options.alignDelimiters === false && cell === '') &&
                (options.delimiterStart !== false || columnIndex)) {
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
        lines.push(options.delimiterEnd === false ? line.join('').replace(/ +$/, '') : line.join(''));
    }
    return lines.join('\n');
}
exports.default = markdownTable;
