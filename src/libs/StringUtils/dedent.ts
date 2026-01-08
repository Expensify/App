/*
 * Note: This file is separated from StringUtils because it is imported by a ts-node script.
 *       ts-node scripts can't import react-native (because it is written in flow),
 *       and StringUtils indirectly imports react-native.
 */

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
export default function dedent(str: string): string {
    // Remove at most one leading newline
    const stringWithoutLeadingNewlines = str.replaceAll(/^\r?\n/g, '');

    // Split string by remaining newlines
    const lines = stringWithoutLeadingNewlines.replaceAll('\r\n', '\n').split('\n');

    // Find the minimum indentation of non-empty lines
    let minIndent = Number.MAX_SAFE_INTEGER;
    for (const line of lines) {
        if (line.trim().length === 0) {
            continue;
        }
        const indentation = line.match(/^ */)?.[0].length ?? 0;
        if (indentation < minIndent) {
            minIndent = indentation;
        }
    }

    // Remove the common indentation
    return lines.map((line) => line.slice(minIndent)).join('\n');
}
