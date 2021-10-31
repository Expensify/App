const noNegatedVariables = require('./no-negated-variables').rule;
const noOnyxInViews = require('./no-onyx-in-views').rule;
const preferEarlyReturn = require('./prefer-early-return').rule;
const noInlineNamedExport = require('./no-inline-named-export').rule;
const preferImportModuleContents = require('./prefer-import-module-contents').rule;
const preferUnderscoreMethod = require('./prefer-underscore-method').rule;
const noUselessCompose = require('./no-useless-compose').rule;
const noThenableActionsInViews = require('./no-thenable-actions-in-views').rule;

module.exports = {
    'no-negated-variables': noNegatedVariables,
    'no-onyx-in-views': noOnyxInViews,
    'prefer-early-return': preferEarlyReturn,
    'no-inline-named-export': noInlineNamedExport,
    'prefer-import-module-contents': preferImportModuleContents,
    'prefer-underscore-method': preferUnderscoreMethod,
    'no-useless-compose': noUselessCompose,
    'no-thenable-actions-in-views': noThenableActionsInViews,
};
