/**
 * Runs both React Compilers (Babel + OXC) against a single source file and reports
 * whether they disagree on memoization.
 *
 * The web build uses OXC (oxc-transform) while Metro/Jest use babel-plugin-react-compiler.
 * When one compiler memoizes a file and the other does not, that file ships without
 * memoization on one platform. `isDivergent` captures exactly that gap by comparing the
 * `memoized` signal (did the compiler actually emit a `_c(...)` cache?) rather than the
 * looser compile-health status, since a file can "compile" without being memoized.
 */
import {checkReactCompilerWithBabel} from './checkWithBabel.mjs';
import {checkReactCompilerWithOxc} from './checkWithOxc.mjs';

/**
 * @returns {{babel: {status: string, memoized: boolean, errors: unknown[]}, oxc: {status: string, memoized: boolean, errors: unknown[]}, isDivergent: boolean}}
 */
function checkBothCompilers(source, filename) {
    const babel = checkReactCompilerWithBabel(source, filename);
    const oxc = checkReactCompilerWithOxc(source, filename);
    const isDivergent = babel.memoized !== oxc.memoized;
    return {babel, oxc, isDivergent};
}

/**
 * True only when BOTH compilers actually memoize the file. Used to decide when manual-memoization
 * lint rules can be safely suppressed: if either platform's compiler skips memoization, the manual
 * memoization is still needed there, so the rules must stay active.
 */
function didBothCompilersMemoizeFile(source, filename) {
    const {babel, oxc} = checkBothCompilers(source, filename);
    return babel.memoized && oxc.memoized;
}

export {checkBothCompilers, didBothCompilersMemoizeFile};
