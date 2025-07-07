"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CardUtils_1 = require("@libs/CardUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useCardFeeds_1 = require("./useCardFeeds");
var useOnyx_1 = require("./useOnyx");
var useWorkspaceAccountID_1 = require("./useWorkspaceAccountID");
/* Custom hook that retrieves a list of company cards for the given policy and selected feed. */
var useCardsList = function (policyID, selectedFeed) {
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var companyCards = (0, CardUtils_1.getCompanyFeeds)(cardFeeds);
    var domainOrWorkspaceAccountID = (0, CardUtils_1.getDomainOrWorkspaceAccountID)(workspaceAccountID, selectedFeed ? companyCards[selectedFeed] : undefined);
    var _a = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(selectedFeed), {
        selector: CardUtils_1.filterInactiveCards,
        canBeMissing: true,
    }), cardsList = _a[0], cardsListMetadata = _a[1];
    return [cardsList, cardsListMetadata];
};
exports.default = useCardsList;
