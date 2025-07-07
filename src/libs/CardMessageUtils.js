"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExpensifyCardFromReportAction = getExpensifyCardFromReportAction;
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PolicyUtils_1 = require("./PolicyUtils");
var ReportActionsUtils_1 = require("./ReportActionsUtils");
var allUserCards = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.CARD_LIST,
    callback: function (val) {
        if (!val || Object.keys(val).length === 0) {
            return;
        }
        allUserCards = val;
    },
});
var allWorkspaceCards = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST,
    waitForCollectionCallback: true,
    callback: function (value) {
        allWorkspaceCards = value;
    },
});
function getExpensifyCardFromReportAction(_a) {
    var _b, _c;
    var reportAction = _a.reportAction, policyID = _a.policyID;
    var cardIssuedActionOriginalMessage = (0, ReportActionsUtils_1.isCardIssuedAction)(reportAction) ? (0, ReportActionsUtils_1.getOriginalMessage)(reportAction) : undefined;
    var cardID = (_b = cardIssuedActionOriginalMessage === null || cardIssuedActionOriginalMessage === void 0 ? void 0 : cardIssuedActionOriginalMessage.cardID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var workspaceAccountID = (0, PolicyUtils_1.getWorkspaceAccountID)(policyID);
    var allExpensifyCards = (_c = allWorkspaceCards === null || allWorkspaceCards === void 0 ? void 0 : allWorkspaceCards["cards_".concat(workspaceAccountID, "_").concat(CONST_1.default.EXPENSIFY_CARD.BANK)]) !== null && _c !== void 0 ? _c : {};
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    return (0, PolicyUtils_1.isPolicyAdmin)((0, PolicyUtils_1.getPolicy)(policyID)) ? allExpensifyCards === null || allExpensifyCards === void 0 ? void 0 : allExpensifyCards[cardID] : allUserCards[cardID];
}
