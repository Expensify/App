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
 * patterns keep matching the lines they were written for, and string bodies are
 * emitted verbatim so that this can never delete code.
 */

/**
 * Swift and Kotlin nest block comments; C, C++, Objective-C, Java and Groovy do
 * not. Treating a nested opener as nesting in the languages that do not would
 * swallow every line between the comment's real end and the next closer, which
 * silently shrinks the set of declarations and imports the checks can see.
 */
type CommentFlavor = 'c' | 'swift' | 'kotlin' | 'ruby' | 'xml';

const NESTING_FLAVORS = new Set<CommentFlavor>(['swift', 'kotlin']);

/**
 * Swift has no char literal, so a lone apostrophe there is punctuation rather
 * than the start of one. Everywhere else `'...'` is a char literal, or in Groovy
 * a string, and has to be consumed as one.
 */
const CHAR_LITERAL_FLAVORS = new Set<CommentFlavor>(['c', 'kotlin']);

/**
 * The comment flavor a file extension implies. Anything unrecognised is treated
 * as the non-nesting C family, which is the safe default: it can leave a comment
 * standing, but it can never discard code.
 */
function flavorForExtension(extension: string): CommentFlavor {
    if (extension === '.swift') {
        return 'swift';
    }
    if (extension === '.kt' || extension === '.kts') {
        return 'kotlin';
    }
    if (extension === '.xml') {
        return 'xml';
    }
    return 'c';
}

/**
 * The delimiter that closes a string starting at `index`, and its length, or
 * undefined when no string starts there. Handles `"`, triple-quoted blocks, and
 * Swift raw strings such as `#"..."#` and `##"..."##`.
 */
function stringOpener(source: string, index: number, flavor: CommentFlavor): {open: string; close: string} | undefined {
    if (flavor === 'swift') {
        const raw = /^(#+)"(#*)/.exec(source.slice(index, index + 16));
        const hashes = raw?.at(1);
        if (hashes) {
            const isTriple = source.startsWith(`${hashes}"""`, index);
            return {open: isTriple ? `${hashes}"""` : `${hashes}"`, close: isTriple ? `"""${hashes}` : `"${hashes}`};
        }
    }
    if (source.startsWith('"""', index)) {
        return {open: '"""', close: '"""'};
    }
    if (source[index] === '"') {
        return {open: '"', close: '"'};
    }
    if (source[index] === "'" && CHAR_LITERAL_FLAVORS.has(flavor)) {
        return {open: "'", close: "'"};
    }
    return undefined;
}

function stripCFamilyComments(source: string, flavor: CommentFlavor): string {
    const nested = NESTING_FLAVORS.has(flavor);
    let output = '';
    let index = 0;
    let blockDepth = 0;

    while (index < source.length) {
        if (blockDepth > 0) {
            if (nested && source.startsWith('/*', index)) {
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

        const delimiter = stringOpener(source, index, flavor);
        if (delimiter) {
            output += delimiter.open;
            index += delimiter.open.length;
            while (index < source.length) {
                if (source[index] === '\\') {
                    output += source.slice(index, index + 2);
                    index += 2;
                    continue;
                }
                if (source.startsWith(delimiter.close, index)) {
                    // A triple-quoted body ending in a quote puts four or more
                    // quotes in a row; the closer is the last three of the run.
                    let run = index;
                    while (delimiter.close.startsWith('"""') && source[run + delimiter.close.length] === '"') {
                        output += source[run];
                        run++;
                    }
                    output += source.slice(run, run + delimiter.close.length);
                    index = run + delimiter.close.length;
                    break;
                }
                // An unterminated char literal is far more likely to be an
                // apostrophe than a literal, so do not let it swallow the file.
                if (source[index] === '\n' && delimiter.close === "'") {
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
    // An unterminated opener runs to the end of the file; leaving it in place
    // would keep whatever was commented out at the end of a layout counting as a
    // live resource reference.
    return source.replaceAll(/<!--(?:[\s\S]*?-->|[\s\S]*$)/g, (comment) => comment.replaceAll(/[^\n]/g, ''));
}

function stripComments(source: string, flavor: CommentFlavor): string {
    if (flavor === 'ruby') {
        return stripRubyComments(source);
    }
    if (flavor === 'xml') {
        return stripXmlComments(source);
    }
    return stripCFamilyComments(source, flavor);
}

export type {CommentFlavor};
export {stripComments, flavorForExtension};
