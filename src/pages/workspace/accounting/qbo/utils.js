"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldShowLocationsLineItemsRestriction = shouldShowLocationsLineItemsRestriction;
exports.shouldSwitchLocationsToReportFields = shouldSwitchLocationsToReportFields;
var CONST_1 = require("@src/CONST");
function shouldShowLocationsLineItemsRestriction(config) {
    return !((config === null || config === void 0 ? void 0 : config.reimbursableExpensesExportDestination) === CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY &&
        (config === null || config === void 0 ? void 0 : config.nonReimbursableExpensesExportDestination) === CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_ACCOUNT_TYPE.CREDIT_CARD);
}
function shouldSwitchLocationsToReportFields(config) {
    return (config === null || config === void 0 ? void 0 : config.syncLocations) === CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG && shouldShowLocationsLineItemsRestriction(config);
}
