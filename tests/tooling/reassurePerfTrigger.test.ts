import {describe, expect, it} from 'bun:test';

import fs from 'fs';

/**
 * The workflow's ordered `paths` list lets a later pattern re-include what an earlier `!exclude`
 * dropped (https://github.com/orgs/community/discussions/60317), so this test replays that order.
 */

const PERF_WORKFLOW = '.github/workflows/reassurePerformanceTests.yml';

// eslint-disable-next-line @typescript-eslint/naming-convention -- `pull_request` is GitHub's YAML key
type Workflow = {on: {pull_request: {paths: string[]}}};

function readWorkflow(path: string): Workflow {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Bun.YAML.parse returns unknown
    return Bun.YAML.parse(fs.readFileSync(path, 'utf8')) as Workflow;
}

// Mirrors GitHub's filter patterns: `**` crosses `/`, a lone `*` and `?` do not.
function globToRegExp(glob: string): RegExp {
    const escaped = glob.replaceAll(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll(/\*\*|\*|\?/g, (token) => {
        if (token === '**') {
            return '.*';
        }
        return token === '*' ? '[^/]*' : '[^/]';
    });
    return new RegExp(`^${escaped}$`);
}

// Mirrors GitHub: patterns apply in order, last match (positive or negated) wins.
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
    // A wrongly skipped path lets a regression merge unmeasured, so cover each re-include and Jest input
    // next to an exclusion.
    it.each([
        ['src/x.ts', true],
        ['tests/unit/A.test.ts', false],
        ['tests/perf-test/A.perf-test.tsx', true],
        ['tests/utils/TestHelper.ts', true],
        ['tests/__mocks__/x.ts', true],
        ['tests/unit/currencyList.json', true],
        ['config/babel/oxcJestTransformer.js', true],
        ['config/proxyConfig.ts', true],
        ['scripts/x.sh', false],
        ['src/x.sh', false],
        ['README.md', false],
        ['.github/workflows/reassurePerformanceTests.yml', true],
        ['.github/workflows/seedJestPerfCache.yml', true],
        ['.github/actions/javascript/validateReassureOutput/index.js', true],
        ['.github/actions/composite/setupNode/action.yml', true],
    ])('%s triggers the check: %p', (filePath, expectedToRun) => {
        // Given the perf workflow's ordered `paths` list read straight from the committed YAML
        // When a PR touches only this one path
        // Then whether the check is created must match what the measurement can actually observe,
        // not an incidental side effect of exclusion order
        expect(pathTriggersRun(paths, filePath)).toBe(expectedToRun);
    });
});
