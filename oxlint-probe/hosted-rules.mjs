// Hosts ESLint plugin rules that oxlint either does not implement or implements
// differently. Every rule object is loaded from the same package ESLint uses, so the
// behaviour is identical by construction (each one is covered by a fixture in
// oxlint-probe/port-probe, which fails if the two tools ever diverge).
//
// oxlint reserves the plugin names `react`, `import` and `jsdoc` for its native rules, so
// these are aliased as 'hosted/<name>'. That alias is deliberate for the two rules where
// oxlint DOES have a native port: it makes the shadowing explicit instead of silently
// depending on which implementation wins. Suppression comments need the aliased id:
//     /* oxlint-disable-next-line hosted/jsx-no-bind */ // eslint-disable-next-line react/jsx-no-bind
//
//   jsx-no-bind                    eslint-plugin-react   -- no native oxlint port
//   function-component-definition  eslint-plugin-react   -- native port diverges (#6)
//   jsx-no-constructed-context-    eslint-plugin-react   -- native port diverges, AND this one
//     values                                                needs the React Compiler gate, which
//                                                           only a JS plugin can host
//   prefer-default-export          eslint-plugin-import  -- native port diverges (#6)
//   order                          eslint-plugin-import  -- no native port (oxfmt also enforces a stricter grouping)
//   no-types                       eslint-plugin-jsdoc   -- no native oxlint port
//   naming-convention              typescript-eslint     -- tsgolint lists it unimplemented (see the stub below)
//   IMPORT_PATHS (3)               eslint-plugin-import  -- no native port; oxlint's import plugin
//                                                          has 33 rules and none of these three
//   REACT_LEGACY (17)              eslint-plugin-react   -- no native port; PropTypes statics and
//                                                          class-member ordering are not modelled
//                                                          by oxlint's Rust react rules
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {withFullGating} from './reactCompilerGate.mjs';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Loads a plugin's rule map, tolerating both CJS and ESM-default shapes. */
function rulesOf(packageName) {
    let mod;
    try {
        // absolute path first, so the copy is pinned rather than resolved through node_modules
        mod = require(path.resolve(repoRoot, 'node_modules', packageName));
    } catch {
        // a directory require ignores the package's `exports` map, so packages that ship no
        // `main` (typescript-eslint) resolve only by bare specifier
        mod = require(packageName);
    }
    return mod?.rules ?? mod?.default?.rules ?? {};
}

const react = rulesOf('eslint-plugin-react');
const importPlugin = rulesOf('eslint-plugin-import');
const jsdoc = rulesOf('eslint-plugin-jsdoc');
const typescriptEslint = rulesOf('@typescript-eslint/eslint-plugin');

// naming-convention asks for parser services at startup, but with OUR options it never uses
// them: the type checker is only reached from a `types` selector (naming-convention-utils/
// validator.js -- `if (config.types == null) return true`) and eslint-config-expensify's five
// selector groups use none. The single value it reads off the TS program is
// `compilerOptions.target`, fed to requiresQuoting(name, target = ts.ScriptTarget.ESNext) --
// so an absent program just means the ESNext default, which only changes the verdict for
// identifiers whose validity differs between script targets.
//
// getParserServices(context, true) tolerates a missing `program` but hard-fails on missing
// node maps, and reads context.languageOptions before any check. Both are stubbed here.
// The namingConvention fixture is what proves the behaviour is identical, not this note.
const STUB_PARSER_SERVICES = {
    esTreeNodeToTSNodeMap: new Map(),
    tsNodeToESTreeNodeMap: new Map(),
};

function withStubbedParserServices(rule) {
    return {
        ...rule,
        create(context) {
            const sourceCode = context.sourceCode ?? context.getSourceCode();
            // Prototype shadowing, not a Proxy: oxlint defines `parserServices` as a read-only,
            // non-configurable data property, and a Proxy get trap may not return a different
            // value for one of those.
            const stubbedSourceCode = Object.create(sourceCode, {
                parserServices: {value: STUB_PARSER_SERVICES},
            });
            const stubbedContext = Object.create(context, {
                sourceCode: {value: stubbedSourceCode},
                getSourceCode: {value: () => stubbedSourceCode},
                languageOptions: {
                    value: context.languageOptions ?? {parser: {meta: {name: 'oxlint-js-plugin'}}},
                },
            });
            return rule.create(stubbedContext);
        },
    };
}

// Grouped rather than listed one per line: within each group every rule is here for the same
// reason, and the alias is the only thing that changes about them.
const IMPORT_PATHS = ['no-import-module-exports', 'no-relative-packages', 'no-useless-path-segments'];

// The PropTypes / class-component era. Nothing in this list can fire on a function component
// with a TS props type, which is why the repo has zero findings for all 17 -- they guard against
// regressing back to the old style, so "no findings" is the rule working, not the rule being dead.
// jsx-uses-react and jsx-uses-vars are different in kind: they never report, they only mark
// identifiers as used for no-unused-vars. oxlint's own no-unused-vars is already JSX-aware
// (full-repo parity holds with thousands of JSX-only imports), so hosting them changes nothing
// -- they are here so the rule sets match exactly rather than "match except for two".
const REACT_LEGACY = [
    'default-props-match-prop-types',
    'forbid-foreign-prop-types',
    'forbid-prop-types',
    'jsx-uses-react',
    'jsx-uses-vars',
    'no-access-state-in-setstate',
    'no-arrow-function-lifecycle',
    'no-deprecated',
    'no-invalid-html-attribute',
    'no-typos',
    'no-unused-class-component-methods',
    'no-unused-prop-types',
    'no-unused-state',
    'prefer-exact-props',
    'prefer-stateless-function',
    'sort-comp',
    'static-property-placement',
];

const plugin = {
    meta: {
        name: 'hosted',
        version: '0.0.1',
    },
    rules: {
        'jsx-no-bind': react['jsx-no-bind'],
        'function-component-definition': react['function-component-definition'],
        // ESLint's processor drops every message from this rule in a dual-memoized file, so the
        // gate is what keeps oxlint at parity. Without it: 69 findings ESLint never shows.
        'jsx-no-constructed-context-values': withFullGating(react['jsx-no-constructed-context-values']),
        'prefer-default-export': importPlugin['prefer-default-export'],
        order: importPlugin.order,
        'no-types': jsdoc['no-types'],
        'naming-convention': withStubbedParserServices(typescriptEslint['naming-convention']),
        ...Object.fromEntries(IMPORT_PATHS.map((name) => [name, importPlugin[name]])),
        ...Object.fromEntries(REACT_LEGACY.map((name) => [name, react[name]])),
    },
};

export default plugin;
