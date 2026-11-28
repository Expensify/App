/**
 * Finds DOM library files in the output of `tsc --listFilesOnly --explainFiles`, with the reasons tsc gives for loading them.
 *
 * The native project must never load the DOM lib: a dependency's `/// <reference lib="dom" />` would silently make every
 * DOM global valid in native code again, which is how the first attempt at the native project passed CI with DOM types in it.
 */

// Matches lib.dom.d.ts, the other lib.dom.*.d.ts files and the web worker libs, which declare the same globals.
const DOM_LIBRARY_REGEX = /(^|\/)lib\.(dom|webworker)(\.[\w]+)*\.d\.ts$/;

type DomLibrary = {
    file: string;

    /** The lines tsc prints under the file to explain why it is in the program */
    reasons: string[];
};

function findDomLibraries(explainFilesOutput: string): DomLibrary[] {
    const domLibraries: DomLibrary[] = [];
    let current: DomLibrary | undefined;

    for (const line of explainFilesOutput.split(/\r?\n/)) {
        // tsc prints each file unindented, followed by its reasons indented underneath.
        if (/^\s/.test(line)) {
            if (current && line.trim()) {
                current.reasons.push(line.trim());
            }
            continue;
        }
        current = DOM_LIBRARY_REGEX.test(line.trim()) ? {file: line.trim(), reasons: []} : undefined;
        if (current) {
            domLibraries.push(current);
        }
    }

    return domLibraries;
}

export default findDomLibraries;
export type {DomLibrary};
