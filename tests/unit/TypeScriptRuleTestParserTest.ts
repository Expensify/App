/** @jest-environment node */
import type {Rule} from 'eslint';

import {Linter} from 'eslint';

import tsParser from '../utils/typeScriptRuleTestParser';

const nativeRequire = process.getBuiltinModule('module').createRequire(__filename);
const namingModule: unknown = nativeRequire('../../config/oxlint/vendor/naming-convention.mjs');
const namingRule: unknown = typeof namingModule === 'object' && namingModule !== null ? Reflect.get(namingModule, 'default') : undefined;

function isRuleModule(rule: unknown): rule is Rule.RuleModule {
    return typeof rule === 'object' && rule !== null && typeof Reflect.get(rule, 'create') === 'function';
}

if (!isRuleModule(namingRule)) {
    throw new TypeError('Expected the syntax-only naming convention rule.');
}

describe('TypeScript rule-test parser syntax modes', () => {
    it.each([
        {filename: 'fixture.ts', jsx: false, code: 'const x = <number>foo;', valid: true},
        {filename: 'fixture.ts', jsx: true, code: 'const x = <T>(x: T) => x;', valid: true},
        {filename: 'fixture.ts', jsx: true, code: 'const x = <div/>;', valid: false},
        {filename: 'fixture.tsx', jsx: undefined, code: 'const x = <div/>;', valid: true},
        {filename: 'fixture.tsx', jsx: false, code: 'const x = <div/>;', valid: true},
        {filename: 'fixture.tsx', jsx: false, code: 'const x = <number>foo;', valid: false},
        {filename: 'fixture.cts', jsx: true, code: 'const x = <number>foo;', valid: true},
        {filename: 'fixture.mts', jsx: true, code: 'const x = <T>(x: T) => x;', valid: true},
        {filename: 'fixture.js', jsx: false, code: 'const x = <div/>;', valid: true},
        {filename: 'fixture.jsx', jsx: false, code: 'const x = <div/>;', valid: true},
        {filename: 'fixture.unknown', jsx: false, code: 'const x = <number>foo;', valid: true},
        {filename: 'fixture.unknown', jsx: true, code: 'const x = <div/>;', valid: true},
        {filename: 'fixture.ts', jsx: false, code: '@sealed class C {}', valid: true},
        {filename: 'fixture.ts', jsx: false, code: 'class C {accessor foo = 1;}', valid: true},
    ])('preserves the syntax mode of $filename with JSX=$jsx', ({filename, jsx, code, valid}) => {
        // Given a known extension that overrides JSX options, or an unknown one that respects them,
        // When ESLint uses both the tokenizer and AST parser,
        // eslint-disable-next-line @typescript-eslint/naming-convention -- ESLint rule IDs contain punctuation and cannot be renamed.
        const messages = new Linter().verify(code, [{files: ['**/*.*'], languageOptions: {parser: tsParser, parserOptions: {ecmaFeatures: {jsx}}}, rules: {'no-debugger': 'error'}}], {
            filename,
        });

        // Then valid syntax stays accepted and the opposite language variant stays rejected.
        if (valid) {
            expect(messages).toEqual([]);
        } else {
            expect(messages).toHaveLength(1);
            expect(messages.at(0)?.fatal).toBe(true);
        }
    });
});

describe('syntax-only naming convention Unicode parity', () => {
    it.each([
        {key: "'𝒜'", errors: ['doesNotMatchFormat']},
        {key: '𝒜', errors: ['doesNotMatchFormat']},
        {key: "'a𝒜'", errors: ['doesNotMatchFormat']},
        {key: 'a𝒜', errors: ['doesNotMatchFormat']},
        {key: "'É'", errors: []},
        {key: 'É', errors: []},
    ])('preserves the property diagnostic for $key', ({key, errors}) => {
        // Given App's variable/property naming options and a quoted or unquoted Unicode key,
        const options = [
            {selector: ['variable', 'property'], format: null, filter: {regex: '^__esModule$', match: true}},
            {selector: ['variable', 'property'], format: ['camelCase', 'UPPER_CASE', 'PascalCase'], filter: {regex: '^private_[a-z][a-zA-Z0-9]*$', match: false}},
        ];

        // When the rule checks the original UTF-16 code units rather than combined surrogate pairs,
        const messages = new Linter().verify(
            `const object = {${key}: 1};`,
            // eslint-disable-next-line @typescript-eslint/naming-convention -- ESLint plugin rule IDs require a slash between the plugin and rule names.
            [{files: ['**/*.ts'], languageOptions: {parser: tsParser}, plugins: {test: {rules: {naming: namingRule}}}, rules: {'test/naming': ['error', ...options]}}],
            {filename: 'fixture.ts'},
        );

        // Then astral keys retain their existing diagnostic while BMP identifiers remain valid.
        expect(messages.map((message) => message.messageId)).toEqual(errors);
    });
});
