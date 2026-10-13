import {describe, expect, it} from 'bun:test';

import fs from 'fs';

/**
 * reassurePerformanceTests.yml triggers on one ordered `paths` list rather than `paths-ignore`, so a
 * later pattern can re-include a file a broader `!exclude` already dropped (GitHub's documented
 * ordered-paths behavior: https://github.com/orgs/community/discussions/60317). Evaluating that order
 * is the only way to tell, from outside the workflow, which files the perf check actually measures.
 */

const PERF_WORKFLOW = '.github/workflows/reassurePerformanceTests.yml';

// eslint-disable-next-line @typescript-eslint/naming-convention -- `pull_request` is the YAML key GitHub Actions defines, not a name this repo chooses
type Workflow = {on: {pull_request: {paths: string[]}}};

function readWorkflow(path: string): Workflow {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Bun.YAML.parse returns unknown, and the one field this test reads is a plain string array, so a shape mismatch fails an assertion rather than throwing
    return Bun.YAML.parse(fs.readFileSync(path, 'utf8')) as Workflow;
}

/**
 * `*` in these workflow path patterns only ever appears as part of `**`, so a run of one or more `*`
 * can be converted to `.*` without distinguishing `*` from `**`. The regex is matched against the
 * whole path (`^...$`), so, unlike shell globs, a leading dot needs no special-casing to match `.*`.
 */
function globToRegExp(glob: string): RegExp {
    const escaped = glob.replaceAll(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll(/\*+/g, '.*');
    return new RegExp(`^${escaped}$`);
}

/**
 * Mirrors GitHub's own evaluation: patterns apply in order, and whichever one (positive or negated)
 * last matches the path decides whether it runs.
 */
function pathTriggersRun(patterns: string[], filePath: string): boolean {
    let included = false;
    for (const pattern of patterns) {
        const isNegated = pattern.startsWith('!');
        const glob = isNegated ? pattern.slice(1) : pattern;
        if (globToRegExp(glob).test(filePath)) {
            included = !isNegated;
        }
    }
    return included;
}

const paths = readWorkflow(PERF_WORKFLOW).on.pull_request.paths;

describe('Reassure perf trigger paths', () => {
    describe.each([
        ['src/x.ts', true],
        ['tests/perf-test/A.perf-test.tsx', true],
        ['tests/unit/A.test.ts', false],
        ['tests/unit/currencyList.json', true],
        ['ios/Podfile', false],
        ['Mobile-Expensify', false],
        ['.github/workflows/reassurePerformanceTests.yml', true],
        ['.github/workflows/other.yml', false],
        ['tests/perf-test/README.md', false],
        ['scripts/postInstall.sh', true],
        ['.env.example', true],
        ['jest/setup.ts', true],
        ['__mocks__/react-native.ts', true],
        ['web/index.html', false],
        ['config/rsbuild/rsbuild.common.ts', false],
        ['config/babel/oxcJestTransformer.js', true],
        ['eslint.config.mjs', false],
        ['Gemfile.lock', false],
    ])('%s', (filePath, expectedToRun) => {
        it(`${expectedToRun ? 'runs' : 'skips'}`, () => {
            // Given the perf workflow's ordered `paths` list read straight from the committed YAML
            // When a PR touches only this one path
            // Then whether the check is created must match what the measurement can actually observe,
            // not an incidental side effect of exclusion order
            expect(pathTriggersRun(paths, filePath)).toBe(expectedToRun);
        });
    });
});
