"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_webview_1 = require("react-native-webview");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useCardFeeds_1 = require("@hooks/useCardFeeds");
var useImportPlaidAccounts_1 = require("@hooks/useImportPlaidAccounts");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var usePrevious_1 = require("@hooks/usePrevious");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Card_1 = require("@libs/actions/Card");
var CompanyCards_1 = require("@libs/actions/CompanyCards");
var CardUtils_1 = require("@libs/CardUtils");
var getUAForWebView_1 = require("@libs/getUAForWebView");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CompanyCards_2 = require("@userActions/CompanyCards");
var getCompanyCardBankConnection_1 = require("@userActions/getCompanyCardBankConnection");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function BankConnection(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    var policyIDFromProps = _a.policyID, feed = _a.feed, route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var theme = (0, useTheme_1.default)();
    var webViewRef = (0, react_1.useRef)(null);
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var assignCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ASSIGN_CARD, { canBeMissing: true })[0];
    var authToken = (_b = session === null || session === void 0 ? void 0 : session.authToken) !== null && _b !== void 0 ? _b : null;
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: true })[0];
    var selectedBank = (_c = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _c === void 0 ? void 0 : _c.selectedBank;
    var _r = (_d = route === null || route === void 0 ? void 0 : route.params) !== null && _d !== void 0 ? _d : {}, bankNameFromRoute = _r.bankName, backTo = _r.backTo, policyIDFromRoute = _r.policyID;
    var policyID = policyIDFromProps !== null && policyIDFromProps !== void 0 ? policyIDFromProps : policyIDFromRoute;
    var bankName = feed ? (0, CardUtils_1.getBankName)(feed) : ((_f = bankNameFromRoute !== null && bankNameFromRoute !== void 0 ? bankNameFromRoute : (_e = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _e === void 0 ? void 0 : _e.plaidConnectedFeed) !== null && _f !== void 0 ? _f : selectedBank);
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var plaidToken = (_h = (_g = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _g === void 0 ? void 0 : _g.publicToken) !== null && _h !== void 0 ? _h : (_j = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _j === void 0 ? void 0 : _j.plaidAccessToken;
    var isPlaid = isBetaEnabled(CONST_1.default.BETAS.PLAID_COMPANY_CARDS) && !!plaidToken;
    var url = (0, getCompanyCardBankConnection_1.getCompanyCardBankConnection)(policyID, bankName);
    var cardFeeds = (0, useCardFeeds_1.default)(policyID)[0];
    var _s = (0, react_1.useState)(false), isConnectionCompleted = _s[0], setConnectionCompleted = _s[1];
    var prevFeedsData = (0, usePrevious_1.default)((_k = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _k === void 0 ? void 0 : _k.oAuthAccountDetails);
    var isFeedExpired = feed ? (0, CardUtils_1.isSelectedFeedExpired)((_m = (_l = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _l === void 0 ? void 0 : _l.oAuthAccountDetails) === null || _m === void 0 ? void 0 : _m[feed]) : false;
    var _t = (0, react_1.useMemo)(function () { var _a, _b, _c; return (0, CardUtils_1.checkIfNewFeedConnected)(prevFeedsData !== null && prevFeedsData !== void 0 ? prevFeedsData : {}, (_b = (_a = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _a === void 0 ? void 0 : _a.oAuthAccountDetails) !== null && _b !== void 0 ? _b : {}, (_c = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _c === void 0 ? void 0 : _c.plaidConnectedFeed); }, [(_o = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _o === void 0 ? void 0 : _o.plaidConnectedFeed, (_p = cardFeeds === null || cardFeeds === void 0 ? void 0 : cardFeeds.settings) === null || _p === void 0 ? void 0 : _p.oAuthAccountDetails, prevFeedsData]), isNewFeedConnected = _t.isNewFeedConnected, newFeed = _t.newFeed;
    var headerTitleAddCards = !backTo ? translate('workspace.companyCards.addCards') : undefined;
    var headerTitle = feed ? translate('workspace.companyCards.assignCard') : headerTitleAddCards;
    var onImportPlaidAccounts = (0, useImportPlaidAccounts_1.default)(policyID);
    var renderLoading = function () { return <FullscreenLoadingIndicator_1.default />; };
    var handleBackButtonPress = function () {
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
    (0, react_1.useEffect)(function () {
        var _a;
        if (!url && !isPlaid) {
            return;
        }
        // Handle assign card flow
        if (feed && !isFeedExpired) {
            (0, CompanyCards_1.setAssignCardStepAndData)({
                currentStep: ((_a = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _a === void 0 ? void 0 : _a.dateOption) ? CONST_1.default.COMPANY_CARD.STEP.CONFIRMATION : CONST_1.default.COMPANY_CARD.STEP.ASSIGNEE,
                isEditing: false,
            });
            return;
        }
        // Handle add new card flow
        if (isNewFeedConnected) {
            if (newFeed) {
                (0, Card_1.updateSelectedFeed)(newFeed, policyID);
            }
            Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_COMPANY_CARDS.getRoute(policyID), { forceReplace: true });
        }
        if (isPlaid) {
            onImportPlaidAccounts();
        }
    }, [isNewFeedConnected, newFeed, policyID, url, feed, isFeedExpired, (_q = assignCard === null || assignCard === void 0 ? void 0 : assignCard.data) === null || _q === void 0 ? void 0 : _q.dateOption, isPlaid, onImportPlaidAccounts]);
    var checkIfConnectionCompleted = function (navState) {
        if (!navState.url.includes(ROUTES_1.default.BANK_CONNECTION_COMPLETE)) {
            return;
        }
        setConnectionCompleted(true);
    };
    return (<ScreenWrapper_1.default testID={BankConnection.displayName} shouldShowOfflineIndicator={false} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={headerTitle} onBackButtonPress={handleBackButtonPress}/>
            <FullPageOfflineBlockingView_1.default addBottomSafeAreaPadding>
                {!!url && !isConnectionCompleted && !isPlaid && (<react_native_webview_1.WebView ref={webViewRef} source={{
                uri: url,
                headers: {
                    Cookie: "authToken=".concat(authToken),
                },
            }} userAgent={(0, getUAForWebView_1.default)()} incognito onNavigationStateChange={checkIfConnectionCompleted} startInLoadingState renderLoading={renderLoading}/>)}
                {(isConnectionCompleted || isPlaid) && (<react_native_1.ActivityIndicator size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={styles.flex1} color={theme.spinner}/>)}
            </FullPageOfflineBlockingView_1.default>
        </ScreenWrapper_1.default>);
}
BankConnection.displayName = 'BankConnection';
exports.default = BankConnection;
