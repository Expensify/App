"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var expensify_card_svg_1 = require("@assets/images/expensify-card.svg");
var Button_1 = require("@components/Button");
var ButtonWithDropdownMenu_1 = require("@components/ButtonWithDropdownMenu");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var FeedSelector_1 = require("@components/FeedSelector");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var Illustrations_1 = require("@components/Icon/Illustrations");
var LockedAccountModalProvider_1 = require("@components/LockedAccountModalProvider");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Pressable_1 = require("@components/Pressable");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var SearchBar_1 = require("@components/SearchBar");
var Text_1 = require("@components/Text");
var useBottomSafeSafeAreaPaddingStyle_1 = require("@hooks/useBottomSafeSafeAreaPaddingStyle");
var useEmptyViewHeaderHeight_1 = require("@hooks/useEmptyViewHeaderHeight");
var useExpensifyCardFeeds_1 = require("@hooks/useExpensifyCardFeeds");
var useHandleBackButton_1 = require("@hooks/useHandleBackButton");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSearchResults_1 = require("@hooks/useSearchResults");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var PaymentMethods_1 = require("@libs/actions/PaymentMethods");
var CardUtils_1 = require("@libs/CardUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var EmptyCardView_1 = require("./EmptyCardView");
var WorkspaceCardListHeader_1 = require("./WorkspaceCardListHeader");
var WorkspaceCardListLabels_1 = require("./WorkspaceCardListLabels");
var WorkspaceCardListRow_1 = require("./WorkspaceCardListRow");
function WorkspaceExpensifyCardListPage(_a) {
    var _b, _c;
    var route = _a.route, cardsList = _a.cardsList, fundID = _a.fundID;
    var _d = (0, useResponsiveLayout_1.default)(), shouldUseNarrowLayout = _d.shouldUseNarrowLayout, isMediumScreenWidth = _d.isMediumScreenWidth;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var cardOnWaitlist = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.NVP_EXPENSIFY_ON_CARD_WAITLIST).concat(policyID), { canBeMissing: true })[0];
    var cardSettings = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS).concat(fundID), { canBeMissing: false })[0];
    var allExpensifyCardFeeds = (0, useExpensifyCardFeeds_1.default)(policyID);
    var shouldShowSelector = Object.keys(allExpensifyCardFeeds !== null && allExpensifyCardFeeds !== void 0 ? allExpensifyCardFeeds : {}).length > 1;
    var _e = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _e.isActingAsDelegate, showDelegateNoAccessModal = _e.showDelegateNoAccessModal;
    var _f = (0, react_1.useContext)(LockedAccountModalProvider_1.LockedAccountContext), isAccountLocked = _f.isAccountLocked, showLockedAccountModal = _f.showLockedAccountModal;
    var shouldChangeLayout = isMediumScreenWidth || shouldUseNarrowLayout;
    var isBankAccountVerified = !cardOnWaitlist;
    var windowHeight = (0, useWindowDimensions_1.default)().windowHeight;
    var headerHeight = (0, useEmptyViewHeaderHeight_1.default)(shouldUseNarrowLayout, isBankAccountVerified);
    var policyCurrency = (0, react_1.useMemo)(function () { var _a; return (_a = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _a !== void 0 ? _a : CONST_1.default.CURRENCY.USD; }, [policy]);
    var allCards = (0, react_1.useMemo)(function () {
        var policyMembersAccountIDs = Object.values((0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList));
        return (0, CardUtils_1.getCardsByCardholderName)(cardsList, policyMembersAccountIDs);
    }, [cardsList, policy === null || policy === void 0 ? void 0 : policy.employeeList]);
    var filterCard = (0, react_1.useCallback)(function (card, searchInput) { return (0, CardUtils_1.filterCardsByPersonalDetails)(card, searchInput, personalDetails); }, [personalDetails]);
    var sortCards = (0, react_1.useCallback)(function (cards) { return (0, CardUtils_1.sortCardsByCardholderName)(cards, personalDetails); }, [personalDetails]);
    var _g = (0, useSearchResults_1.default)(allCards, filterCard, sortCards), inputValue = _g[0], setInputValue = _g[1], filteredSortedCards = _g[2];
    var handleIssueCardPress = function () {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        var activeRoute = Navigation_1.default.getActiveRoute();
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, activeRoute));
    };
    var secondaryActions = (0, react_1.useMemo)(function () { return [
        {
            icon: Expensicons_1.Gear,
            text: translate('common.settings'),
            onSelected: function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID)); },
            value: CONST_1.default.POLICY.SECONDARY_ACTIONS.SETTINGS,
        },
    ]; }, [policyID, translate]);
    var getHeaderButtons = function () { return (<react_native_1.View style={[styles.flexRow, styles.gap2, shouldChangeLayout && styles.mb3, shouldShowSelector && shouldChangeLayout && styles.mt3]}>
            <Button_1.default success onPress={handleIssueCardPress} icon={Expensicons_1.Plus} text={translate('workspace.expensifyCard.issueCard')} style={shouldChangeLayout && styles.flex1}/>
            <ButtonWithDropdownMenu_1.default success={false} onPress={function () { }} shouldAlwaysShowDropdownMenu customText={translate('common.more')} options={secondaryActions} isSplitButton={false} wrapperStyle={styles.flexGrow0}/>
        </react_native_1.View>); };
    var renderItem = (0, react_1.useCallback)(function (_a) {
        var _b, _c, _d, _e, _f, _g, _h, _j;
        var item = _a.item, index = _a.index;
        return (<OfflineWithFeedback_1.default key={"".concat((_b = item.nameValuePairs) === null || _b === void 0 ? void 0 : _b.cardTitle, "_").concat(index)} pendingAction={item.pendingAction} errorRowStyles={styles.ph5} errors={item.errors} onClose={function () { return (0, PaymentMethods_1.clearDeletePaymentMethodError)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_CARDS_LIST).concat(workspaceAccountID, "_").concat(CONST_1.default.EXPENSIFY_CARD.BANK), item.cardID); }}>
                <Pressable_1.PressableWithFeedback role={CONST_1.default.ROLE.BUTTON} style={[styles.mh5, styles.br3, styles.mb3, styles.highlightBG]} accessibilityLabel="row" hoverStyle={[styles.hoveredComponentBG]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, item.cardID.toString())); }}>
                    <WorkspaceCardListRow_1.default lastFourPAN={(_c = item.lastFourPAN) !== null && _c !== void 0 ? _c : ''} cardholder={personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_d = item.accountID) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID]} limit={(_f = (_e = item.nameValuePairs) === null || _e === void 0 ? void 0 : _e.unapprovedExpenseLimit) !== null && _f !== void 0 ? _f : 0} name={(_h = (_g = item.nameValuePairs) === null || _g === void 0 ? void 0 : _g.cardTitle) !== null && _h !== void 0 ? _h : ''} currency={policyCurrency} isVirtual={!!((_j = item.nameValuePairs) === null || _j === void 0 ? void 0 : _j.isVirtual)}/>
                </Pressable_1.PressableWithFeedback>
            </OfflineWithFeedback_1.default>);
    }, [personalDetails, policyCurrency, policyID, workspaceAccountID, styles]);
    var isSearchEmpty = filteredSortedCards.length === 0 && inputValue.length > 0;
    var renderListHeader = (<>
            <react_native_1.View style={[styles.appBG, styles.flexShrink0, styles.flexGrow1]}>
                <WorkspaceCardListLabels_1.default policyID={policyID} cardSettings={cardSettings}/>
                {allCards.length > CONST_1.default.SEARCH_ITEM_LIMIT && (<SearchBar_1.default label={translate('workspace.expensifyCard.findCard')} inputValue={inputValue} onChangeText={setInputValue} shouldShowEmptyState={isSearchEmpty} style={[styles.mb0, styles.mt5]}/>)}
            </react_native_1.View>
            {!isSearchEmpty && <WorkspaceCardListHeader_1.default cardSettings={cardSettings}/>}
        </>);
    var bottomSafeAreaPaddingStyle = (0, useBottomSafeSafeAreaPaddingStyle_1.default)();
    var handleBackButtonPress = function () {
        Navigation_1.default.popToSidebar();
        return true;
    };
    (0, useHandleBackButton_1.default)(handleBackButtonPress);
    return (<ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldShowOfflineIndicatorInWideScreen shouldEnableMaxHeight testID={WorkspaceExpensifyCardListPage.displayName}>
            <HeaderWithBackButton_1.default icon={Illustrations_1.HandCard} shouldUseHeadlineHeader title={translate('workspace.common.expensifyCard')} shouldShowBackButton={shouldUseNarrowLayout} onBackButtonPress={handleBackButtonPress}>
                {!shouldShowSelector && !shouldUseNarrowLayout && isBankAccountVerified && getHeaderButtons()}
            </HeaderWithBackButton_1.default>
            {!shouldShowSelector && shouldUseNarrowLayout && isBankAccountVerified && <react_native_1.View style={styles.ph5}>{getHeaderButtons()}</react_native_1.View>}
            {shouldShowSelector && (<react_native_1.View style={[styles.w100, styles.ph5, styles.pb2, !shouldChangeLayout && [styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]]}>
                    <FeedSelector_1.default onFeedSelect={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_EXPENSIFY_CARD_SELECT_FEED.getRoute(policyID)); }} cardIcon={expensify_card_svg_1.default} feedName={translate('workspace.common.expensifyCard')} supportingText={(0, PolicyUtils_1.getDescriptionForPolicyDomainCard)((_c = cardSettings === null || cardSettings === void 0 ? void 0 : cardSettings.domainName) !== null && _c !== void 0 ? _c : '')}/>
                    {isBankAccountVerified && getHeaderButtons()}
                </react_native_1.View>)}
            {(0, EmptyObject_1.isEmptyObject)(cardsList) ? (<EmptyCardView_1.default isBankAccountVerified={isBankAccountVerified}/>) : (<ScrollView_1.default addBottomSafeAreaPadding showsVerticalScrollIndicator={false}>
                    <react_native_1.View style={{ height: windowHeight - headerHeight }}>
                        <react_native_1.FlatList data={filteredSortedCards} renderItem={renderItem} ListHeaderComponent={renderListHeader} contentContainerStyle={bottomSafeAreaPaddingStyle} keyboardShouldPersistTaps="handled"/>
                    </react_native_1.View>
                    <Text_1.default style={[styles.textMicroSupporting, styles.m5]}>{translate('workspace.expensifyCard.disclaimer')}</Text_1.default>
                </ScrollView_1.default>)}
        </ScreenWrapper_1.default>);
}
WorkspaceExpensifyCardListPage.displayName = 'WorkspaceExpensifyCardListPage';
exports.default = WorkspaceExpensifyCardListPage;
