import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const react = require(path.resolve(repoRoot, 'node_modules/eslint-plugin-react'));
const rules = react?.rules ?? react?.default?.rules ?? {};

export default {
    meta: {name: 'esr', version: '0.0.1'},
    rules: {'jsx-no-constructed-context-values': rules['jsx-no-constructed-context-values']},
};
