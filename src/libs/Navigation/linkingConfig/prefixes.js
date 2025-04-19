
exports.__esModule = true;
const CONST_1 = require('@src/CONST');

const prefixes = [
    'app://-/',
    'new-expensify://',
    'https://www.expensify.cash',
    'https://staging.expensify.cash',
    'https://dev.new.expensify.com',
    CONST_1['default'].NEW_EXPENSIFY_URL,
    CONST_1['default'].STAGING_NEW_EXPENSIFY_URL,
];
exports['default'] = prefixes;
