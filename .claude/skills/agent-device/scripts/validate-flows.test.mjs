import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const validatorPath = fileURLToPath(new URL('./validate-flows.mjs', import.meta.url));

function runValidator(files) {
    const directory = mkdtempSync(path.join(tmpdir(), 'agent-device-flows-'));

    try {
        for (const [name, contents] of Object.entries(files)) {
            writeFileSync(path.join(directory, name), contents);
        }

        return spawnSync(process.execPath, [validatorPath, directory], {encoding: 'utf8'});
    } finally {
        rmSync(directory, {recursive: true, force: true});
    }
}

test('accepts executable preconditions and postconditions', () => {
    const result = runValidator({
        'valid.ad': `# @desc Valid flow
# @pre id="Start"
# @post id="End"
is exists "id=\\"Start\\""
press "id=\\"action\\""
wait "id=\\"End\\"" 1000
`,
    });

    assert.equal(result.status, 0, result.stderr);
});

test('rejects metadata-only preconditions and postconditions', () => {
    const result = runValidator({
        'metadata-only.ad': `# @desc Invalid flow
# @pre id="Start"
# @post id="End"
press "id=\\"action\\""
`,
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /@pre is not enforced/);
    assert.match(result.stderr, /@post is not enforced/);
});

test('rejects unsafe click lookup and bare label presses', () => {
    const result = runValidator({
        'unsafe-selectors.ad': `# @desc Invalid selectors
# @pre id="Start"
# @post id="End"
is exists "id=\\"Start\\""
find "Inbox" "click"
press "label=\\"Submit\\""
wait "id=\\"End\\"" 1000
`,
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /find click is not deterministic/);
    assert.match(result.stderr, /bare label press must require hittable=true/);
});

test('allows a bare label alternative only for a declared @unique-label', () => {
    const exempt = runValidator({
        'unique-label.ad': `# @desc Declared unique label
# @pre id="Start"
# @post id="End"
# @unique-label Inbox. Your review is required
is exists "id=\\"Start\\""
press "role=\\"tab\\" label=\\"Inbox\\" || label=\\"Inbox. Your review is required\\""
wait "id=\\"End\\"" 1000
`,
    });

    assert.equal(exempt.status, 0, exempt.stderr);

    const undeclared = runValidator({
        'other-label.ad': `# @desc Undeclared bare label
# @pre id="Start"
# @post id="End"
# @unique-label Inbox. Your review is required
is exists "id=\\"Start\\""
press "role=\\"tab\\" label=\\"Spend\\" || label=\\"Spend\\""
wait "id=\\"End\\"" 1000
`,
    });

    assert.equal(undeclared.status, 1);
    assert.match(undeclared.stderr, /bare label press must require hittable=true/);
});

test('requires a selector wait after opening the floating action menu', () => {
    const result = runValidator({
        'fab-race.ad': `# @desc Invalid FAB transition
# @pre id="Start"
# @post id="End"
is exists "id=\\"Start\\""
press "id=\\"floating-action-button\\""
press "role=\\"button\\" label=\\"Create expense\\""
wait "id=\\"End\\"" 1000
`,
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /floating action menu press must be followed by a selector wait/);
});

test('rejects a reset path that does not exist', () => {
    const result = runValidator({
        'missing-reset.ad': `# @desc Invalid reset
# @pre id="Start"
# @post id="End"
# @reset missing-reset-flow.ad
is exists "id=\\"Start\\""
wait "id=\\"End\\"" 1000
`,
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /@reset path does not exist/);
});

test('requires preconditions before mutations and postconditions after mutations', () => {
    const result = runValidator({
        'misordered-contract.ad': `# @desc Misordered contract
# @pre id="Start"
# @post id="End"
wait "id=\\"End\\"" 1000
press "id=\\"action\\""
is exists "id=\\"Start\\""
`,
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /@pre must be enforced before the first mutation/);
    assert.match(result.stderr, /@post must be enforced after the last mutation/);
});

test('rejects unsafe assertions and non-specific selector ordering', () => {
    const result = runValidator({
        'unsafe-assertions.ad': `# @desc Unsafe assertions
# @pre role="group" label="Start" || id="Start"
# @post label="End"
is exists "role=\\"group\\" label=\\"Start\\" || id=\\"Start\\""
press "id=\\"action\\""
wait "label=\\"End\\"" 1000
`,
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /ID selector must be the first alternative/);
    assert.match(result.stderr, /bare label assertion must require hittable=true/);
});

test('requires one canonical flow when sentry tags overlap', () => {
    const sharedFlow = (measure = '') => `# @desc Shared span
# @pre id="Start"
# @post id="End"
# @tag sentry-SharedSpan
${measure}is exists "id=\\"Start\\""
press "id=\\"action\\""
wait "id=\\"End\\"" 1000
`;
    const invalid = runValidator({
        'first.ad': sharedFlow(),
        'second.ad': sharedFlow(),
    });
    const valid = runValidator({
        'first.ad': sharedFlow('# @measure canonical\n'),
        'second.ad': sharedFlow(),
    });

    assert.equal(invalid.status, 1);
    assert.match(invalid.stderr, /sentry-SharedSpan is declared by multiple flows without one canonical @measure/);
    assert.equal(valid.status, 0, valid.stderr);
});
