"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useOnyx_1 = require("react-native-onyx/dist/useOnyx");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var CompanyCards_1 = require("@libs/actions/CompanyCards");
var Navigation_1 = require("@libs/Navigation/Navigation");
var WorkspaceCompanyCardStatementCloseDateSelectionList_1 = require("@pages/workspace/companyCards/WorkspaceCompanyCardStatementCloseDateSelectionList");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function StatementCloseDateStep(_a) {
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: false })[0];
    var lastSelectedFeed = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_FEED).concat(policyID), { canBeMissing: true })[0];
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var submit = (0, react_1.useCallback)(
    // s77rt make use of statementCloseDate / statementCustomCloseDate and remove disable lint rule
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function (statementCloseDate, statementCustomCloseDate) {
        if (!(addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data.feedDetails)) {
            return;
        }
        (0, CompanyCards_1.addNewCompanyCardsFeed)(policyID, addNewCard.data.feedType, addNewCard.data.feedDetails, cardFeeds, lastSelectedFeed);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_COMPANY_CARDS.getRoute(policyID));
    }, [policyID, addNewCard, cardFeeds, lastSelectedFeed]);
    var goBack = (0, react_1.useCallback)(function () {
        (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.CARD_DETAILS });
    }, []);
    return (<WorkspaceCompanyCardStatementCloseDateSelectionList_1.default confirmText={translate('common.submit')} onSubmit={submit} onBackButtonPress={goBack} enabledWhenOffline={false}/>);
}
StatementCloseDateStep.displayName = 'StatementCloseDateStep';
exports.default = StatementCloseDateStep;
