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
//   prefer-default-export          eslint-plugin-import  -- native port diverges (#6)
//   order                          eslint-plugin-import  -- no native port (oxfmt also enforces a stricter grouping)
//   no-types                       eslint-plugin-jsdoc   -- no native oxlint port
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Loads a plugin's rule map, tolerating both CJS and ESM-default shapes. */
function rulesOf(packageName) {
    const mod = require(path.resolve(repoRoot, 'node_modules', packageName));
    return mod?.rules ?? mod?.default?.rules ?? {};
}

const react = rulesOf('eslint-plugin-react');
const importPlugin = rulesOf('eslint-plugin-import');
const jsdoc = rulesOf('eslint-plugin-jsdoc');

const plugin = {
    meta: {
        name: 'hosted',
        version: '0.0.1',
    },
    rules: {
        'jsx-no-bind': react['jsx-no-bind'],
        'function-component-definition': react['function-component-definition'],
        'prefer-default-export': importPlugin['prefer-default-export'],
        order: importPlugin.order,
        'no-types': jsdoc['no-types'],
    },
};

export default plugin;
