"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var DecisionModal_1 = require("@components/DecisionModal");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var Illustrations = require("@components/Icon/Illustrations");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useCardsList_1 = require("@hooks/useCardsList");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CardUtils_1 = require("@libs/CardUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var WorkspacePageWithSections_1 = require("@pages/workspace/WorkspacePageWithSections");
var CompanyCards_1 = require("@userActions/CompanyCards");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var WorkspaceCompanyCardPageEmptyState_1 = require("./WorkspaceCompanyCardPageEmptyState");
var WorkspaceCompanyCardsFeedPendingPage_1 = require("./WorkspaceCompanyCardsFeedPendingPage");
var WorkspaceCompanyCardsList_1 = require("./WorkspaceCompanyCardsList");
var WorkspaceCompanyCardsListHeaderButtons_1 = require("./WorkspaceCompanyCardsListHeaderButtons");
function WorkspaceCompanyCardsPage(_a) {
    var _b, _c, _d;
    var route = _a.route;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var policyID = route.params.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: false })[0];
    var workspaceAccountID = (_b = policy === null || policy === void 0 ? void 0 : policy.workspaceAccountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    var lastSelectedFeed = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.LAST_SELECTED_FEED).concat(policyID), { canBeMissing: true })[0];
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var selectedFeed = (0, CardUtils_1.getSelectedFeed)(lastSelectedFeed, cardFeeds);
    var cardsList = (0, useCardsList_1.default)(policyID, selectedFeed)[0];
    var countryByIp = (0, useOnyx_1.default)(ONYXKEYS_1.default.COUNTRY, { canBeMissing: false })[0];
    var _e = (0, useOnyx_1.default)(ONYXKEYS_1.default.CURRENCY_LIST, { canBeMissing: true })[0], currencyList = _e === void 0 ? {} : _e;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var hasNoAssignedCard = Object.keys(cardsList !== null && cardsList !== void 0 ? cardsList : {}).length === 0;
    var _f = cardsList !== null && cardsList !== void 0 ? cardsList : {}, cardList = _f.cardList, cards = __rest(_f, ["cardList"]);
    var _g = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _g.isActingAsDelegate, showDelegateNoAccessModal = _g.showDelegateNoAccessModal;
    var filteredCardList = (0, CardUtils_1.getFilteredCardList)(cardsList, selectedFeed ? (_d = (_c = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _c === void 0 ? void 0 : _c.oAuthAccountDetails) === null || _d === void 0 ? void 0 : _d[selectedFeed] : undefined);
    var companyCards = (0, CardUtils_1.getCompanyFeeds)(cardFeeds);
    var selectedFeedData = selectedFeed && companyCards[selectedFeed];
    var isNoFeed = !selectedFeedData;
    var isPending = !!(selectedFeedData === null || selectedFeedData === void 0 ? void 0 : selectedFeedData.pending);
    var isFeedAdded = !isPending && !isNoFeed;
    var isFeedConnectionBroken = (0, CardUtils_1.checkIfFeedConnectionIsBroken)(cards);
    var _h = (0, react_1.useState)(false), shouldShowOfflineModal = _h[0], setShouldShowOfflineModal = _h[1];
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var domainOrWorkspaceAccountID = (0, CardUtils_1.getDomainOrWorkspaceAccountID)(workspaceAccountID, selectedFeedData);
    var fetchCompanyCards = (0, react_1.useCallback)(function () {
        (0, CompanyCards_1.openPolicyCompanyCardsPage)(policyID, domainOrWorkspaceAccountID);
    }, [policyID, domainOrWorkspaceAccountID]);
    var isOffline = (0, useNetwork_1.default)({ onReconnect: fetchCompanyCards }).isOffline;
    var isLoading = !isOffline && (!cardFeeds || (!!cardFeeds.isLoading && (0, EmptyObject_1.isEmptyObject)(cardsList)));
    var isGB = countryByIp === CONST_1.default.COUNTRY.GB;
    var shouldShowGBDisclaimer = isGB && isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS) && (isNoFeed || hasNoAssignedCard);
    (0, react_1.useEffect)(function () {
        fetchCompanyCards();
    }, [fetchCompanyCards]);
    (0, react_1.useEffect)(function () {
        if (isLoading || !selectedFeed || isPending) {
            return;
        }
        (0, CompanyCards_1.openPolicyCompanyCardsFeed)(domainOrWorkspaceAccountID, policyID, selectedFeed);
    }, [selectedFeed, isLoading, policyID, isPending, domainOrWorkspaceAccountID]);
    var handleAssignCard = function () {
        var _a, _b, _c, _d, _e;
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if (!selectedFeed) {
            return;
        }
        var isCommercialFeed = (0, CardUtils_1.isCustomFeed)(selectedFeed);
        // If the feed is a direct feed (not a commercial feed) and the user is offline,
        // show the offline alert modal to inform them of the connectivity issue.
        if (!isCommercialFeed && isOffline) {
            setShouldShowOfflineModal(true);
            return;
        }
        var data = {
            bankName: selectedFeed,
        };
        var currentStep = CONST_1.default.COMPANY_CARD.STEP.ASSIGNEE;
        var employeeList = Object.values((_a = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _a !== void 0 ? _a : {}).filter(function (employee) { return !(0, PolicyUtils_1.isDeletedPolicyEmployee)(employee, isOffline); });
        var isFeedExpired = (0, CardUtils_1.isSelectedFeedExpired)(selectedFeed ? (_c = (_b = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _b === void 0 ? void 0 : _b.oAuthAccountDetails) === null || _c === void 0 ? void 0 : _c[selectedFeed] : undefined);
        if (employeeList.length === 1) {
            var userEmail = (_e = Object.keys((_d = policy === null || policy === void 0 ? void 0 : policy.employeeList) !== null && _d !== void 0 ? _d : {}).at(0)) !== null && _e !== void 0 ? _e : '';
            data.email = userEmail;
            var personalDetails = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(userEmail);
            var memberName = (personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.firstName) ? personalDetails.firstName : personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login;
            data.cardName = "".concat(memberName, "'s card");
            currentStep = CONST_1.default.COMPANY_CARD.STEP.CARD;
            if ((0, CardUtils_1.hasOnlyOneCardToAssign)(filteredCardList)) {
                currentStep = CONST_1.default.COMPANY_CARD.STEP.TRANSACTION_START_DATE;
                data.cardNumber = Object.keys(filteredCardList).at(0);
                data.encryptedCardNumber = Object.values(filteredCardList).at(0);
            }
        }
        if (isFeedExpired) {
            var institutionId = !!(0, CardUtils_1.getPlaidInstitutionId)(selectedFeed);
            if (institutionId) {
                var country = (0, CardUtils_1.getPlaidCountry)(policy === null || policy === void 0 ? void 0 : policy.outputCurrency, currencyList, countryByIp);
                (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
                    data: {
                        selectedCountry: country,
                    },
                });
            }
            currentStep = institutionId ? CONST_1.default.COMPANY_CARD.STEP.PLAID_CONNECTION : CONST_1.default.COMPANY_CARD.STEP.BANK_CONNECTION;
        }
        (0, CompanyCards_1.clearAddNewCardFlow)();
        (0, CompanyCards_1.setAssignCardStepAndData)({ data: data, currentStep: currentStep });
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS_ASSIGN_CARD.getRoute(policyID, selectedFeed)); });
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED}>
            {!!isLoading && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={styles.flex1} color={theme.spinner}/>)}
            {!isLoading && (<WorkspacePageWithSections_1.default shouldUseScrollView={isNoFeed} icon={Illustrations.CompanyCard} headerText={translate('workspace.common.companyCards')} route={route} shouldShowOfflineIndicatorInWideScreen showLoadingAsFirstRender={false} addBottomSafeAreaPadding>
                    {(isFeedAdded || isPending) && !!selectedFeed && (<WorkspaceCompanyCardsListHeaderButtons_1.default policyID={policyID} selectedFeed={selectedFeed} shouldShowAssignCardButton={isPending || !(0, EmptyObject_1.isEmptyObject)(cards)} handleAssignCard={handleAssignCard}/>)}
                    {isNoFeed && (<WorkspaceCompanyCardPageEmptyState_1.default route={route} shouldShowGBDisclaimer={shouldShowGBDisclaimer}/>)}
                    {isPending && <WorkspaceCompanyCardsFeedPendingPage_1.default />}
                    {isFeedAdded && !isPending && (<WorkspaceCompanyCardsList_1.default cardsList={cardsList} shouldShowGBDisclaimer={shouldShowGBDisclaimer} policyID={policyID} handleAssignCard={handleAssignCard} isDisabledAssignCardButton={!selectedFeedData || isFeedConnectionBroken}/>)}
                </WorkspacePageWithSections_1.default>)}

            <DecisionModal_1.default title={translate('common.youAppearToBeOffline')} prompt={translate('common.offlinePrompt')} isSmallScreenWidth={shouldUseNarrowLayout} onSecondOptionSubmit={function () { return setShouldShowOfflineModal(false); }} secondOptionText={translate('common.buttonConfirm')} isVisible={shouldShowOfflineModal} onClose={function () { return setShouldShowOfflineModal(false); }}/>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceCompanyCardsPage.displayName = 'WorkspaceCompanyCardsPage';
exports.default = WorkspaceCompanyCardsPage;
