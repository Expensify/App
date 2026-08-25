import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {withBypassReporting} from '../../config/oxlint/onyxConnectBypass.mjs';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ban = require(path.resolve(repoRoot, 'node_modules/eslint-config-expensify/eslint-plugin-expensify/no-onyx-connect.js'));

const FIXTURE = 'oxlint-migration/onyx-bypass-probe/fixture.ts';

const plugin = {
    meta: {name: 'probe', version: '0.0.1'},
    rules: {
        bypass: withBypassReporting(ban, {grandfathered: new Map()}),
        'bypass-grandfathered': withBypassReporting(ban, {grandfathered: new Map([[FIXTURE, 1]])}),
    },
};

export default plugin;
