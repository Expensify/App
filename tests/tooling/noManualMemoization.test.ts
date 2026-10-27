import {describe, expect, it} from 'bun:test';

import type {Rule} from 'eslint';

import {Linter} from 'eslint';

import {didBothCompilersMemoizeFile} from '../../config/reactCompiler/checkBoth.mjs';
import * as rule from '../../eslint-plugin-local-rules/no-manual-memoization';
import {normalizeESLintResults} from '../../scripts/lint/eslint/ESLintLinter';
import {filterReactCompilerMessages} from '../../scripts/lint/processors/ReactCompilerFilter';

function isRuleModule(value: unknown): value is Rule.RuleModule {
    return typeof value === 'object' && value !== null && typeof Reflect.get(value, 'create') === 'function';
}

function lint(code: string) {
    const ruleModule: unknown = rule;
    if (!isRuleModule(ruleModule)) {
        throw new TypeError('Expected a local ESLint rule module');
    }
    const ruleName = 'no-manual-memoization';
    const ruleID = `rulesdir/${ruleName}`;
    return new Linter().verify(code, {
        languageOptions: {ecmaVersion: 2022, sourceType: 'module'},
        plugins: {rulesdir: {rules: {[ruleName]: ruleModule}}},
        rules: {[ruleID]: 'error'},
    });
}

describe('no-manual-memoization', () => {
    it.each([
        {source: "import {useMemo} from 'react'; function useExample(name) { return useMemo(() => ({name}), [name]); }", shouldForbid: true},
        {
            source: "import {useMemo, useRef} from 'react'; function useExample(name) { const ref = useRef(); ref.current = name; return useMemo(() => ({name}), [name]); }",
            shouldForbid: false,
        },
    ])('enforces the real compiler verdict: $shouldForbid', async ({source, shouldForbid}) => {
        // Given a hook that either compiles on both platforms or violates the rules for refs.
        const filename = '/repo/src/useExample.ts';
        const [{messages}] = normalizeESLintResults([{filePath: filename, messages: lint(source)}]);
        expect(messages).toHaveLength(1);

        // When the production compiler helpers determine whether manual memoization is redundant.
        const bothMemoized = didBothCompilersMemoizeFile(source, filename);
        const filtered = await filterReactCompilerMessages(messages, '/repo', () => bothMemoized);

        // Then the lint pipeline enforces the restriction only for automatically memoized code.
        expect(bothMemoized).toBe(shouldForbid);
        expect(filtered).toHaveLength(shouldForbid ? 1 : 0);
    });

    it.each([
        "import {useMemo} from 'react'; const value = useMemo(() => 1, []);",
        "import {useCallback} from 'react'; const fn = useCallback(() => 1, []);",
        "import {memo} from 'react'; const Component = memo(() => null);",
        "import {useMemo as cache} from 'react'; const value = cache(() => 1, []);",
        "import R from 'react'; const value = R.useMemo(() => 1, []);",
        "import * as R from 'react'; const Component = R.memo(() => null);",
        "import R from 'react'; const value = R['useMemo'](() => 1, []);",
        "import {useCallback} from 'react'; function useFocusEffect(fn) {} useFocusEffect(useCallback(() => {}, []));",
    ])('reports React memoization: %s', (code) => {
        // Given manual memoization imported from React, including aliases and namespace imports.
        // When the rule inspects the call.
        const messages = lint(code);

        // Then it reports the wrapper for compiler-aware filtering.
        expect(messages).toHaveLength(1);
        expect(messages.at(0)?.messageId).toBe('redundant');
    });

    it.each([
        'const value = 1;',
        "import {memo} from 'other'; const value = memo(() => 1);",
        "import React from 'react'; function fn(React) { return React.useMemo(() => 1, []); }",
        "import {useMemo} from 'react'; function fn(useMemo) { return useMemo(() => 1, []); }",
        "import {useFocusEffect} from '@react-navigation/native'; import {useCallback} from 'react'; useFocusEffect(useCallback(() => {}, []));",
        "import {useFocusEffect} from '@react-navigation/core'; import {useCallback} from 'react'; useFocusEffect(useCallback(() => {}, []));",
        "import {useFocusEffect as focus} from '@react-navigation/native'; import {useCallback as callback} from 'react'; focus(callback(() => {}, []));",
        "import * as Navigation from '@react-navigation/native'; import React from 'react'; Navigation.useFocusEffect(React.useCallback(() => {}, []));",
        "import {useFocusEffect} from '@react-navigation/native'; import {useCallback} from 'react'; const callback = useCallback(() => {}, []); useFocusEffect(callback);",
    ])('allows plain values and focus callbacks: %s', (code) => {
        // Given plain rendering, a non-React function, or a callback React Navigation requires to be stable.
        // When inspecting its resolved import rather than just the function name.
        const messages = lint(code);

        // Then it is not mistaken for redundant memoization.
        expect(messages).toEqual([]);
    });
});
