"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var PlaidCardFeedIcon_1 = require("@components/PlaidCardFeedIcon");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var variables_1 = require("@styles/variables");
var Card_1 = require("@userActions/Card");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceCompanyCardFeedSelectorPage(_a) {
    var _b;
    var route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var illustrations = (0, useThemeIllustrations_1.default)();
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var allFeedsCards = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST), { canBeMissing: false })[0];
    var lastSelectedFeed = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_FEED).concat(policyID), { canBeMissing: true })[0];
    var selectedFeed = (0, CardUtils_1.getSelectedFeed)(lastSelectedFeed, cardFeeds);
    var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeeds);
    var isCollect = (0, PolicyUtils_1.isCollectPolicy)(policy);
    var feeds = Object.entries(companyFeeds).map(function (_a) {
        var _b, _c, _d;
        var key = _a[0], feedSettings = _a[1];
        var feed = key;
        var filteredFeedCards = (0, CardUtils_1.filterInactiveCards)(allFeedsCards === null || allFeedsCards === void 0 ? void 0 : allFeedsCards["".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat((0, CardUtils_1.getDomainOrWorkspaceAccountID)(workspaceAccountID, feedSettings), "_").concat(feed)]);
        var isFeedConnectionBroken = (0, CardUtils_1.checkIfFeedConnectionIsBroken)(filteredFeedCards);
        var plaidUrl = (0, CardUtils_1.getPlaidInstitutionIconUrl)(feed);
        return {
            value: feed,
            text: (0, CardUtils_1.getCustomOrFormattedFeedName)(feed, (_b = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _b === void 0 ? void 0 : _b.companyCardNicknames),
            keyForList: feed,
            isSelected: feed === selectedFeed,
            isDisabled: ((_c = companyFeeds[feed]) === null || _c === void 0 ? void 0 : _c.pendingAction) === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            pendingAction: (_d = companyFeeds[feed]) === null || _d === void 0 ? void 0 : _d.pendingAction,
            brickRoadIndicator: isFeedConnectionBroken ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            canShowSeveralIndicators: isFeedConnectionBroken,
            leftElement: plaidUrl ? (<PlaidCardFeedIcon_1.default plaidUrl={plaidUrl} style={styles.mr3}/>) : (<Icon_1.default src={(0, CardUtils_1.getCardFeedIcon)(feed, illustrations)} height={variables_1.default.cardIconHeight} width={variables_1.default.cardIconWidth} additionalStyles={[styles.mr3, styles.cardIcon]}/>),
        };
    });
    var onAddCardsPress = function () {
        (0, CompanyCards_1.clearAddNewCardFlow)();
        if (isCollect && feeds.length === 1) {
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.companyCards.alias, ROUTES_1.default.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID)));
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_ADD_NEW.getRoute(policyID));
    };
    var goBack = function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_COMPANY_CARDS.getRoute(policyID)); };
    var selectFeed = function (feed) {
        (0, Card_1.updateSelectedFeed)(feed.value, policyID);
        goBack();
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceCompanyCardFeedSelectorPage.displayName} shouldEnablePickerAvoiding={false} shouldEnableMaxHeight enableEdgeToEdgeBottomSafeAreaPadding>
                <HeaderWithBackButton_1.default title={translate('workspace.companyCards.selectCards')} onBackButtonPress={goBack}/>
                <SelectionList_1.default ListItem={RadioListItem_1.default} onSelectRow={selectFeed} sections={[{ data: feeds }]} shouldUpdateFocusedIndex isAlternateTextMultilineSupported initiallyFocusedOptionKey={selectedFeed} addBottomSafeAreaPadding listFooterContent={<MenuItem_1.default title={translate('workspace.companyCards.addCards')} icon={Expensicons.Plus} onPress={onAddCardsPress}/>}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceCompanyCardFeedSelectorPage.displayName = 'WorkspaceCompanyCardFeedSelectorPage';
exports.default = WorkspaceCompanyCardFeedSelectorPage;
