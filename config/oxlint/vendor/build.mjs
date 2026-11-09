/** Rebuilds the syntax-only hosted rules from unpacked npm packages, without installing a compiler. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const directory = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(process.argv[2] ?? 'node_modules');
const getPackagePath = (name, relative) => path.join(sourceRoot, name, relative);
const quote = JSON.stringify;
const versions = {
    'eslint-config-expensify': '4.0.8',
    '@typescript-eslint/eslint-plugin': '8.58.1',
    '@typescript-eslint/utils': '8.61.0',
    'eslint-plugin-testing-library': '7.11.0',
    'eslint-plugin-storybook': '10.6.2',
};
for (const [name, version] of Object.entries(versions)) {
    const actual = JSON.parse(fs.readFileSync(getPackagePath(name, 'package.json'), 'utf8')).version;
    if (actual !== version) {
        throw new Error(`Expected ${name}@${version}, found ${actual}. Review rule changes before updating a source version.`);
    }
    if (name !== 'eslint-config-expensify') {
        fs.copyFileSync(getPackagePath(name, 'LICENSE'), path.join(directory, `${name.replaceAll('/', '-')}-LICENSE`));
    }
}
const pluginPath = getPackagePath('eslint-config-expensify', 'eslint-plugin-expensify');
const config = fs.readFileSync(path.join(directory, '../../../oxlint.config.mts'), 'utf8');
const names = [...config.matchAll(/'rulesdir\/([^']+)':\s*(?:\[\s*)?['"](?:error|warn)['"]/g)]
    .map((match) => match[1])
    .filter((name) => name !== 'prefer-locale-compare-from-context')
    .filter((name) => fs.existsSync(path.join(pluginPath, `${name}.js`)));
const testingRules = [...config.matchAll(/'testing-library\/([^']+)':\s*'error'/g)].map((match) => match[1]);

const syntaxUtilities = `
export {findVariable, isParenthesized, isOpeningParenToken, isClosingParenToken} from '@eslint-community/eslint-utils';
import * as ASTUtils from ${quote(getPackagePath('@typescript-eslint/utils', 'dist/ast-utils/index.js'))};
import {AST_NODE_TYPES, AST_TOKEN_TYPES} from '@typescript-eslint/types';
import * as Scope from '@typescript-eslint/scope-manager';
import {RuleCreator} from ${quote(getPackagePath('@typescript-eslint/utils', 'dist/eslint-utils/RuleCreator.js'))};
const ESLintUtils = {RuleCreator};
const TSESLint = {Scope};
export {ASTUtils, AST_NODE_TYPES, AST_TOKEN_TYPES, ESLintUtils, RuleCreator, TSESLint};
`;

const namingUtilities = `
import {ESLintUtils} from '@typescript-eslint/utils';
import {isIdentifierStart, isIdentifierChar} from '@babel/helper-validator-identifier';
const {RuleCreator} = ESLintUtils;
const createRule = RuleCreator((name) => 'https://typescript-eslint.io/rules/' + name);
const getEnumNames = (values) => Object.keys(values).filter((key) => !/^\\d+$/.test(key));
function requiresQuoting(name) {
    // The naming rule checks UTF-16 code units, not Unicode code points, including surrogate pairs.
    if (name.length === 0 || !isIdentifierStart(name.charCodeAt(0))) {
        return true;
    }
    for (let index = 1; index < name.length; index += 1) {
        if (!isIdentifierChar(name.charCodeAt(index))) {
            return true;
        }
    }
    return false;
}
function getParserServices(_context, allowWithoutFullTypeInformation) {
    if (!allowWithoutFullTypeInformation) {
        throw new Error('Type-based naming selectors require a type-aware rule.');
    }
    return {};
}
export {createRule, getEnumNames, requiresQuoting, getParserServices};
`;

const syntaxOnly = {
    name: 'syntax-only-rule-utilities',
    setup(builder) {
        builder.onResolve({filter: /^@typescript-eslint\/utils(?:\/(?:ast-utils|eslint-utils))?$/}, () => ({path: './syntax-rule-utilities.mjs', external: true}));
        builder.onResolve({filter: /^(?:\.\.\/util|\.\.\/\.\.\/util)$/}, (args) => {
            if (!args.importer.includes(`${path.sep}naming-convention`)) {
                return;
            }
            return {path: 'naming-utilities', namespace: 'syntax-only'};
        });
        builder.onLoad({filter: /.*/, namespace: 'syntax-only'}, (args) => ({
            contents: namingUtilities,
            resolveDir: sourceRoot,
            loader: 'js',
        }));
        builder.onLoad({filter: /[/\\]naming-convention\.js$/}, (args) => {
            const source = fs.readFileSync(args.path, 'utf8');
            const original = 'const { unusedVariables } = (0, util_1.collectVariables)(context);';
            if (!source.includes(original)) {
                throw new Error('The naming rule changed; review its syntax-only adaptation.');
            }
            // App has no unused or type selectors. Reject either rather than silently changing their meaning.
            const replacement = `
                if (context.options.some((option) => option.types?.length || option.modifiers?.includes('unused'))) {
                    throw new Error('Type and unused naming selectors are not supported by this syntax-only rule.');
                }
                const unusedVariables = new Set();`;
            return {contents: source.replace(original, replacement), loader: 'js', resolveDir: path.dirname(args.path)};
        });
    },
};

const entries = {
    'syntax-rule-utilities': syntaxUtilities,
    'expensify-rules': `
        ${names.map((name, index) => `import * as rule${index} from ${quote(path.join(pluginPath, `${name}.js`))};`).join('\n')}
        import CONST from ${quote(path.join(pluginPath, 'CONST.js'))};
        import {isInTestFile} from ${quote(path.join(pluginPath, 'utils/index.js'))};
        const rules = {${names.map((name, index) => `${quote(name)}: rule${index}`).join(',')}};
        export {rules, CONST, isInTestFile};
    `,
    'naming-convention': `
        import rule from ${quote(getPackagePath('@typescript-eslint/eslint-plugin', 'dist/rules/naming-convention.js'))};
        export default rule.default;
    `,
    'testing-library': `
        ${testingRules.map((name, index) => `import rule${index} from ${quote(getPackagePath('eslint-plugin-testing-library', `dist/rules/${name}.js`))};`).join('\n')}
        export default {rules: {${testingRules.map((name, index) => `${quote(name)}: rule${index}.default`).join(',')}}};
    `,
    storybook: `export {default} from ${quote(getPackagePath('eslint-plugin-storybook', 'dist/index.js'))};`,
};

for (const [name, contents] of Object.entries(entries)) {
    const result = await build({
        stdin: {contents, resolveDir: sourceRoot, sourcefile: `${name}-entry.mjs`, loader: 'js'},
        outfile: path.join(directory, `${name}.mjs`),
        write: false,
        bundle: true,
        absWorkingDir: sourceRoot,
        preserveSymlinks: true,
        platform: 'node',
        format: 'esm',
        packages: 'external',
        plugins: [syntaxOnly],
        legalComments: 'inline',
        metafile: true,
        banner: {js: `/** Generated by build.mjs. See README.md for source versions, licenses and supported naming selectors. */\nimport {createRequire as createVendorRequire} from 'node:module';\nconst require = createVendorRequire(import.meta.url);`},
    });
    for (const output of Object.values(result.metafile.outputs)) {
        for (const dependency of output.imports) {
            if (/^(?:typescript$|typescript-eslint$|@typescript\/|@typescript-eslint\/(?!types$|scope-manager$|visitor-keys$))/.test(dependency.path)) {
                throw new Error(`The generated ${name} rule imports a compiler dependency: ${dependency.path}`);
            }
        }
    }
    for (const output of result.outputFiles) {
        fs.writeFileSync(output.path, output.contents);
    }
}
