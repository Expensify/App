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
import checkReactCompilerWithBabel from './checkWithBabel.mjs';
import checkReactCompilerWithOxc from './checkWithOxc.mjs';

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
 * True only when BOTH compilers fully compile and memoize the file. Used to decide when
 * manual-memoization lint rules can be safely suppressed: if either platform's compiler skips
 * memoization (or bails on a Rules-of-React violation), the manual memoization is still needed there,
 * so the rules must stay active.
 *
 * Babel's `memoized` can be true while its `status` is `failed` (one function fails to compile while
 * another still emits a memo cache); in that case the failed function is NOT auto-memoized, so we must
 * not suppress the rules. This matches the pre-OXC processor, which suppressed only when Babel fully
 * compiled the file.
 *
 * OXC is checked first and short-circuits, so the (heavier) Babel analysis is skipped for files OXC
 * does not memoize. This keeps the ESLint processor, which calls this for every linted file, cheap.
 * (OXC's `memoized` is only true when its status is `compiled`, so no separate OXC status check is needed.)
 */
function didBothCompilersMemoizeFile(source, filename) {
    if (!checkReactCompilerWithOxc(source, filename).memoized) {
        return false;
    }
    const babel = checkReactCompilerWithBabel(source, filename);
    return babel.memoized && babel.status !== 'failed';
}

export {checkBothCompilers, didBothCompilersMemoizeFile};
