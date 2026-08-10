// Probe: re-export ESLint's core no-restricted-syntax rule as an oxlint JS plugin.
import {builtinRules} from 'eslint/use-at-your-own-risk';

const plugin = {
    meta: {
        name: 'core',
        version: '0.0.1',
    },
    rules: {
        'no-restricted-syntax': builtinRules.get('no-restricted-syntax'),
    },
};

export default plugin;
