/**
 * oxlint config for `npm run lint` (see contributingGuides/LINTING.md). `buildOxlintConfig` from
 * eslint-config-expensify/oxlint converts the presets listed below with @oxlint/migrate every time oxlint loads this
 * file, so a package upgrade needs no edits here for preset rules. Below the presets this file lists the App's env,
 * globals, settings, plugins, ignores and rule overrides.
 */
/* eslint-disable @typescript-eslint/naming-convention -- the rule names in this file are quoted object keys */
/* eslint-disable import/extensions -- Node loads this file as ESM, which needs the extension on relative imports, while the presets ask for none */
import {buildOxlintConfig} from 'eslint-config-expensify/oxlint';
import {reactCompilerRuleNames} from 'eslint-config-expensify/oxlint/utils';
import storybookPlugin from 'eslint-plugin-storybook';

import {APP_HOSTED_RULE_IDS_BY_NAME} from './config/oxlint/appHostedRules.mjs';
import {RULE_BY_CATEGORY} from './config/oxlint/reactCompilerRust.mjs';

// React Compiler rules run as `rc/<name>` (config/oxlint/plugins/rc-rules.mjs), the ones the Rust compiler reports. The
// package drops the compiler rules oxlint cannot run (see `DROPPED_RULES` in its oxlint/tables.js).
// oxlint's built-in react/<name> versions are not used: an `eslint-disable` comment for react-hooks/exhaustive-deps or
// react-hooks/rules-of-hooks also hides every compiler error in that component (https://github.com/oxc-project/oxc/issues/26277).
const rcRuleNames = new Set(Object.values(RULE_BY_CATEGORY));
const unknownRcRules = [...rcRuleNames].filter((name) => !reactCompilerRuleNames.includes(name));
if (unknownRcRules.length) {
    throw new Error(`config/oxlint/reactCompilerRust.mjs maps rules that eslint-plugin-react-hooks does not have: ${unknownRcRules.join(', ')}`);
}

// eslint-plugin-storybook's own recommended config, run as an oxlint JS plugin. Its `storybook/` rules keep their names,
// so findings and `eslint-disable` comments use them as they are. oxlint does not read `@(a|b)` globs, so they are
// rewritten as `{a,b}`, and the config's react-hooks and import-x rules, which only turn checks off, are left out: for
// stories, `react/rules-of-hooks` is turned off below.
const storybookOverrides = storybookPlugin.configs['flat/recommended'].flatMap(({files, rules}) =>
    files && rules
        ? [
              {
                  files: files.flat().map((glob) => glob.replaceAll(/@\(([^)]*)\)/g, (match: string, alternatives: string) => `{${alternatives.split('|').join(',')}}`)),
                  jsPlugins: ['eslint-plugin-storybook'],
                  rules: Object.fromEntries(Object.entries(rules).filter(([ruleID]) => ruleID.startsWith('storybook/'))),
              },
          ]
        : [],
);

// An oxlint override replaces a rule's options instead of merging them, so every block that sets
// `no-restricted-imports` restates the full list, built from these.
const restrictedImportPaths = [
    {
        name: 'react-native',
        importNames: [
            'useWindowDimensions',
            'StatusBar',
            'TouchableOpacity',
            'TouchableWithoutFeedback',
            'TouchableNativeFeedback',
            'TouchableHighlight',
            'Pressable',
            'Text',
            'ScrollView',
            'ActivityIndicator',
            'Animated',
            'findNodeHandle',
            'InteractionManager',
        ],
        message:
            "\nFor 'useWindowDimensions', please use '@src/hooks/useWindowDimensions' instead.\nFor 'TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight', 'Pressable', please use 'PressableWithFeedback' and/or 'PressableWithoutFeedback' from '@components/Pressable' instead.\nFor 'StatusBar', please use '@libs/StatusBar' instead.\nFor 'Text', please use '@components/Text' instead.\nFor 'ScrollView', please use '@components/ScrollView' instead.\nFor 'ActivityIndicator', please use '@components/ActivityIndicator' instead.\nFor 'Animated', please use 'Animated' from 'react-native-reanimated' instead.\nFor 'InteractionManager', please use afterTransition callbacks on Navigation/KeyboardUtils or other alternatives. See contributingGuides/INTERACTION_MANAGER.md.",
    },
    {
        name: 'react-native-gesture-handler',
        importNames: ['TouchableOpacity', 'TouchableWithoutFeedback', 'TouchableNativeFeedback', 'TouchableHighlight'],
        message: "Please use 'PressableWithFeedback' and/or 'PressableWithoutFeedback' from '@components/Pressable' instead.",
    },
    {
        // ESLint bans this through @typescript-eslint/no-restricted-imports, which oxlint lacks; its
        // core rule accepts allowTypeImports instead.
        name: 'react-native-onyx/dist/OnyxUtils',
        message:
            'OnyxUtils is not a sanctioned way to read Onyx data. Use useOnyx() from @hooks/useOnyx in render paths, or a short-lived Onyx connection without a view for non-render logic. Type-only imports are still allowed.',
        allowTypeImports: true,
    },
    {name: 'awesome-phonenumber', importNames: ['parsePhoneNumber'], message: "Please use '@libs/PhoneNumber' instead."},
    {
        name: 'react-native-safe-area-context',
        importNames: ['useSafeAreaInsets', 'SafeAreaConsumer', 'SafeAreaInsetsContext'],
        message: "Please use 'useSafeAreaInsets' from '@src/hooks/useSafeAreaInset' and/or 'SafeAreaConsumer' from '@components/SafeAreaConsumer' instead.",
    },
    {name: 'react', importNames: ['CSSProperties'], message: "Please use 'ViewStyle', 'TextStyle', 'ImageStyle' from 'react-native' instead."},
    {name: 'react', importNames: ['forwardRef'], message: 'forwardRef is deprecated. Please use ref as a prop instead. See: contributingGuides/STYLE.md#forwarding-refs'},
    {name: '@styles/index', importNames: ['default', 'defaultStyles'], message: 'Do not import styles directly. Please use the `useThemeStyles` hook instead.'},
    {name: '@styles/utils', importNames: ['default', 'DefaultStyleUtils'], message: 'Do not import StyleUtils directly. Please use the `useStyleUtils` hook instead.'},
    {name: '@styles/theme', importNames: ['default', 'defaultTheme'], message: 'Do not import themes directly. Please use the `useTheme` hook instead.'},
    {name: '@styles/theme/illustrations', message: 'Do not import theme illustrations directly. Please use the `useThemeIllustrations` hook instead.'},
    {name: 'date-fns/locale', message: "Do not import 'date-fns/locale' directly. Please use the submodule import instead, like 'date-fns/locale/en-US'."},
    {
        name: 'expensify-common',
        importNames: ['Device', 'ExpensiMark'],
        message:
            "\nFor 'Device', do not import it directly, it's known to make VSCode's IntelliSense crash. Please import the desired module from `expensify-common/Device` instead.\nFor 'ExpensiMark', please use '@libs/Parser' instead.",
    },
    {name: 'lodash/memoize', message: "Please use '@src/libs/memoize' instead."},
    {name: 'lodash', importNames: ['memoize'], message: "Please use '@src/libs/memoize' instead."},
    {name: 'lodash/isEqual', message: "Please use 'deepEqual' from 'fast-equals' instead."},
    {name: 'lodash', importNames: ['isEqual'], message: "Please use 'deepEqual' from 'fast-equals' instead."},
    {name: 'react-native-onyx', importNames: ['useOnyx'], message: "Please use '@hooks/useOnyx' instead."},
    {name: '@src/utils/findNodeHandle', message: "Do not use 'findNodeHandle' as it is no longer supported on web."},
];

const restrictedImportPatterns = [
    {group: ['**/assets/animations/**/*.json'], message: "Do not import animations directly. Please use the '@components/LottieAnimations' import instead."},
    {group: ['@styles/theme/themes/**'], message: 'Do not import themes directly. Please use the `useTheme` hook instead.'},
    {group: ['@styles/utils/**', '!@styles/utils/FontUtils', '!@styles/utils/types'], message: 'Do not import style util functions directly. Please use the `useStyleUtils` hook instead.'},
    {group: ['@styles/theme/illustrations/themes/**'], message: 'Do not import theme illustrations directly. Please use the `useThemeIllustrations` hook instead.'},
];

const typescriptRestrictedImportPatterns = [
    ...restrictedImportPatterns,
    {
        group: ['**/ReportNameUtils', '**/libs/ReportNameUtils'],
        importNames: ['computeReportName'],
        message: 'Do not import computeReportName. Use getReportName instead, which properly uses derived report attributes.',
    },
    {
        group: ['**/PolicyUtils', '**/libs/PolicyUtils'],
        importNames: ['isPaidGroupPolicy'],
        message:
            'isPaidGroupPolicy is billing/paid-only (Collect/Control). For workspace feature gating use isGroupPolicy so free group plans like Submit are not excluded. If this is genuinely a billing/paid-only check, keep it and disable this line with a reason.',
    },
    {
        group: ['**/ReportUtils', '**/libs/ReportUtils'],
        importNames: ['isPaidGroupPolicy', 'isPaidGroupPolicyExpenseReport'],
        message:
            'isPaidGroupPolicy / isPaidGroupPolicyExpenseReport are billing/paid-only. For feature gating use isReportInGroupPolicy / isGroupPolicyExpenseReport so Submit workspaces are not excluded. If this is genuinely billing/paid-only, keep it and disable this line with a reason.',
    },
];

// Two patterns where ESLint has one: ESLint's gitignore semantics let a directory name cover its
// contents, but oxlint matches the path exactly, so the second catches `.../HeaderWithBackButton/types`.
const restrictedHeaderImportPatterns = [
    {group: ['**/HeaderWithBackButton'], message: 'HeaderWithBackButton is being migrated to the composed Header. Please use `@components/Header` instead for new usages.'},
    {group: ['**/HeaderWithBackButton/**'], message: 'HeaderWithBackButton is being migrated to the composed Header. Please use `@components/Header` instead for new usages.'},
];

// Headless CLI cannot use useTheme; email charts always render with the light theme.
const victoryChartRendererRestrictedImportPaths = restrictedImportPaths.filter((entry) => entry.name !== '@styles/theme');
const victoryChartRendererRestrictedImportPatterns = typescriptRestrictedImportPatterns.filter((entry) => !entry.group.includes('@styles/theme/themes/**'));

/**
 * Pressables and the components that forward their `sentryLabel` prop to one, so the `no-restricted-syntax` rules below can require the label.
 * The lists come from every JSX component whose props accept `sentryLabel`. Inputs (e.g. TextInput) and wrappers that fall back to a default
 * label (e.g. FormProvider, RadioButton) are left out. When you add a component that forwards `sentryLabel` to a pressable, add it here.
 * Names of compound components are written with dots, e.g. `MenuItem.Root`.
 */
const SENTRY_LABEL_PRESSABLES = [
    'PressableWithoutFeedback',
    'PressableWithFeedback',
    'PressableWithDelayToggle',
    'PressableWithoutFocus',
    'PressableWithSecondaryInteraction',
    'AnimatedPressableWithoutFeedback',
    'AnimatedPressableWithSecondaryInteraction',
];

/** Wrappers that only need a label when they get a press handler, since without one they can render read-only (e.g. a MenuItem without onPress). */
const SENTRY_LABEL_PRESS_HANDLER_WRAPPERS = [
    'AnimatedCollapsible',
    'AnimatedSettlementButton',
    'AnimatedSubmitButton',
    'AvatarButtonWithIcon',
    'BaseMiniContextMenuItem',
    'Button',
    'ButtonDisabledWhenOffline',
    'ButtonWithDropdownMenu',
    'CardDetailsActionButton',
    'CardSectionButton',
    'Checkbox',
    'ConfirmationPage.PrimaryButton',
    'ConfirmationPage.SecondaryButton',
    'ConfirmationPageButtonBase',
    'ConfirmationPagePrimaryButton',
    'ContextMenuItem',
    'DistanceRequestRenderItem',
    'ExpenseFieldDropdown',
    'ExpenseFieldRow',
    'FABFocusableMenuItem',
    'FeatureTraining.HelpButton',
    'FloatingActionButton',
    'FloatingReceiptButton',
    'FocusableMenuItem',
    'FormAlertWithSubmitButton',
    'Header.IconButton',
    'HeaderIconButton',
    'HighlightableMenuItem',
    'HighlightableMenuItemWithTopDescription',
    'LinkButton',
    'MenuItem',
    'MenuItem.Root',
    'MenuItemAction',
    'MenuItemAvatarNavigation',
    'MenuItemField',
    'MenuItemFieldHTML',
    'MenuItemNavigation',
    'MenuItemRoot',
    'MenuItemSectionRoot',
    'MenuItemWithLabel',
    'MenuItemWithTopDescription',
    'PopoverMenu.Item',
    'PopoverMenu.RadioItem',
    'RowMenuItem',
    'SearchFiltersBarButton',
    'SelectionButton',
    'SettlementButton',
    'SortableHeaderText',
    'SubmitDraftButton',
    'Table.Row',
    'TableRow',
    'TabSelectorItem',
    'ToggleDistanceUnitButton',
    'ViewButton',
];

/** Wrappers that handle the press themselves (e.g. ThreeDotsMenu opens its menu), so they always need a label. */
const SENTRY_LABEL_SELF_PRESS_WRAPPERS = [
    'AvatarWithImagePicker',
    'BookTravelButton',
    'DropdownButton',
    'ExportWithDropdownMenu',
    'FeatureTraining.ConfirmButton',
    'MerchantFilterContent',
    'PopoverMenu.Sub.Trigger',
    'TextInputFilterContent',
    'ThreeDotsMenu',
    'WidgetHeaderMenu',
];

/** Builds an esquery selector list matching JSX elements named e.g. `Button` or `MenuItem.Root`. */
function jsxElementNamesSelector(names: string[]): string {
    return names
        .map((name) => {
            const parts = name.split('.');
            if (parts.length === 1) {
                return `[name.name="${name}"]`;
            }
            return parts
                .map((part, index) => {
                    const path = ['name', ...Array<string>(parts.length - 1 - index).fill('object')].join('.');
                    return index === 0 ? `[${path}.name="${part}"]` : `[${path}.property.name="${part}"]`;
                })
                .join('');
        })
        .join(', ');
}

export default await buildOxlintConfig({
    withNursery: true,
    presets: ['browser', 'react', 'expensify', 'typescript', 'scripts', 'jest', 'prettier'],
    transformRule: (ruleID, entry) => {
        const [prefix, name] = ruleID.split('/');
        return prefix === 'react-hooks' && rcRuleNames.has(name) ? [`rc/${name}`, entry] : undefined;
    },
    plugins: {
        hosted: './config/oxlint/plugins/hosted-rules.mjs',
        rulesdir: './config/oxlint/plugins/expensify-rules.mjs',
    },
    extraRunningNames: ['rc/', ...Object.keys(APP_HOSTED_RULE_IDS_BY_NAME).map((name) => `hosted/${name}`)],
    env: {node: true, browser: true, audioworklet: true, jest: true},
    globals: {__DEV__: 'readonly'},
    jsPlugins: [
        {name: 'rc', specifier: './config/oxlint/plugins/rc-rules.mjs'},
        {name: 'report-name-utils', specifier: './config/oxlint/plugins/report-name-utils.mjs'},
    ],
    settings: {
        // Read by the hosted eslint-plugin-import rules; without them `no-useless-path-segments` and
        // `no-relative-packages` cannot resolve .ts/.tsx targets and stay silent. Same values as ESLint's.
        'import/resolver': {node: {extensions: ['.mjs', '.js', '.jsx', '.json', '.ts', '.tsx', '.d.ts', '.cts', '.mts']}},
        'import/extensions': ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.d.ts', '.cts', '.mts'],
    },
    ignorePatterns: [
        '!**/.storybook',
        '!**/.github',
        '.github/actions/**/index.js',
        '**/*.config.js',
        '**/*.config.mjs',
        '**/node_modules/**/*',
        '**/dist/**/*',
        'server/**/dist/**',
        'server/victory-chart-renderer/.dev/**',
        '.lint-reports/**/*',
        'android/**/build/**/*',
        'docs/vendor/**/*',
        'docs/assets/**/*',
        'web/gtm.js',
        '**/.expo/**/*',
        '**/.rock/**/*',
        '**/.yalc/**/*',
        'src/libs/SearchParser/searchParser.js',
        'src/libs/SearchParser/autocompleteParser.js',
        'help/_scripts/**/*',
        'modules/ExpensifyNitroUtils/nitrogen/**/*',
        'Mobile-Expensify/**/*',
        '**/vendor',
        'modules/group-ib-fp/**/*',
        'web/snippets/gib.js',
        'web/cloudflare-worker/**/*',
        'src/languages/de.ts',
        'src/languages/el.ts',
        'src/languages/es.ts',
        'src/languages/fr.ts',
        'src/languages/it.ts',
        'src/languages/ja.ts',
        'src/languages/nl.ts',
        'src/languages/pl.ts',
        'src/languages/pt-BR.ts',
        'src/languages/zh-hans.ts',
    ],
    overrides: [
        {
            // The App's own rules and changes to the presets, for every file.
            files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}'],
            rules: {
                'rulesdir/no-beta-handler': 'error',
                'rulesdir/no-default-id-values': 'error',
                'rulesdir/no-default-props': 'error',
                'rulesdir/no-direct-personal-details-list': 'error',
                'rulesdir/no-direct-pre-insert-fullscreen-under-rhp': 'error',
                'rulesdir/no-layout-spacing-conditional': 'error',
                'rulesdir/no-onyx-get-snapshot-key': 'error',
                'rulesdir/no-onyx-loading-status': 'error',
                'rulesdir/no-raw-typography': 'error',
                'rulesdir/no-unsafe-onyx-read': 'error',
                'rulesdir/prefer-type-fest': 'error',
                'rulesdir/require-a11y-disable-justification': 'error',
                'rulesdir/require-live-region-for-status-updates': 'error',
                'rulesdir/require-locale-for-localized-date-format': 'error',
                'rulesdir/prefer-narrow-hook-dependencies': ['error', {stableObjectPatterns: ['[Ss]tyles?$', '^theme', '[Ii]cons?$']}],
                'rulesdir/prefer-import-module-contents': 'off',
                'rulesdir/prefer-underscore-method': 'off',
                'react/jsx-filename-extension': 'off',
                'hosted/prop-types': 'off',
                'hosted/require-default-props': 'off',
                'hosted/check-param-names': 'off',
                'hosted/check-types': 'off',
                'hosted/no-extraneous-dependencies': 'off',
                'es/no-nullish-coalescing-operators': 'off',
                'es/no-optional-chaining': 'off',
                // Stands in for `rulesdir/prefer-at`, which needs the type checker. Default options only: `checkAllIndexAccess` makes it unusable.
                'unicorn/prefer-at': 'error',
                // eslint-config-prettier turns this off, but the App requires braces on every block.
                curly: ['error', 'all'],
                'react/jsx-key': 'error',
                // oxlint's no-redeclare defaults to `builtinGlobals: true`, which flags global augmentations like
                // `interface ArrayBuffer` in src/types/global.d.ts.
                'no-redeclare': ['error', {builtinGlobals: false}],
                'hosted/no-unused-prop-types': ['error', {customValidators: [], skipShapeProps: true}],
                // This list replaces the preset's. It keeps the preset's `LabeledStatement` and `WithStatement` bans but not
                // `ForInStatement`, which only the scripts/tests block below bans.
                'core/no-restricted-syntax': [
                    'error',
                    {selector: 'TSEnumDeclaration', message: "Please don't declare enums, use union types instead."},
                    {
                        selector: 'CallExpression[callee.object.name="React"][callee.property.name="forwardRef"]',
                        message: 'forwardRef is deprecated. Please use ref as a prop instead. See: contributingGuides/STYLE.md#forwarding-refs',
                    },
                    {
                        selector: 'ImportNamespaceSpecifier[parent.source.value=/^@libs/]',
                        message: 'Namespace imports from @libs are not allowed. Use named imports instead. Example: import { method } from "@libs/module"',
                    },
                    {
                        selector: 'ImportNamespaceSpecifier[parent.source.value=/^@userActions/]',
                        message: 'Namespace imports from @userActions are not allowed. Use named imports instead. Example: import { action } from "@userActions/module"',
                    },
                    {
                        selector: 'ImportNamespaceSpecifier[parent.source.value=/^\\.\\./]',
                        message: 'Namespace imports from parent directories are not allowed. Use named imports instead. Example: import { method } from "../libs/module"',
                    },
                    {
                        selector: 'ImportNamespaceSpecifier[parent.source.value=/^\\./]',
                        message: 'Namespace imports from sibling modules are not allowed. Use named imports instead. Example: import { method } from "./libs/module"',
                    },
                    {
                        selector: `JSXOpeningElement:matches(${jsxElementNamesSelector(SENTRY_LABEL_PRESSABLES)}):not(:has(> JSXAttribute[name.name="sentryLabel"]))`,
                        message: 'Pressable components must have a sentryLabel from CONST.SENTRY_LABEL. See contributingGuides/SENTRY_LABEL.md.',
                    },
                    {
                        // Spread props may carry the label, which a selector can't see, so those are skipped.
                        selector: `JSXOpeningElement:matches(${jsxElementNamesSelector(SENTRY_LABEL_PRESS_HANDLER_WRAPPERS)}):has(> JSXAttribute[name.name=/^on(Press|LongPress|SecondaryInteraction|Select|Submit)$/]):not(:has(> JSXAttribute[name.name="sentryLabel"])):not(:has(> JSXSpreadAttribute))`,
                        message: 'Button, MenuItem and other pressable wrappers that handle a press must have a sentryLabel from CONST.SENTRY_LABEL. See contributingGuides/SENTRY_LABEL.md.',
                    },
                    {
                        // Spread props may carry the label, which a selector can't see, so those are skipped.
                        selector: `JSXOpeningElement:matches(${jsxElementNamesSelector(SENTRY_LABEL_SELF_PRESS_WRAPPERS)}):not(:has(> JSXAttribute[name.name="sentryLabel"])):not(:has(> JSXSpreadAttribute))`,
                        message:
                            'ThreeDotsMenu, DropdownButton and other wrappers that handle their own press must have a sentryLabel from CONST.SENTRY_LABEL. See contributingGuides/SENTRY_LABEL.md.',
                    },
                    {selector: 'LabeledStatement', message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.'},
                    {selector: 'WithStatement', message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize. It is also deprecated.'},
                ],
            },
        },
        {
            files: ['**/*.{ts,tsx,cts,mts}'],
            rules: {
                // Narrower than the preset: `ignorePrimitives: true` reports `||` only when the left operand
                // cannot be `''`, `0`, `0n` or `false`. See contributingGuides/STYLE.md#accessing-object-properties-and-default-values
                'typescript/prefer-nullish-coalescing': ['error', {ignoreIfStatements: true, ignorePrimitives: true, ignoreTernaryTests: true}],
            },
        },
        {
            files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
            rules: {
                'react-native-a11y/has-accessibility-props': 'error',
                'react-native-a11y/has-valid-accessibility-actions': 'error',
                'react-native-a11y/has-valid-accessibility-component-type': 'error',
                'react-native-a11y/has-valid-accessibility-descriptors': ['error', {touchables: ['PressableWithoutFeedback', 'PressableWithFeedback']}],
                'react-native-a11y/has-valid-accessibility-role': 'error',
                'react-native-a11y/has-valid-accessibility-state': 'error',
                'react-native-a11y/has-valid-accessibility-states': 'error',
                'react-native-a11y/has-valid-accessibility-traits': 'error',
                'react-native-a11y/has-valid-accessibility-value': 'error',
                'react-native-a11y/no-nested-touchables': 'error',
                'react-native-a11y/has-valid-accessibility-ignores-invert-colors': 'error',
                'react-native-a11y/has-valid-accessibility-live-region': 'error',
                'react-native-a11y/has-valid-important-for-accessibility': 'error',
                '@dword-design/import-alias/prefer-alias': [
                    'error',
                    {
                        alias: {
                            '@assets': './assets',
                            '@components': './src/components',
                            '@hooks': './src/hooks',
                            '@userActions': './src/libs/actions',
                            '@libs': './src/libs',
                            '@navigation': './src/libs/Navigation',
                            '@pages': './src/pages',
                            '@prompts': './prompts',
                            '@styles': './src/styles',
                            '@src': './src',
                            '@github': './.github',
                        },
                    },
                ],
                'arrow-body-style': 'off',
                'no-empty': ['error', {allowEmptyCatch: true}],
                'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
                'react/forbid-component-props': [
                    'error',
                    {
                        forbid: [
                            {
                                propName: 'fsClass',
                                allowedFor: ['View', 'Animated.View', 'Text', 'Animated.Text', 'Pressable'],
                                message:
                                    "The 'fsClass' prop doesn't work for custom components, only RN's View, Text and Pressable (plain or Animated).\nType the component's props with 'ForwardedFSClassProps' and pass 'forwardedFSClass' down to one of those, or wrap the content in 'FSClassView' so text inputs inside follow its class.",
                            },
                        ],
                    },
                ],
                'no-restricted-properties': [
                    'error',
                    {object: 'Image', property: 'getSize', message: 'Usage of Image.getSize is restricted. Please use the `react-native-image-size`.'},
                    {object: 'HybridAppModule', property: 'isHybridApp', message: 'Use CONFIG.IS_HYBRID_APP instead.'},
                    {object: 'HybridAppModule', property: 'closeReactNativeApp', message: 'Use `closeReactNativeApp` from `@userActions/HybridApp` instead.'},
                ],
                'no-restricted-imports': ['error', {paths: restrictedImportPaths, patterns: restrictedImportPatterns}],
                'lodash/import-scope': ['error', 'method'],
                'prefer-regex-literals': 'off',
                'jsdoc/require-param': 'off',
                'jsdoc/require-param-type': 'off',
                'jsdoc/check-tag-names': 'off',
            },
            jsPlugins: ['eslint-plugin-react-native-a11y', '@dword-design/eslint-plugin-import-alias', 'eslint-plugin-lodash'],
            plugins: ['jsdoc'],
        },
        {
            files: ['**/*.{js,jsx,mjs,cjs}'],
            rules: {
                'prefer-arrow-callback': 'off',
                'lodash/import-scope': 'off',
                'rulesdir/no-default-props': 'off',
            },
            jsPlugins: ['eslint-plugin-lodash'],
        },
        {
            files: ['**/*.{mjs,cjs}', '.storybook/**/*.{ts,tsx}', 'config/rsbuild/**/*.ts'],
            rules: {
                'import/extensions': 'off',
            },
        },
        {
            files: ['**/*.{ts,tsx}'],
            rules: {
                'you-dont-need-lodash-underscore/concat': 'error',
                'you-dont-need-lodash-underscore/drop': 'error',
                'you-dont-need-lodash-underscore/drop-right': 'error',
                'you-dont-need-lodash-underscore/index-of': 'error',
                'you-dont-need-lodash-underscore/join': 'error',
                'you-dont-need-lodash-underscore/last': 'error',
                'you-dont-need-lodash-underscore/last-index-of': 'error',
                'you-dont-need-lodash-underscore/reverse': 'error',
                'you-dont-need-lodash-underscore/fill': 'error',
                'you-dont-need-lodash-underscore/find': 'error',
                'you-dont-need-lodash-underscore/detect': 'error',
                'you-dont-need-lodash-underscore/first': 'error',
                'you-dont-need-lodash-underscore/find-index': 'error',
                'you-dont-need-lodash-underscore/is-array': 'error',
                'you-dont-need-lodash-underscore/each': 'error',
                'you-dont-need-lodash-underscore/for-each': 'error',
                'you-dont-need-lodash-underscore/every': 'error',
                'you-dont-need-lodash-underscore/all': 'error',
                'you-dont-need-lodash-underscore/filter': 'error',
                'you-dont-need-lodash-underscore/select': 'error',
                'you-dont-need-lodash-underscore/map': 'error',
                'you-dont-need-lodash-underscore/collect': 'error',
                'you-dont-need-lodash-underscore/reduce': 'error',
                'you-dont-need-lodash-underscore/inject': 'error',
                'you-dont-need-lodash-underscore/foldl': 'error',
                'you-dont-need-lodash-underscore/reduce-right': 'error',
                'you-dont-need-lodash-underscore/foldr': 'error',
                'you-dont-need-lodash-underscore/size': 'error',
                'you-dont-need-lodash-underscore/some': 'error',
                'you-dont-need-lodash-underscore/any': 'error',
                'you-dont-need-lodash-underscore/includes': 'error',
                'you-dont-need-lodash-underscore/contains': 'error',
                'you-dont-need-lodash-underscore/slice': 'error',
                'you-dont-need-lodash-underscore/take-right': 'error',
                'you-dont-need-lodash-underscore/bind': 'error',
                'you-dont-need-lodash-underscore/is-finite': 'error',
                'you-dont-need-lodash-underscore/is-integer': 'error',
                'you-dont-need-lodash-underscore/is-nan': 'error',
                'you-dont-need-lodash-underscore/is-nil': 'error',
                'you-dont-need-lodash-underscore/is-null': 'error',
                'you-dont-need-lodash-underscore/is-undefined': 'error',
                'you-dont-need-lodash-underscore/keys': 'error',
                'you-dont-need-lodash-underscore/extend-own': 'error',
                'you-dont-need-lodash-underscore/assign': 'error',
                'you-dont-need-lodash-underscore/values': 'error',
                'you-dont-need-lodash-underscore/entries': 'error',
                'you-dont-need-lodash-underscore/to-pairs': 'error',
                'you-dont-need-lodash-underscore/pairs': 'error',
                'you-dont-need-lodash-underscore/get': 'error',
                'you-dont-need-lodash-underscore/split': 'error',
                'you-dont-need-lodash-underscore/starts-with': 'error',
                'you-dont-need-lodash-underscore/ends-with': 'error',
                'you-dont-need-lodash-underscore/to-lower': 'error',
                'you-dont-need-lodash-underscore/to-upper': 'error',
                'you-dont-need-lodash-underscore/trim': 'error',
                'you-dont-need-lodash-underscore/pad-start': 'error',
                'you-dont-need-lodash-underscore/pad-end': 'error',
                'you-dont-need-lodash-underscore/repeat': 'error',
                'you-dont-need-lodash-underscore/uniq': 'error',
                'you-dont-need-lodash-underscore/replace': 'error',
                'you-dont-need-lodash-underscore/omit': 'error',
                'you-dont-need-lodash-underscore/flatten': 'error',
                'you-dont-need-lodash-underscore/throttle': 'off',
                'you-dont-need-lodash-underscore/is-string': 'error',
                'you-dont-need-lodash-underscore/cast-array': 'error',
                // structuredClone, the suggested clone-deep replacement, is not supported in Hermes: https://github.com/facebook/hermes/issues/684
                'you-dont-need-lodash-underscore/clone-deep': 'off',
                'you-dont-need-lodash-underscore/is-function': 'error',
                'you-dont-need-lodash-underscore/union-by': 'error',
                'you-dont-need-lodash-underscore/capitalize': 'error',
                'you-dont-need-lodash-underscore/is-date': 'error',
                'you-dont-need-lodash-underscore/defaults': 'error',
                'you-dont-need-lodash-underscore/is-array-buffer': 'error',
                'you-dont-need-lodash-underscore/head': 'error',
            },
            jsPlugins: ['eslint-plugin-you-dont-need-lodash-underscore'],
        },
        {
            files: ['.github/**/*', 'scripts/**/*', 'server/**/*', 'tests/**/*'],
            rules: {
                'no-await-in-loop': 'off',
                'core/no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
            },
        },
        {
            files: ['.github/**/*'],
            rules: {
                'no-restricted-imports': ['error', {patterns: [{group: ['@src/**'], message: 'Do not import files from src/ directory as they can break the GH Actions build script.'}]}],
            },
        },
        {
            // Like ESLint's block, this replaces the root's list, so the airbnb browser globals are not banned here.
            files: ['.github/actions/**/*.ts', '.github/libs/**/*.ts'],
            rules: {
                'no-restricted-globals': [
                    'error',
                    {name: 'module', message: 'This file is bundled as ESM and runs on Node 24. For an entry-point guard use `import.meta.main` instead of `require.main === module`.'},
                    {name: '__dirname', message: 'This file is bundled as ESM. Use `import.meta.dirname` instead of `__dirname`.'},
                    {name: '__filename', message: 'This file is bundled as ESM. Use `import.meta.filename` instead of `__filename`.'},
                ],
            },
        },
        {
            files: ['tests/**/*'],
            rules: {
                'import/extensions': 'off',
                '@dword-design/import-alias/prefer-alias': ['off'],
                'testing-library/await-async-queries': 'error',
                'testing-library/await-async-utils': 'error',
                'testing-library/no-debugging-utils': 'error',
                'testing-library/no-manual-cleanup': 'error',
                'testing-library/no-unnecessary-act': 'error',
                'testing-library/prefer-find-by': 'error',
                'testing-library/prefer-presence-queries': 'error',
                'testing-library/prefer-screen-queries': 'error',
            },
            jsPlugins: ['@dword-design/eslint-plugin-import-alias', 'eslint-plugin-testing-library'],
        },
        {
            files: ['**/*.{ts,tsx}'],
            rules: {
                'no-restricted-imports': ['error', {paths: restrictedImportPaths, patterns: [...typescriptRestrictedImportPatterns, ...restrictedHeaderImportPatterns]}],
                // Overrides are last-wins: keep this block above the later ones that turn this rule off
                // or re-set `no-restricted-imports`.
                'typescript/no-deprecated': ['error', {allow: ['translateFn']}],
                // tsgolint misses `<MenuItem />`; see config/oxlint/noDeprecatedSelfClosingJsx.mjs.
                'hosted/no-deprecated-self-closing-jsx': [
                    'error',
                    {
                        components: [
                            {
                                module: 'src/components/MenuItem',
                                importName: 'default',
                                reason: 'Compose `MenuItem.Root` with its leaves, or use a preset from `@components/MenuItem/presets/`, for new usages.',
                            },
                        ],
                    },
                ],
            },
        },
        {files: ['src/**/*'], rules: {'max-lines': ['error', 4000]}},
        {
            files: ['modules/ExpensifyNitroUtils/src/**/*'],
            rules: {
                'typescript/consistent-type-definitions': 'off',
            },
        },
        {
            files: ['server/victory-chart-renderer/**/*.{ts,tsx}'],
            rules: {'no-restricted-imports': ['error', {paths: victoryChartRendererRestrictedImportPaths, patterns: victoryChartRendererRestrictedImportPatterns}]},
        },
        {
            files: ['src/**/*.{ts,tsx}'],
            rules: {
                // The lint pipeline keeps this diagnostic only when React Compiler memoizes the file.
                'rulesdir/no-manual-memoization': 'error',
                'rulesdir/no-object-keys-includes': 'error',
                'rulesdir/prefer-locale-compare-from-context': 'error',
            },
        },
        {
            files: ['src/styles/typography.ts', 'src/styles/variables.ts'],
            rules: {
                // The typography token files are where raw font sizes and line heights are defined.
                'rulesdir/no-raw-typography': 'off',
            },
        },
        {files: ['src/styles/**'], excludeFiles: ['src/styles/typography.ts', 'src/styles/variables.ts'], rules: {'rulesdir/no-raw-typography': ['error', {allowVariablesReferences: true}]}},
        {files: ['**/en.ts', '**/es.ts'], rules: {'rulesdir/use-periods-for-error-messages': 'error'}},
        {files: ['src/libs/ReportNameUtils.ts'], rules: {'report-name-utils/no-function-call-in-get-report-name': 'error'}},
        // reportAttributes.ts computes report names, so the TypeScript-only bans do not apply.
        {
            files: ['src/libs/actions/OnyxDerived/configs/reportAttributes.ts'],
            rules: {'no-restricted-imports': ['error', {paths: restrictedImportPaths, patterns: restrictedImportPatterns}]},
        },
        {
            files: ['src/languages/**', 'src/CONST/index.ts', 'src/NAICS.ts'],
            rules: {
                'max-lines': 'off',
            },
        },
        {
            files: ['scripts/**', '.github/**'],
            rules: {
                // tsgolint's no-unsafe-* port is stricter than typescript-eslint's, and this loosely typed
                // Actions glue is where it shows: hundreds of findings ESLint does not report.
                'typescript/no-unsafe-assignment': 'off',
                'typescript/no-unsafe-argument': 'off',
                'typescript/no-unsafe-return': 'off',
                'typescript/no-unsafe-call': 'off',
                'typescript/no-unsafe-member-access': 'off',
                'no-throw-literal': 'off',
            },
        },
        {
            files: ['src/libs/Navigation/types.ts', 'src/libs/Navigation/paramLists/**/*.ts'],
            rules: {
                'core/no-restricted-syntax': [
                    'error',
                    {
                        selector: 'TSPropertySignature[key.name="backTo"]',
                        message:
                            'The `backTo` route param is deprecated. Do not add new `backTo` properties to screen param lists. Please look into the `How to remove backTo from URL` section in contributingGuides/NAVIGATION.md. and use alternative routing methods instead.',
                    },
                ],
            },
        },
        {
            files: [
                '.github/actions/javascript/checkAndroidStatus/checkAndroidStatus.ts',
                '.github/actions/javascript/getAndroidRolloutPercentage/getAndroidRolloutPercentage.ts',
                '__mocks__/reportData/actions.ts',
                'config/rsbuild/rsbuild.common.ts',
                'src/hooks/useAccessibilityAnnouncement/index.ts',
                'src/libs/Parser.ts',
                'src/libs/actions/Chronos.ts',
                'src/libs/actions/IOU/DeleteMoneyRequest.ts',
                'src/libs/actions/IOU/Duplicate.ts',
                'src/libs/actions/IOU/Hold.ts',
                'src/libs/actions/IOU/RejectMoneyRequest.ts',
                'src/libs/actions/IOU/TrackExpense.ts',
                'src/libs/actions/IOU/UpdateMoneyRequest.ts',
                'src/libs/actions/Policy/Member.ts',
                'src/libs/actions/Transaction.ts',
                'src/pages/inbox/conciergeDraftState.ts',
                'src/pages/inbox/report/ReportActionsListItemRenderer.tsx',
                'src/utils/createDummySharedValue.ts',
                'tests/actions/IOU/CreateDraftTransactionTest.ts',
                'tests/actions/IOU/RequestMoneyTest.ts',
                'tests/actions/IOUTest/BulkEditTest.ts',
                'tests/actions/IOUTest/DeleteMoneyRequestTest.ts',
                'tests/actions/IOUTest/DuplicateTest.ts',
                'tests/actions/IOUTest/PayMoneyRequestTest.ts',
                'tests/actions/IOUTest/SplitTest.ts',
                'tests/actions/IOUTest/TrackExpenseTest.ts',
                'tests/actions/IOUTest/UpdateMoneyRequestTest.ts',
                'tests/actions/MergeTransactionTest.ts',
                'tests/actions/ReplaceOptimisticReportWithActualReportTest.ts',
                'tests/actions/ReportTest.ts',
                'tests/actions/TransactionTest.ts',
                'tests/ui/ChatActionableButtonsTest.tsx',
                'tests/ui/DynamicReportDetailsPageTest.tsx',
                'tests/ui/LHNItemsPresence.tsx',
                'tests/ui/MoneyRequestReportViewTest.tsx',
                'tests/ui/RecentlyAddedSectionTest.tsx',
                'tests/ui/ReportActionItemTest.tsx',
                'tests/ui/ReportActionsListTest.tsx',
                'tests/ui/ReportAttachments.tsx',
                'tests/ui/components/BaseReportActionContextMenuTest.tsx',
                'tests/ui/components/LHNOptionsListTest.tsx',
                'tests/unit/AgentRuleChangeLogUtilsTest.ts',
                'tests/unit/DebugUtilsTest.ts',
                'tests/unit/DeleteReportTest.ts',
                'tests/unit/LHNAvatarPipelineTest.ts',
                'tests/unit/MoneyRequestReportUtilsTest.ts',
                'tests/unit/NextStepUtilsTest.ts',
                'tests/unit/OnyxDerived/computeForReportTest.ts',
                'tests/unit/OnyxDerivedTest.tsx',
                'tests/unit/OptionsListUtilsTest.tsx',
                'tests/unit/PolicyChangeLogContentTest.tsx',
                'tests/unit/ReportActionsUtilsTest.ts',
                'tests/unit/ReportPrimaryActionUtilsTest.ts',
                'tests/unit/ReportSecondaryActionUtilsTest.ts',
                'tests/unit/ReportUtilsTest.ts',
                'tests/unit/Search/SearchUIUtilsTest.ts',
                'tests/unit/SidebarUtilsTest.ts',
                'tests/unit/SpendRuleChangeLogUtilsTest.ts',
                'tests/unit/TransactionTest.ts',
                'tests/unit/WhisperContentMentionContextTest.tsx',
                'tests/unit/components/MoneyReportTransactionThreadContext.test.tsx',
                'tests/unit/getReportPreviewSenderIDTest.ts',
                'tests/unit/getSendMessageListWeightTest.ts',
                'tests/unit/getSendMessageSourceTest.ts',
                'tests/unit/hooks/useDeleteTransactionsInvoiceOfflineTest.tsx',
                'tests/unit/hooks/useExpenseActionsInvoiceDeleteTest.tsx',
                'tests/unit/hooks/useExpenseSubmission.test.ts',
                'tests/unit/hooks/useOriginalReportID.test.tsx',
                'tests/unit/hooks/useSelectedTransactionsActions.test.ts',
                'tests/unit/hooks/useShowNotFoundPageInIOUStep.test.ts',
                'tests/unit/hooks/useTransactionThreadReportID.test.ts',
                'tests/unit/inlineEditing/TransactionInlineEdit.test.ts',
                'tests/unit/isConsecutiveActionMadeByPreviousActorTest.ts',
                'tests/unit/libs/MoneyRequestReportUtils.ts',
                'tests/unit/pages/inbox/ConciergeDraftContext.test.tsx',
                'tests/unit/selectors/ReportActionTest.ts',
                'tests/unit/useGetExpensifyCardFromReportActionTest.ts',
                'tests/unit/useOneTransactionThreadReportIDTest.ts',
                'tests/unit/useReportActionsVisibilityTest.tsx',
                'tests/utils/LHNTestUtils.tsx',
                'tests/utils/ReportTestUtils.ts',
                'tests/utils/collections/reportActions.ts',
                'tests/utils/createSharedValueMock.ts',
            ],
            rules: {
                // tsgolint also reports writes to deprecated properties (typescript-eslint#10643), which
                // floods these files. Costs a few read-site findings ESLint reports here.
                'typescript/no-deprecated': 'off',
                'hosted/no-deprecated-self-closing-jsx': 'off',
            },
        },
        {
            // bun-types declares `expect(...).resolves`/`.rejects` as returning `void` even though Bun
            // requires awaiting them. See https://github.com/oven-sh/bun/pull/23425.
            files: ['tests/tooling/**/*.ts'],
            rules: {'typescript/await-thenable': 'off'},
        },
        ...storybookOverrides,
        {
            // eslint-plugin-storybook's recommended config turns this off for stories.
            files: ['**/*.{stories,story}.{ts,tsx,js,jsx,mjs,cjs}'],
            rules: {'react/rules-of-hooks': 'off'},
        },
        {files: ['src/types/onyx/**/*.ts'], rules: {'hosted/require-jsdoc': ['error', {contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration']}]}},
        {
            files: [
                'src/ONYXKEYS.ts',
                'src/hooks/usePersonalDetails.ts',
                'src/libs/PersonalDetailsStore.ts',
                'src/libs/PersonalDetailsUtils.ts',
                'src/components/OnyxListItemProvider.tsx',
                'src/libs/ExportOnyxState/masking.ts',
                'tests/**/*.{ts,tsx}',
                'jest/**/*.{ts,tsx}',
                '__mocks__/**/*.{ts,tsx}',
                'src/**/__mocks__/**/*.{ts,tsx}',
            ],
            rules: {'rulesdir/no-direct-personal-details-list': 'off'},
        },
        // LocaleContextProvider and HybridAppHandler mount before `Onyx.init` finishes, so they keep relying on the startup
        // loading status. Tests and mocks follow the code they cover and get cleaned up together with it.
        {
            files: [
                'src/components/LocaleContextProvider.tsx',
                'src/HybridAppHandler.tsx',
                'tests/**/*.{ts,tsx}',
                'jest/**/*.{ts,tsx}',
                '__mocks__/**/*.{ts,tsx}',
                'src/**/__mocks__/**/*.{ts,tsx}',
            ],
            rules: {'rulesdir/no-onyx-loading-status': 'off'},
        },
    ],
});
