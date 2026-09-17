/**
 * Comment stripping for the native dependency checks.
 *
 * Both checks decide whether a declaration is alive by matching patterns against
 * source text. Matching raw text counts a commented-out import as a live
 * reference, and reads a commented-out declaration as a real one, so every
 * declaration a developer parks behind a comment while debugging either keeps a
 * dead dependency green or fails the check for something Gradle never sees.
 * Stripping comments first is what makes both answers honest.
 *
 * Newlines inside a stripped comment are preserved so that line-anchored
 * patterns keep matching the lines they were written for.
 */

type CommentFlavor = 'c' | 'ruby' | 'xml';

/**
 * `//`, `/* *\/` (nested, as Swift allows), double-quoted strings including
 * Swift and Kotlin `"""` blocks, and single-quoted Java and Kotlin char literals.
 */
function stripCFamilyComments(source: string): string {
    let output = '';
    let index = 0;
    let blockDepth = 0;

    while (index < source.length) {
        const rest = source.startsWith('"""', index) ? '"""' : source[index];

        if (blockDepth > 0) {
            if (source.startsWith('/*', index)) {
                blockDepth++;
                index += 2;
            } else if (source.startsWith('*/', index)) {
                blockDepth--;
                index += 2;
            } else {
                if (source[index] === '\n') {
                    output += '\n';
                }
                index++;
            }
            continue;
        }

        if (source.startsWith('//', index)) {
            while (index < source.length && source[index] !== '\n') {
                index++;
            }
            continue;
        }

        if (source.startsWith('/*', index)) {
            blockDepth = 1;
            index += 2;
            continue;
        }

        if (rest === '"""' || rest === '"' || rest === "'") {
            const delimiter = rest;
            output += delimiter;
            index += delimiter.length;
            while (index < source.length) {
                if (source[index] === '\\') {
                    output += source.slice(index, index + 2);
                    index += 2;
                    continue;
                }
                if (source.startsWith(delimiter, index)) {
                    output += delimiter;
                    index += delimiter.length;
                    break;
                }
                // An unterminated single-quote is far more likely to be an
                // apostrophe than a char literal, so do not let it swallow the
                // rest of the file.
                if (source[index] === '\n' && delimiter === "'") {
                    break;
                }
                output += source[index];
                index++;
            }
            continue;
        }

        output += source[index];
        index++;
    }

    return output;
}

/**
 * `#` line comments and `=begin` / `=end` blocks, leaving `#` inside strings and
 * `#{}` interpolation alone.
 */
function stripRubyComments(source: string): string {
    const lines = source.split('\n');
    const output: string[] = [];
    let inBlock = false;

    for (const line of lines) {
        if (inBlock) {
            output.push('');
            if (/^=end\b/.test(line)) {
                inBlock = false;
            }
            continue;
        }
        if (/^=begin\b/.test(line)) {
            inBlock = true;
            output.push('');
            continue;
        }

        let stripped = '';
        let quote: string | undefined;
        for (let index = 0; index < line.length; index++) {
            const character = line[index];
            if (quote) {
                stripped += character;
                if (character === '\\') {
                    stripped += line[index + 1] ?? '';
                    index++;
                } else if (character === quote) {
                    quote = undefined;
                }
                continue;
            }
            if (character === '"' || character === "'") {
                quote = character;
                stripped += character;
                continue;
            }
            if (character === '#') {
                break;
            }
            stripped += character;
        }
        output.push(stripped);
    }

    return output.join('\n');
}

function stripXmlComments(source: string): string {
    return source.replaceAll(/<!--[\s\S]*?-->/g, (comment) => comment.replaceAll(/[^\n]/g, ''));
}

function stripComments(source: string, flavor: CommentFlavor): string {
    if (flavor === 'ruby') {
        return stripRubyComments(source);
    }
    if (flavor === 'xml') {
        return stripXmlComments(source);
    }
    return stripCFamilyComments(source);
}

export type {CommentFlavor};
export {stripComments};
