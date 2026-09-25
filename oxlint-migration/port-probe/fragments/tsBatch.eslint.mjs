import path from 'node:path';
import {fileURLToPath} from 'node:url';
import tseslint from 'typescript-eslint';

const here = path.dirname(fileURLToPath(import.meta.url));

// Same typed wiring as fragments/typedSample.eslint.mjs: projectService resolves through
// fixtures/tsconfig.json, which is the nearest tsconfig tsgolint picks up on the oxlint side.
// Options are production's, copied from the oxlint.config.mts override that enables each rule for TS
// files (last override wins where a rule appears twice, e.g. no-duplicate-type-constituents).
export default [
    {
        files: ['**/tsBatchA.ts', '**/tsBatchB.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {projectService: true, tsconfigRootDir: path.join(here, '..', 'fixtures'), ecmaFeatures: {jsx: true}},
        },
        plugins: {'@typescript-eslint': tseslint.plugin},
        rules: {
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
            '@typescript-eslint/await-thenable': 'error',
            '@typescript-eslint/ban-ts-comment': 'error',
            '@typescript-eslint/ban-tslint-comment': 'error',
            '@typescript-eslint/class-literal-property-style': 'error',
            '@typescript-eslint/consistent-generic-constructors': 'error',
            '@typescript-eslint/consistent-indexed-object-style': 'error',
            '@typescript-eslint/consistent-type-assertions': 'error',
            '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
            '@typescript-eslint/consistent-type-exports': ['error', {fixMixedExportsWithInlineTypeSpecifier: false}],
            '@typescript-eslint/consistent-type-imports': ['error', {prefer: 'type-imports', fixStyle: 'separate-type-imports'}],
            '@typescript-eslint/dot-notation': ['error', {allowKeywords: true}],
            '@typescript-eslint/no-array-delete': 'error',
            '@typescript-eslint/no-base-to-string': 'error',
            '@typescript-eslint/no-confusing-non-null-assertion': 'error',
            '@typescript-eslint/no-duplicate-enum-values': 'error',
            '@typescript-eslint/no-duplicate-type-constituents': ['error', {ignoreUnions: true}],
            '@typescript-eslint/no-empty-object-type': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-extra-non-null-assertion': 'error',
            '@typescript-eslint/no-for-in-array': 'error',
            '@typescript-eslint/no-implied-eval': 'error',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/no-inferrable-types': 'error',
            '@typescript-eslint/no-misused-new': 'error',
            '@typescript-eslint/no-namespace': 'error',
            '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/no-redundant-type-constituents': 'error',
            '@typescript-eslint/no-restricted-types': ['error', {types: {object: "Use 'Record<string, T>' instead."}}],
            '@typescript-eslint/no-this-alias': 'error',
            '@typescript-eslint/no-unnecessary-type-constraint': 'error',
            '@typescript-eslint/no-unsafe-argument': 'error',
            '@typescript-eslint/no-unsafe-call': 'error',
            '@typescript-eslint/no-unsafe-declaration-merging': 'error',
            '@typescript-eslint/no-unsafe-enum-comparison': 'error',
            '@typescript-eslint/no-unsafe-function-type': 'error',
            '@typescript-eslint/no-unsafe-unary-minus': 'error',
            '@typescript-eslint/no-wrapper-object-types': 'error',
            '@typescript-eslint/non-nullable-type-assertion-style': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/prefer-enum-initializers': 'error',
            '@typescript-eslint/prefer-for-of': 'error',
            '@typescript-eslint/prefer-function-type': 'error',
            '@typescript-eslint/prefer-namespace-keyword': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': ['error', {ignoreIfStatements: true, ignorePrimitives: {}, ignoreTernaryTests: true}],
            '@typescript-eslint/prefer-string-starts-ends-with': 'error',
            '@typescript-eslint/restrict-plus-operands': 'error',
            '@typescript-eslint/restrict-template-expressions': 'error',
            '@typescript-eslint/return-await': ['error', 'in-try-catch'],
            '@typescript-eslint/switch-exhaustiveness-check': ['error', {considerDefaultExhaustiveForUnions: true}],
            '@typescript-eslint/triple-slash-reference': 'error',
            '@typescript-eslint/unbound-method': 'error',
        },
    },
];
