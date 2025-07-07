"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var FeedSelector_1 = require("@components/FeedSelector");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWorkspaceAccountID_1 = require("@hooks/useWorkspaceAccountID");
var CardUtils_1 = require("@libs/CardUtils");
var Navigation_1 = require("@navigation/Navigation");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceCompanyCardsListHeaderButtons(_a) {
    var _b;
    var policyID = _a.policyID, selectedFeed = _a.selectedFeed, shouldShowAssignCardButton = _a.shouldShowAssignCardButton, handleAssignCard = _a.handleAssignCard;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var illustrations = (0, useThemeIllustrations_1.default)();
    var _c = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _c.shouldUseNarrowLayout, isMediumScreenWidth = _c.isMediumScreenWidth;
    var workspaceAccountID = (0, useWorkspaceAccountID_1.default)(policyID);
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var policy = (0, usePolicy_1.default)(policyID);
    var allFeedsCards = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST), { canBeMissing: false })[0];
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENCY_LIST, { canBeMissing: true })[0], currencyList = _d === void 0 ? {} : _d;
    var countryByIp = (0, useOnyx_1.default)(ONYXKEYS_1.default.COUNTRY, { canBeMissing: false })[0];
    var shouldChangeLayout = isMediumScreenWidth || shouldUseNarrowLayout;
    var formattedFeedName = (0, CardUtils_1.getCustomOrFormattedFeedName)(selectedFeed, (_b = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _b === void 0 ? void 0 : _b.companyCardNicknames);
    var isCommercialFeed = (0, CardUtils_1.isCustomFeed)(selectedFeed);
    var plaidUrl = (0, CardUtils_1.getPlaidInstitutionIconUrl)(selectedFeed);
    var companyFeeds = (0, CardUtils_1.getCompanyFeeds)(cardFeeds);
    var currentFeedData = companyFeeds === null || companyFeeds === void 0 ? void 0 : companyFeeds[selectedFeed];
    var bankName = plaidUrl && formattedFeedName ? formattedFeedName : (0, CardUtils_1.getBankName)(selectedFeed);
    var domainOrWorkspaceAccountID = (0, CardUtils_1.getDomainOrWorkspaceAccountID)(workspaceAccountID, currentFeedData);
    var filteredFeedCards = (0, CardUtils_1.filterInactiveCards)(allFeedsCards === null || allFeedsCards === void 0 ? void 0 : allFeedsCards["".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(domainOrWorkspaceAccountID, "_").concat(selectedFeed)]);
    var isSelectedFeedConnectionBroken = (0, CardUtils_1.checkIfFeedConnectionIsBroken)(filteredFeedCards);
    var openBankConnection = function () {
        var institutionId = !!(0, CardUtils_1.getPlaidInstitutionId)(selectedFeed);
        if (institutionId) {
            var country = (0, CardUtils_1.getPlaidCountry)(policy === null || policy === void 0 ? void 0 : policy.outputCurrency, currencyList, countryByIp);
            (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
                data: {
                    selectedCountry: country,
                },
            });
            (0, CompanyCards_1.setAssignCardStepAndData)({
                currentStep: CONST_1.default.COMPANY_CARD.STEP.PLAID_CONNECTION,
            });
            Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, selectedFeed)); });
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_BANK_CONNECTION.getRoute(policyID, bankName, Navigation_1.default.getActiveRoute()));
    };
    var secondaryActions = (0, react_1.useMemo)(function () { return [
        {
            icon: Expensicons.Gear,
            text: translate('common.settings'),
            onSelected: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID)); },
            value: CONST_1.default.POLICY.SECONDARY_ACTIONS.SETTINGS,
        },
    ]; }, [policyID, translate]);
    return (<react_native_1.View>
            <react_native_1.View style={[styles.w100, styles.ph5, !shouldChangeLayout ? [styles.pv2, styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween] : styles.pb2]}>
                <FeedSelector_1.default plaidUrl={plaidUrl} onFeedSelect={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_SELECT_FEED.getRoute(policyID)); }} cardIcon={(0, CardUtils_1.getCardFeedIcon)(selectedFeed, illustrations)} shouldChangeLayout={shouldChangeLayout} feedName={formattedFeedName} supportingText={translate(isCommercialFeed ? 'workspace.companyCards.commercialFeed' : 'workspace.companyCards.directFeed')} shouldShowRBR={(0, CardUtils_1.checkIfFeedConnectionIsBroken)((0, CardUtils_1.flatAllCardsList)(allFeedsCards, domainOrWorkspaceAccountID), selectedFeed)}/>
                <react_native_1.View style={[styles.flexRow, styles.gap2]}>
                    {!!shouldShowAssignCardButton && (<Button_1.default success isDisabled={!currentFeedData || !!(currentFeedData === null || currentFeedData === void 0 ? void 0 : currentFeedData.pending) || isSelectedFeedConnectionBroken} onPress={handleAssignCard} icon={Expensicons.Plus} text={translate('workspace.companyCards.assignCard')} style={shouldChangeLayout && styles.flex1}/>)}
                    <ButtonWithDropdownMenu_1.default success={false} onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('common.more')} options={secondaryActions} isSplitButton={false} wrapperStyle={shouldShowAssignCardButton ? styles.flexGrow0 : styles.flex1}/>
                </react_native_1.View>
            </react_native_1.View>
            {isSelectedFeedConnectionBroken && !!bankName && (<react_native_1.View style={[styles.flexRow, styles.ph5, styles.alignItemsCenter]}>
                    <Icon_1.default src={Expensicons.DotIndicator} fill={theme.danger} additionalStyles={styles.mr1}/>
                    <Text_1.default style={[styles.offlineFeedback.text, styles.pr5]}>
                        <Text_1.default style={[StyleUtils.getDotIndicatorTextStyles(true)]}>{translate('workspace.companyCards.brokenConnectionErrorFirstPart')}</Text_1.default>
                        <TextLink_1.default style={[StyleUtils.getDotIndicatorTextStyles(), styles.link]} onPress={openBankConnection}>
                            {translate('workspace.companyCards.brokenConnectionErrorLink')}
                        </TextLink_1.default>
                        <Text_1.default style={[StyleUtils.getDotIndicatorTextStyles(true)]}>{translate('workspace.companyCards.brokenConnectionErrorSecondPart')}</Text_1.default>
                    </Text_1.default>
                </react_native_1.View>)}
        </react_native_1.View>);
}
WorkspaceCompanyCardsListHeaderButtons.displayName = 'WorkspaceCompanyCardsListHeaderButtons';
exports.default = WorkspaceCompanyCardsListHeaderButtons;
