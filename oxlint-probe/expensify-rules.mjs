import * as noUseOnyxDependenciesArg from '../eslint-plugin-local-rules/no-useOnyx-dependencies-arg.js';
// Feasibility probe: expose Expensify's rulesdir-loaded ESLint rules to oxlint
// via the JS Plugins API (alpha). Wraps two representative rules:
// - eslint-config-expensify/eslint-plugin-expensify/no-onyx-connect (shipped in node_modules)
// - eslint-plugin-local-rules/no-useOnyx-dependencies-arg (in-repo)
import * as noOnyxConnect from '../node_modules/eslint-config-expensify/eslint-plugin-expensify/no-onyx-connect.js';

const plugin = {
    meta: {
        name: 'expensify',
        version: '0.0.1',
    },
    rules: {
        'no-onyx-connect': noOnyxConnect,
        'no-useOnyx-dependencies-arg': noUseOnyxDependenciesArg,
    },
};

export default plugin;
