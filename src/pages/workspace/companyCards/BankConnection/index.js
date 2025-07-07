"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BlockingView_1 = require("@components/BlockingViews/BlockingView");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations_1 = require("@components/Icon/Illustrations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useImportPlaidAccounts_1 = require("@hooks/useImportPlaidAccounts");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var usePrevious_1 = require("@hooks/usePrevious");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CompanyCards_1 = require("@libs/actions/CompanyCards");
var CardUtils_1 = require("@libs/CardUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Card_1 = require("@userActions/Card");
var CompanyCards_2 = require("@userActions/CompanyCards");
var getCompanyCardBankConnection_1 = require("@userActions/getCompanyCardBankConnection");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var openBankConnection_1 = require("./openBankConnection");
var customWindow = null;
function BankConnection(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var policyIDFromProps = _a.policyID, feed = _a.feed, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: true })[0];
    var assignCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ASSIGN_CARD, { canBeMissing: true })[0];
    var theme = (0, useTheme_1.default)();
    var _s = (_b = route === null || route === void 0 ? void 0 : route.params) !== null && _b !== void 0 ? _b : {}, bankNameFromRoute = _s.bankName, backTo = _s.backTo, policyIDFromRoute = _s.policyID;
    var policyID = policyIDFromProps !== null && policyIDFromProps !== void 0 ? policyIDFromProps : policyIDFromRoute;
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var prevFeedsData = (0, usePrevious_1.default)((_c = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _c === void 0 ? void 0 : _c.oAuthAccountDetails);
    var _t = (0, react_1.useState)(false), shouldBlockWindowOpen = _t[0], setShouldBlockWindowOpen = _t[1];
    var selectedBank = (_d = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _d === void 0 ? void 0 : _d.selectedBank;
    var bankName = feed ? (0, CardUtils_1.getBankName)(feed) : ((_f = bankNameFromRoute !== null && bankNameFromRoute !== void 0 ? bankNameFromRoute : (_e = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _e === void 0 ? void 0 : _e.plaidConnectedFeed) !== null && _f !== void 0 ? _f : selectedBank);
    var _u = (0, react_1.useMemo)(function () { var _a, _b, _c; return (0, CardUtils_1.checkIfNewFeedConnected)(prevFeedsData !== null && prevFeedsData !== void 0 ? prevFeedsData : {}, (_b = (_a = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _a === void 0 ? void 0 : _a.oAuthAccountDetails) !== null && _b !== void 0 ? _b : {}, (_c = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _c === void 0 ? void 0 : _c.plaidConnectedFeed); }, [(_g = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _g === void 0 ? void 0 : _g.plaidConnectedFeed, (_h = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _h === void 0 ? void 0 : _h.oAuthAccountDetails, prevFeedsData]), isNewFeedConnected = _u.isNewFeedConnected, newFeed = _u.newFeed;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var plaidToken = (_k = (_j = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _j === void 0 ? void 0 : _j.publicToken) !== null && _k !== void 0 ? _k : (_l = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _l === void 0 ? void 0 : _l.plaidAccessToken;
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var isPlaid = isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS) && !!plaidToken;
    var url = (0, getCompanyCardBankConnection_1.getCompanyCardBankConnection)(policyID, bankName);
    var isFeedExpired = feed ? (0, CardUtils_1.isSelectedFeedExpired)((_o = (_m = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _m === void 0 ? void 0 : _m.oAuthAccountDetails) === null || _o === void 0 ? void 0 : _o[feed]) : false;
    var headerTitleAddCards = !backTo ? translate('workspace.companyCards.addCards') : undefined;
    var headerTitle = feed ? translate('workspace.companyCards.assignCard') : headerTitleAddCards;
    var onImportPlaidAccounts = (0, useImportPlaidAccounts_1.default)(policyID);
    var onOpenBankConnectionFlow = (0, react_1.useCallback)(function () {
        if (!url) {
            return;
        }
        customWindow = (0, openBankConnection_1.default)(url);
    }, [url]);
    var handleBackButtonPress = function () {
        customWindow === null || customWindow === void 0 ? void 0 : customWindow.close();
        // Handle assign card flow
        if (feed) {
            Navigation_1.default.goBack();
            return;
        }
        // Handle add new card flow
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        if (bankName === CONST_1.default.COMPANY_CARDS.BANKS.BREX || isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS)) {
            (0, CompanyCards_2.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.SELECT_BANK });
            return;
        }
        if (bankName === CONST_1.default.COMPANY_CARDS.BANKS.AMEX) {
            (0, CompanyCards_2.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED });
            return;
        }
        (0, CompanyCards_2.setAddNewCompanyCardStepAndData)({ step: CONST_1.default.COMPANY_CARDS.STEP.SELECT_FEED_TYPE });
    };
    var CustomSubtitle = (<Text_1.default style={[styles.textAlignCenter, styles.textSupporting]}>
            {bankName &&
            translate("workspace.moreFeatures.companyCards.pendingBankDescription", {
                bankName: (_q = (_p = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _p === void 0 ? void 0 : _p.plaidConnectedFeedName) !== null && _q !== void 0 ? _q : bankName,
            })}
            <TextLink_1.default onPress={onOpenBankConnectionFlow}>{translate('workspace.moreFeatures.companyCards.pendingBankLink')}</TextLink_1.default>.
        </Text_1.default>);
    (0, react_1.useEffect)(function () {
        var _a;
        if ((!url && !isPlaid) || isOffline) {
            return;
        }
        // Handle assign card flow
        if (feed) {
            if (!isFeedExpired) {
                customWindow === null || customWindow === void 0 ? void 0 : customWindow.close();
                (0, CompanyCards_1.setAssignCardStepAndData)({
                    currentStep: ((_a = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _a === void 0 ? void 0 : _a.dateOption) ? CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION : CONST_1.default.COMPANY_CARD.STEP.ASSIGNEE,
                    isEditing: false,
                });
                return;
            }
            if (isPlaid) {
                onImportPlaidAccounts();
                return;
            }
            if (url) {
                customWindow = (0, openBankConnection_1.default)(url);
                return;
            }
        }
        // Handle add new card flow
        if (isNewFeedConnected) {
            setShouldBlockWindowOpen(true);
            customWindow === null || customWindow === void 0 ? void 0 : customWindow.close();
            if (newFeed) {
                (0, Card_1.updateSelectedFeed)(newFeed, policyID);
            }
            Navigation_1.default.closeRHPFlow();
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS.getRoute(policyID), { forceReplace: true });
            return;
        }
        if (!shouldBlockWindowOpen) {
            if (isPlaid) {
                onImportPlaidAccounts();
                return;
            }
            if (url) {
                customWindow = (0, openBankConnection_1.default)(url);
            }
        }
    }, [isNewFeedConnected, shouldBlockWindowOpen, newFeed, policyID, url, feed, isFeedExpired, isOffline, (_r = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _r === void 0 ? void 0 : _r.dateOption, isPlaid, onImportPlaidAccounts]);
    return (<ScreenWrapper_1.default testID={BankConnection.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
            <HeaderWithBackButton_1.default title={headerTitle} onBackButtonPress={handleBackButtonPress}/>
            <FullPageOfflineBlockingView_1.default addBottomSafeAreaPadding>
                {isPlaid ? (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={styles.flex1} color={theme.spinner}/>) : (<BlockingView_1.default icon={Illustrations_1.PendingBank} iconWidth={styles.pendingBankCardIllustration.width} iconHeight={styles.pendingBankCardIllustration.height} title={translate('workspace.moreFeatures.companyCards.pendingBankTitle')} CustomSubtitle={CustomSubtitle} onLinkPress={onOpenBankConnectionFlow} addBottomSafeAreaPadding/>)}
            </FullPageOfflineBlockingView_1.default>
        </ScreenWrapper_1.default>);
}
BankConnection.displayName = 'BankConnection';
exports.default = BankConnection;
