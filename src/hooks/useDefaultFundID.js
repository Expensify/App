"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CardUtils_1 = require("@libs/CardUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
var useWorkspaceAccountID_1 = require("./useWorkspaceAccountID");
/**
 * Hook to get the default fundID for a given policyID. This is used to get the settings and cards for each of the feeds.
 * It will always return lastSelectedExpensifyCardFeed if it exists or fallback to the domainFundID or workspaceAccountID.
 */
function useDefaultFundID(policyID) {
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var lastSelectedExpensifyCardFeed = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED).concat(policyID), { canBeMissing: true })[0];
    var domainFundID = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: function (cardSettings) {
            var _a;
            var matchingKey = Object.entries(cardSettings !== null && cardSettings !== void 0 ? cardSettings : {}).find(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            function (_a) {
                var key = _a[0], settings = _a[1];
                return (settings === null || settings === void 0 ? void 0 : settings.preferredPolicy) && settings.preferredPolicy === policyID && !key.includes(workspaceAccountID.toString());
            });
            return (0, CardUtils_1.getFundIdFromSettingsKey)((_a = matchingKey === null || matchingKey === void 0 ? void 0 : matchingKey[0]) !== null && _a !== void 0 ? _a : '');
        },
        canBeMissing: true,
    })[0];
    if (lastSelectedExpensifyCardFeed) {
        return lastSelectedExpensifyCardFeed;
    }
    if (domainFundID) {
        return domainFundID;
    }
    if (workspaceAccountID) {
        return workspaceAccountID;
    }
    return CONST_1.default.DEFAULT_NUMBER_ID;
}
exports.default = useDefaultFundID;
