'use strict';
exports.__esModule = true;
var CONST_1 = require('@src/CONST');
function canUseAllBetas(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.ALL));
}
function canUseDefaultRooms(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.DEFAULT_ROOMS)) || canUseAllBetas(betas);
}
function canUseSpotnanaTravel(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.SPOTNANA_TRAVEL)) || canUseAllBetas(betas);
}
function isBlockedFromSpotnanaTravel(betas) {
    // Don't check for all betas or nobody can use test travel on dev
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.PREVENT_SPOTNANA_TRAVEL));
}
function canUseNetSuiteUSATax(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.NETSUITE_USA_TAX)) || canUseAllBetas(betas);
}
/**
 * Link previews are temporarily disabled.
 */
function canUseLinkPreviews() {
    return false;
}
function canUseMergeAccounts(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.NEWDOT_MERGE_ACCOUNTS)) || canUseAllBetas(betas);
}
function canUsePDFExport(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.NEWDOT_PDF_EXPORT)) || canUseAllBetas(betas);
}
function canUseManagerMcTest(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.NEWDOT_MANAGER_MCTEST)) || canUseAllBetas(betas);
}
function canUseCustomRules(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.CUSTOM_RULES)) || canUseAllBetas(betas);
}
function canUseTableReportView(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.TABLE_REPORT_VIEW)) || canUseAllBetas(betas);
}
function canUseTalkToAISales(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.NEW_DOT_TALK_TO_AI_SALES)) || canUseAllBetas(betas);
}
function canUseProhibitedExpenses(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.RECEIPT_LINE_ITEMS)) || canUseAllBetas(betas);
}
function canUseLeftHandBar(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.LEFT_HAND_BAR)) || canUseAllBetas(betas);
}
function canUseInAppProvisioning(betas) {
    return !!(betas === null || betas === void 0 ? void 0 : betas.includes(CONST_1['default'].BETAS.WALLET)) || canUseAllBetas(betas);
}
exports['default'] = {
    canUseDefaultRooms: canUseDefaultRooms,
    canUseLinkPreviews: canUseLinkPreviews,
    canUseSpotnanaTravel: canUseSpotnanaTravel,
    isBlockedFromSpotnanaTravel: isBlockedFromSpotnanaTravel,
    canUseNetSuiteUSATax: canUseNetSuiteUSATax,
    canUsePDFExport: canUsePDFExport,
    canUseMergeAccounts: canUseMergeAccounts,
    canUseManagerMcTest: canUseManagerMcTest,
    canUseCustomRules: canUseCustomRules,
    canUseTableReportView: canUseTableReportView,
    canUseTalkToAISales: canUseTalkToAISales,
    canUseProhibitedExpenses: canUseProhibitedExpenses,
    canUseLeftHandBar: canUseLeftHandBar,
    canUseInAppProvisioning: canUseInAppProvisioning,
};
