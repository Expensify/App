import {register} from 'module';
import {pathToFileURL} from 'url';

let hasRegisteredEsmLoader = false;

/**
 * `@actions/core`, `@actions/github`, and `GithubUtils`/`GitUtils`/`CONST`/`DeployChecklistUtils` (transitively, via
 * `.github/libs/package.json`'s `"type": "module"`) are ESM-only. Several developer scripts under `scripts/` need
 * them but must themselves stay CommonJS, either because they're required by other CJS tooling, or because they
 * transitively import huge swaths of the (CommonJS-oriented) app source under `src/`.
 *
 * Registering the `ts-node/esm` loader at runtime lets a CommonJS script load these ESM-only dependencies on demand
 * via dynamic `import()`, without forcing the whole script (and its dependents) to become ESM.
 */
async function importEsmOnlyGithubDeps() {
    if (!hasRegisteredEsmLoader) {
        register('ts-node/esm', pathToFileURL('./'));
        hasRegisteredEsmLoader = true;
    }

    const [{default: GitHubUtils}, {default: CONST}, {default: GitUtils}, deployChecklistUtils, actionsCore, actionsGithub] = await Promise.all([
        import('../../.github/libs/GithubUtils.js'),
        import('../../.github/libs/CONST.js'),
        import('../../.github/libs/GitUtils.js'),
        import('../../.github/libs/DeployChecklistUtils.js'),
        import('@actions/core'),
        import('@actions/github'),
    ]);

    return {GitHubUtils, CONST, GitUtils, deployChecklistUtils, core: actionsCore, github: actionsGithub};
}

export default importEsmOnlyGithubDeps;
