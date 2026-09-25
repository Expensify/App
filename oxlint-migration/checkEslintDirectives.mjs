#!/usr/bin/env node
import {Linter} from 'eslint';
// Differential test for config/oxlint/eslintDirectives.mjs. The module re-implements ESLint's
// directive resolution so a hosted rule answers to the id ESLint uses, and the only trustworthy
// oracle for "what would ESLint have done" is ESLint. Every case below is linted twice: once by the
// installed ESLint with `eqeqeq` and its own directive handling, once by the module's wrapper with
// the same directives and the rule id `eqeqeq`. The two line sets have to match.
//
// The module can only drop reports, never restore them, and oxlint's own directive engine already
// drops everything after a bare `/* eslint-disable */` (it does not implement the rule-specific
// enable below). So a divergence here is not visible in `npx oxlint` output today. It is still worth
// holding: the module's whole contract is "decide what ESLint would have decided", and the parked
// hosted-rule plan in section 5.1 of the migration doc routes more rules through it.
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {withEslintDirectiveIds} from '../config/oxlint/eslintDirectives.mjs';

const ESLINT_RULE_ID = 'eqeqeq';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// `a == 1` on its own line, one per line, so a case is written as a list of lines and the reported
// line numbers are readable straight off it.
const CASES = {
    'no directives': ['a == 1;'],
    'blanket disable': ['/* eslint-disable */', 'a == 1;'],
    'blanket disable, then specific enable': ['/* eslint-disable */', 'a == 1;', '/* eslint-enable eqeqeq */', 'b == 2;', 'c == 3;'],
    'blanket disable, then enable of another rule': ['/* eslint-disable */', 'a == 1;', '/* eslint-enable no-unused-labels */', 'b == 2;'],
    'two blanket disables, then specific enable': ['/* eslint-disable */', '/* eslint-disable */', 'a == 1;', '/* eslint-enable eqeqeq */', 'b == 2;'],
    'blanket disable, specific enable, blanket disable again': ['/* eslint-disable */', 'a == 1;', '/* eslint-enable eqeqeq */', 'b == 2;', '/* eslint-disable */', 'c == 3;'],
    'blanket disable, specific enable, specific disable again': ['/* eslint-disable */', 'a == 1;', '/* eslint-enable eqeqeq */', 'b == 2;', '/* eslint-disable eqeqeq */', 'c == 3;'],
    'specific disable, then blanket enable': ['/* eslint-disable eqeqeq */', 'a == 1;', '/* eslint-enable */', 'b == 2;'],
    'specific disable, then specific enable': ['/* eslint-disable eqeqeq */', 'a == 1;', '/* eslint-enable eqeqeq */', 'b == 2;'],
    'multi-rule disable list, specific enable of one': ['/* eslint-disable eqeqeq, no-unused-labels */', 'a == 1;', '/* eslint-enable eqeqeq */', 'b == 2;'],
    'specific enable with nothing open': ['/* eslint-enable eqeqeq */', 'a == 1;'],
    'specific enable before the disable it names': ['/* eslint-enable eqeqeq */', '/* eslint-disable eqeqeq */', 'a == 1;'],
    'justifications on both directives': ['/* eslint-disable -- because reasons */', 'a == 1;', '/* eslint-enable eqeqeq -- back on */', 'b == 2;'],
    'disable-next-line under a blanket disable': ['/* eslint-disable */', '// eslint-disable-next-line eqeqeq', 'a == 1;', 'b == 2;'],
    'disable-next-line after a specific enable': ['/* eslint-disable */', '/* eslint-enable eqeqeq */', '// eslint-disable-next-line eqeqeq', 'a == 1;', 'b == 2;'],
    'disable-next-line on its own': ['// eslint-disable-next-line eqeqeq', 'a == 1;', 'b == 2;'],
    'disable-line on its own': ['a == 1; // eslint-disable-line eqeqeq', 'b == 2;'],
    'blanket disable-next-line': ['// eslint-disable-next-line', 'a == 1;', 'b == 2;'],
    'a multi-line disable-next-line, which ESLint applies to the line after it closes': ['/* eslint-disable-next-line', '   eqeqeq */', 'a == 1;', 'b == 2;'],
    'a multi-line disable-line, which ESLint rejects': ['a == 1; /* eslint-disable-line', '   eqeqeq */', 'b == 2;'],
    'a multi-line block disable': ['/* eslint-disable', '   eqeqeq */', 'a == 1;'],
    'a multi-line block disable, then a multi-line block enable': ['/* eslint-disable', '   eqeqeq */', 'a == 1;', '/* eslint-enable', '   eqeqeq */', 'b == 2;'],
};

const linter = new Linter();

// What ESLint reports, directives and all.
function eslintLines(source) {
    return linter
        .verify(source, {files: ['**/*.js'], rules: {[ESLINT_RULE_ID]: 'error'}, linterOptions: {reportUnusedDisableDirectives: 'off'}}, 'probe.js')
        .filter((message) => message.ruleId === ESLINT_RULE_ID)
        .map((message) => message.line);
}

// The comment list the module reads, taken from ESLint's own parse rather than from espree directly:
// espree is only a transitive dependency here, `eslint` is a declared one. A rule still runs under a
// blanket `eslint-disable`, only its reports are dropped, so this sees every comment.
function commentsOf(source) {
    let comments = [];
    const capture = {
        create(context) {
            comments = (context.sourceCode ?? context.getSourceCode()).getAllComments();
            return {};
        },
    };
    linter.verify(source, {files: ['**/*.js'], plugins: {probe: {rules: {capture}}}, rules: {'probe/capture': 'error'}}, 'probe.js');
    return comments;
}

// What the module lets through, asked the way a hosted rule asks it: report on every `==` line and
// see which survive. A fresh filename per case, because the module caches parsed directives by name.
function moduleLines(source, filename) {
    const reported = [];
    let innerContext;
    const rule = withEslintDirectiveIds(
        {
            meta: {schema: []},
            create(context) {
                innerContext = context;
                return {};
            },
        },
        ESLINT_RULE_ID,
    );

    const comments = commentsOf(source);
    rule.create({
        filename,
        sourceCode: {getAllComments: () => comments},
        report: (descriptor) => reported.push(descriptor.loc.line),
    });

    for (const [index, text] of source.split('\n').entries()) {
        if (!text.includes('==')) {
            continue;
        }
        innerContext.report({loc: {line: index + 1, column: 0}, message: 'probe'});
    }
    return reported;
}

let failed = false;
for (const [label, lines] of Object.entries(CASES)) {
    const source = `${lines.join('\n')}\n`;
    const expected = eslintLines(source);
    const actual = moduleLines(source, path.join(repoRoot, `probe-${label.replaceAll(/\W+/g, '-')}.js`));
    const ok = JSON.stringify(expected) === JSON.stringify(actual);
    failed ||= !ok;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}  eslint [${expected.join(',')}], module [${actual.join(',')}]`);
}

console.log(failed ? '\nFAILED' : `\nAll ${Object.keys(CASES).length} cases match ESLint ${new Linter().version}.`);
process.exit(failed ? 1 : 0);
