"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
var useWorkspaceAccountID_1 = require("./useWorkspaceAccountID");
function useExpensifyCardFeeds(policyID) {
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var allExpensifyCardFeeds = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {
        selector: function (cardSettings) {
            var matchingEntries = Object.entries(cardSettings !== null && cardSettings !== void 0 ? cardSettings : {}).filter(function (_a) {
                var key = _a[0], settings = _a[1];
                var isDomainFeed = !!((settings === null || settings === void 0 ? void 0 : settings.preferredPolicy) && settings.preferredPolicy === policyID);
                var isWorkspaceFeed = key.includes(workspaceAccountID.toString()) && settings && Object.keys(settings).length > 1;
                return isDomainFeed || isWorkspaceFeed;
            });
            return Object.fromEntries(matchingEntries);
        },
        canBeMissing: true,
    })[0];
    return allExpensifyCardFeeds;
}
exports.default = useExpensifyCardFeeds;
