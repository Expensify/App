"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var expensify_card_svg_1 = require("@assets/images/expensify-card.svg");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useDefaultFundID_1 = require("@hooks/useDefaultFundID");
var useExpensifyCardFeeds_1 = require("@hooks/useExpensifyCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var variables_1 = require("@styles/variables");
var Card_1 = require("@userActions/Card");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceExpensifyCardSelectorPage(_a) {
    var route = _a.route;
    var policyID = route.params.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var lastSelectedExpensifyCardFeed = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED).concat(policyID))[0];
    var defaultFundID = (0, useDefaultFundID_1.default)(policyID);
    var lastSelectedExpensifyCardFeedID = lastSelectedExpensifyCardFeed !== null && lastSelectedExpensifyCardFeed !== void 0 ? lastSelectedExpensifyCardFeed : defaultFundID;
    var allExpensifyCardFeeds = (0, useExpensifyCardFeeds_1.default)(policyID);
    var feeds = Object.entries(allExpensifyCardFeeds !== null && allExpensifyCardFeeds !== void 0 ? allExpensifyCardFeeds : {}).map(function (_a) {
        var _b, _c;
        var key = _a[0], value = _a[1];
        var fundID = (_b = (0, CardUtils_1.getFundIdFromSettingsKey)(key)) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
        return {
            value: fundID,
            text: (0, PolicyUtils_1.getDescriptionForPolicyDomainCard)((_c = value === null || value === void 0 ? void 0 : value.domainName) !== null && _c !== void 0 ? _c : ''),
            keyForList: fundID.toString(),
            isSelected: fundID === lastSelectedExpensifyCardFeedID,
            leftElement: (<Icon_1.default src={expensify_card_svg_1.default} height={variables_1.default.cardIconHeight} width={variables_1.default.cardIconWidth} additionalStyles={[styles.mr3, styles.cardIcon]}/>),
        };
    });
    var goBack = function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)); };
    var selectFeed = function (feed) {
        (0, Card_1.updateSelectedExpensifyCardFeed)(feed.value, policyID);
        goBack();
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceExpensifyCardSelectorPage.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.companyCards.selectCards')} onBackButtonPress={goBack}/>
                <SelectionList_1.default ListItem={RadioListItem_1.default} onSelectRow={selectFeed} sections={[{ data: feeds }]} shouldUpdateFocusedIndex isAlternateTextMultilineSupported initiallyFocusedOptionKey={lastSelectedExpensifyCardFeed === null || lastSelectedExpensifyCardFeed === void 0 ? void 0 : lastSelectedExpensifyCardFeed.toString()}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceExpensifyCardSelectorPage.displayName = 'WorkspaceExpensifyCardSelectorPage';
exports.default = WorkspaceExpensifyCardSelectorPage;
