"use strict";
/*
 * Note: This file is separated from StringUtils because it is imported by a ts-node script.
 *       ts-node scripts can't import react-native (because it is written in flow),
 *       and StringUtils indirectly imports react-native.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dedent;
/**
 * Find the minimum indentation of any line in the string,
 * and remove that number of leading spaces from every line in the string.
 *
 * It also removes at most one leading newline, to reflect a common usage:
 *
 * ```
 * StringUtils.dedent(`
 *    const myIndentedStr = 'Hello, world!';
 *    console.log(myIndentedStr);
 * `)
 * ```
 *
 * This implementation assumes you'd want that to be:
 *
 * ```
 * const myIndentedStr = 'Hello, world!';
 * console.log(myIndentedStr);
 *
 * ```
 *
 * Rather than:
 *
 * ```
 *
 * const myIndentedStr = 'Hello, world!';
 * console.log(myIndentedStr);
 *
 * ```
 */
function dedent(str) {
    var _a, _b;
    // Remove at most one leading newline
    var stringWithoutLeadingNewlines = str.replace(/^\r?\n/, '');
    // Split string by remaining newlines
    var lines = stringWithoutLeadingNewlines.replace(/\r\n/g, '\n').split('\n');
    // Find the minimum indentation of non-empty lines
    var minIndent = Number.MAX_SAFE_INTEGER;
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (line.trim().length === 0) {
            // eslint-disable-next-line no-continue
            continue;
        }
        var indentation = (_b = (_a = line.match(/^ */)) === null || _a === void 0 ? void 0 : _a[0].length) !== null && _b !== void 0 ? _b : 0;
        if (indentation < minIndent) {
            minIndent = indentation;
        }
    }
    // Remove the common indentation
    return lines.map(function (line) { return line.slice(minIndent); }).join('\n');
}
