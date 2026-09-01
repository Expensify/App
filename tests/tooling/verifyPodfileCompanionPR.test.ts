import {afterAll, beforeAll, describe, expect, it} from 'bun:test';

import {execFileSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const SCRIPT = path.resolve(import.meta.dir, '../../.github/scripts/verifyPodfileCompanionPR.sh');
const COMPANION_LINK = 'MOBILE-EXPENSIFY: https://github.com/Expensify/Mobile-Expensify/pull/1234';

let repo: string;
/** Commit the branch was cut from, and the two tips that diverge from it. */
let baseSha: string;
let headWithPodChange: string;
let headWithoutPodChange: string;
/** Base branch tip, moved on after the branch point. */
let movedBaseSha: string;

function git(...args: string[]): string {
    return execFileSync('git', args, {cwd: repo, encoding: 'utf8'}).trim();
}

/** Writes a minimal lockfile listing one pod at the given version, and commits it. */
function commitLockfile(version: string, message: string): string {
    fs.writeFileSync(path.join(repo, 'ios/Podfile.lock'), ['PODS:', `  - react-native-pager-view (${version}):`, '    - React-Core', '', 'COCOAPODS: 1.16.2', ''].join('\n'));
    git('add', 'ios/Podfile.lock');
    git('commit', '-q', '-m', message);
    return git('rev-parse', 'HEAD');
}

function run(base: string, head: string, prBody: string) {
    const result = Bun.spawnSync([SCRIPT, base, head], {cwd: repo, env: {...process.env, PR_BODY: prBody}});
    return {status: result.exitCode, output: `${result.stdout.toString()}${result.stderr.toString()}`};
}

beforeAll(() => {
    repo = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-companion-pr-'));
    fs.mkdirSync(path.join(repo, 'ios'));
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Test');

    baseSha = commitLockfile('9.0.2', 'Base');

    // A branch that bumps a pod, and a sibling branch that only edits an unrelated file.
    git('checkout', '-q', '-b', 'pod-change');
    headWithPodChange = commitLockfile('8.0.0', 'Downgrade pager-view');

    git('checkout', '-q', '-b', 'no-pod-change', baseSha);
    fs.writeFileSync(path.join(repo, 'README.md'), 'unrelated\n');
    git('add', 'README.md');
    git('commit', '-q', '-m', 'Unrelated change');
    headWithoutPodChange = git('rev-parse', 'HEAD');

    // Someone else lands a lockfile change on the base branch after both branches were cut.
    git('checkout', '-q', 'main');
    movedBaseSha = commitLockfile('9.1.0', 'Bump pager-view on main');
});

afterAll(() => {
    fs.rmSync(repo, {recursive: true, force: true});
});

describe('verifyPodfileCompanionPR', () => {
    it('passes a PR that leaves the lockfile alone', () => {
        expect(run(baseSha, headWithoutPodChange, 'No link here').status).toBe(0);
    });

    it('blocks a dependency change with no companion PR linked', () => {
        const {status, output} = run(baseSha, headWithPodChange, 'No link here');
        expect(status).toBe(1);
        expect(output).toContain('react-native-pager-view');
    });

    it('passes a dependency change that links a companion PR', () => {
        expect(run(baseSha, headWithPodChange, `Fixes something\n\n${COMPANION_LINK}`).status).toBe(0);
    });

    it("rejects the template's unfilled placeholder", () => {
        expect(run(baseSha, headWithPodChange, 'MOBILE-EXPENSIFY: https://github.com/Expensify/Mobile-Expensify/pull/<PR-number>').status).toBe(1);
    });

    it('ignores lockfile changes that landed on the base branch after the branch point', () => {
        // The base SHA a pull_request event reports is the base branch tip, so a two-dot diff would
        // also report main's own lockfile churn, inverted, against every open PR.
        expect(run(movedBaseSha, headWithoutPodChange, 'No link here').status).toBe(0);
    });

    it('fails loudly when the diff cannot be taken', () => {
        // Distinguishing this from "no dependencies changed" is what keeps an unreachable base SHA
        // from silently passing the check.
        const {status, output} = run('0000000000000000000000000000000000000000', headWithPodChange, 'No link here');
        expect(status).toBe(1);
        expect(output).toContain('could not diff');
    });

    it('accepts an explicit declaration that HybridApp is unaffected', () => {
        expect(run(baseSha, headWithPodChange, 'NO-HYBRIDAPP-IMPACT: reverts a NewDot-only pod').status).toBe(0);
        expect(run(baseSha, headWithPodChange, 'NO-HYBRIDAPP-IMPACT:').status).toBe(1);
    });

    it('rejects an unusable invocation rather than guessing', () => {
        expect(Bun.spawnSync([SCRIPT], {cwd: repo}).exitCode).toBe(1);
        expect(Bun.spawnSync([SCRIPT, baseSha], {cwd: repo}).exitCode).toBe(1);
    });
});
