import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import tseslint from 'typescript-eslint';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
// eslint-plugin-jsx-a11y is not a direct dependency (it arrives through eslint-config-expensify),
// so it is resolved by absolute path from the repo's node_modules rather than by bare specifier --
// the same way the base config loads every plugin it does not own.
const jsxA11y = require(path.resolve(here, '../../..', 'node_modules/eslint-plugin-jsx-a11y'));

// Two scoped blocks, mirroring the oxlint shard one for one: each rule is on only where a fixture
// makes a claim about it, so a control in the other file cannot add an unclaimed finding.
// The plugin is declared here rather than in the base config because the base config does not have
// it at all -- ESLint 9 rejects a second declaration of a name it already knows, but jsx-a11y is a
// fresh name in this probe, so declaring it in one shard is what keeps the shared file untouched.
export default [
    {
        files: ['**/jsx11yBatchA.tsx'],
        languageOptions: {parser: tseslint.parser, parserOptions: {ecmaFeatures: {jsx: true}}},
        plugins: {'jsx-a11y': {rules: jsxA11y.rules}},
        rules: {
            'jsx-a11y/alt-text': [
                'error',
                {
                    elements: ['img', 'object', 'area', 'input[type="image"]'],
                    img: [],
                    object: [],
                    area: [],
                    'input[type="image"]': [],
                },
            ],
            'jsx-a11y/anchor-has-content': 'error',
            'jsx-a11y/anchor-is-valid': [
                'error',
                {
                    components: ['Link'],
                    specialLink: ['to'],
                    aspects: ['noHref', 'invalidHref', 'preferButton'],
                },
            ],
            'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
            'jsx-a11y/aria-props': 'error',
            'jsx-a11y/aria-proptypes': 'error',
            'jsx-a11y/aria-role': ['error', {ignoreNonDOM: false}],
            'jsx-a11y/aria-unsupported-elements': 'error',
            'jsx-a11y/control-has-associated-label': [
                'error',
                {
                    labelAttributes: ['label'],
                    controlComponents: [],
                    ignoreElements: ['audio', 'canvas', 'embed', 'input', 'textarea', 'tr', 'video'],
                    ignoreRoles: ['grid', 'listbox', 'menu', 'menubar', 'radiogroup', 'row', 'tablist', 'toolbar', 'tree', 'treegrid'],
                    depth: 5,
                },
            ],
            'jsx-a11y/heading-has-content': ['error', {components: ['']}],
            'jsx-a11y/html-has-lang': 'error',
            'jsx-a11y/iframe-has-title': 'error',
            'jsx-a11y/img-redundant-alt': 'error',
            'jsx-a11y/label-has-associated-control': [
                'error',
                {
                    labelComponents: [],
                    labelAttributes: [],
                    controlComponents: [],
                    assert: 'either',
                    depth: 25,
                },
            ],
            'jsx-a11y/lang': 'error',
            'jsx-a11y/media-has-caption': [
                'error',
                {
                    audio: [],
                    video: [],
                    track: [],
                },
            ],
        },
    },
    {
        files: ['**/jsx11yBatchB.tsx'],
        languageOptions: {parser: tseslint.parser, parserOptions: {ecmaFeatures: {jsx: true}}},
        plugins: {'jsx-a11y': {rules: jsxA11y.rules}},
        rules: {
            'jsx-a11y/interactive-supports-focus': 'error',
            'jsx-a11y/mouse-events-have-key-events': 'error',
            'jsx-a11y/no-access-key': 'error',
            'jsx-a11y/no-autofocus': ['error', {ignoreNonDOM: true}],
            'jsx-a11y/no-distracting-elements': ['error', {elements: ['marquee', 'blink']}],
            'jsx-a11y/no-interactive-element-to-noninteractive-role': ['error', {tr: ['none', 'presentation']}],
            'jsx-a11y/no-noninteractive-element-interactions': ['error', {handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp']}],
            'jsx-a11y/no-noninteractive-element-to-interactive-role': [
                'error',
                {
                    ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
                    ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
                    li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
                    table: ['grid'],
                    td: ['gridcell'],
                },
            ],
            'jsx-a11y/no-noninteractive-tabindex': ['error', {tags: [], roles: ['tabpanel']}],
            'jsx-a11y/no-redundant-roles': 'error',
            'jsx-a11y/no-static-element-interactions': ['error', {handlers: ['onClick', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp']}],
            'jsx-a11y/role-has-required-aria-props': 'error',
            'jsx-a11y/role-supports-aria-props': 'error',
            'jsx-a11y/scope': 'error',
            'jsx-a11y/tabindex-no-positive': 'error',
        },
    },
];
