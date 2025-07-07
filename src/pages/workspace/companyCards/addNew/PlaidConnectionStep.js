"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var PlaidLink_1 = require("@components/PlaidLink");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CompanyCards_1 = require("@libs/actions/CompanyCards");
var KeyboardShortcut_1 = require("@libs/KeyboardShortcut");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@navigation/Navigation");
var App_1 = require("@userActions/App");
var BankAccounts_1 = require("@userActions/BankAccounts");
var Plaid_1 = require("@userActions/Plaid");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function PlaidConnectionStep(_a) {
    var _b, _c;
    var feed = _a.feed;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var addNewCard = (0, useOnyx_1.default)(ONYXKEYS_1.default.ADD_NEW_COMPANY_CARD, { canBeMissing: true })[0];
    var isUSCountry = ((_b = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _b === void 0 ? void 0 : _b.selectedCountry) === CONST_1.default.COUNTRY.US;
    var isPlaidDisabled = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_PLAID_DISABLED, { canBeMissing: true })[0];
    var plaidLinkToken = (0, useOnyx_1.default)(ONYXKEYS_1.default.PLAID_LINK_TOKEN, { canBeMissing: true })[0];
    var plaidData = (0, useOnyx_1.default)(ONYXKEYS_1.default.PLAID_DATA, { canBeMissing: true })[0];
    var plaidErrors = plaidData === null || plaidData === void 0 ? void 0 : plaidData.errors;
    var subscribedKeyboardShortcuts = (0, react_1.useRef)([]);
    var previousNetworkState = (0, react_1.useRef)(undefined);
    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    var plaidDataErrorMessage = !(0, EmptyObject_1.isEmptyObject)(plaidErrors) ? Object.values(plaidErrors).at(0) : '';
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isAuthenticatedWithPlaid = (0, react_1.useCallback)(function () { var _a; return !!((_a = plaidData === null || plaidData === void 0 ? void 0 : plaidData.bankAccounts) === null || _a === void 0 ? void 0 : _a.length) || !(0, EmptyObject_1.isEmptyObject)(plaidData === null || plaidData === void 0 ? void 0 : plaidData.errors); }, [plaidData]);
    /**
     * Blocks the keyboard shortcuts that can navigate
     */
    var subscribeToNavigationShortcuts = function () {
        // find and block the shortcuts
        var shortcutsToBlock = Object.values(CONST_1.default.KEYBOARD_SHORTCUTS).filter(function (shortcut) { return 'type' in shortcut && shortcut.type === CONST_1.default.KEYBOARD_SHORTCUTS_TYPES.NAVIGATION_SHORTCUT; });
        subscribedKeyboardShortcuts.current = shortcutsToBlock.map(function (shortcut) {
            return KeyboardShortcut_1.default.subscribe(shortcut.shortcutKey, function () { }, // do nothing
            shortcut.descriptionKey, shortcut.modifiers, false, function () { var _a; return ((_a = plaidData === null || plaidData === void 0 ? void 0 : plaidData.bankAccounts) !== null && _a !== void 0 ? _a : []).length > 0; });
        });
    };
    /**
     * Unblocks the keyboard shortcuts that can navigate
     */
    var unsubscribeToNavigationShortcuts = function () {
        subscribedKeyboardShortcuts.current.forEach(function (unsubscribe) { return unsubscribe(); });
        subscribedKeyboardShortcuts.current = [];
    };
    (0, react_1.useEffect)(function () {
        var _a;
        subscribeToNavigationShortcuts();
        // If we're coming from Plaid OAuth flow then we need to reuse the existing plaidLinkToken
        if (isAuthenticatedWithPlaid()) {
            return unsubscribeToNavigationShortcuts;
        }
        if ((_a = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _a === void 0 ? void 0 : _a.selectedCountry) {
            (0, Plaid_1.openPlaidCompanyCardLogin)(addNewCard.data.selectedCountry);
            return unsubscribeToNavigationShortcuts;
        }
        // disabling this rule, as we want this to run only on the first render
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    (0, react_1.useEffect)(function () {
        var _a;
        // If we are coming back from offline and we haven't authenticated with Plaid yet, we need to re-run our call to kick off Plaid
        // previousNetworkState.current also makes sure that this doesn't run on the first render.
        if (previousNetworkState.current && !isOffline && !isAuthenticatedWithPlaid() && ((_a = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _a === void 0 ? void 0 : _a.selectedCountry)) {
            (0, Plaid_1.openPlaidCompanyCardLogin)(addNewCard.data.selectedCountry);
        }
        previousNetworkState.current = isOffline;
    }, [(_c = addNewCard === null || addNewCard === void 0 ? void 0 : addNewCard.data) === null || _c === void 0 ? void 0 : _c.selectedCountry, isAuthenticatedWithPlaid, isOffline]);
    var handleBackButtonPress = function () {
        if (feed) {
            Navigation_1.default.goBack();
            return;
        }
        (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({ step: isUSCountry ? CONST_1.default.COMPANY_CARDS.STEP.SELECT_BANK : CONST_1.default.COMPANY_CARDS.STEP.SELECT_FEED_TYPE });
    };
    var handlePlaidLinkError = (0, react_1.useCallback)(function (error) {
        Log_1.default.hmmm('[PlaidLink] Error: ', error === null || error === void 0 ? void 0 : error.message);
    }, []);
    var renderPlaidLink = function () {
        if (plaidLinkToken) {
            return (<PlaidLink_1.default token={plaidLinkToken} onSuccess={function (_a) {
                    var _b, _c, _d, _e, _f, _g;
                    var publicToken = _a.publicToken, metadata = _a.metadata;
                    // on success we need to move to bank connection screen with token, bank name = plaid
                    Log_1.default.info('[PlaidLink] Success!');
                    var plaidConnectedFeed = (_c = (_b = metadata === null || metadata === void 0 ? void 0 : metadata.institution) === null || _b === void 0 ? void 0 : _b.institution_id) !== null && _c !== void 0 ? _c : (_d = metadata === null || metadata === void 0 ? void 0 : metadata.institution) === null || _d === void 0 ? void 0 : _d.id;
                    var plaidConnectedFeedName = (_f = (_e = metadata === null || metadata === void 0 ? void 0 : metadata.institution) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : (_g = metadata === null || metadata === void 0 ? void 0 : metadata.institution) === null || _g === void 0 ? void 0 : _g.name;
                    if (feed) {
                        (0, CompanyCards_1.setAssignCardStepAndData)({
                            data: {
                                plaidAccessToken: publicToken,
                                institutionId: plaidConnectedFeed,
                                plaidConnectedFeedName: plaidConnectedFeedName,
                                plaidAccounts: metadata === null || metadata === void 0 ? void 0 : metadata.accounts,
                            },
                            currentStep: CONST_1.default.COMPANY_CARD.STEP.BANK_CONNECTION,
                        });
                        return;
                    }
                    (0, CompanyCards_1.setAddNewCompanyCardStepAndData)({
                        step: CONST_1.default.COMPANY_CARDS.STEP.BANK_CONNECTION,
                        data: {
                            publicToken: publicToken,
                            plaidConnectedFeed: plaidConnectedFeed,
                            plaidConnectedFeedName: plaidConnectedFeedName,
                            plaidAccounts: metadata === null || metadata === void 0 ? void 0 : metadata.accounts,
                        },
                    });
                }} onError={handlePlaidLinkError} onEvent={function (event) {
                    (0, BankAccounts_1.setPlaidEvent)(event);
                    // Limit the number of times a user can submit Plaid credentials
                    if (event === 'SUBMIT_CREDENTIALS') {
                        (0, App_1.handleRestrictedEvent)(event);
                    }
                }} 
            // User prematurely exited the Plaid flow
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            onExit={handleBackButtonPress}/>);
        }
        if (plaidDataErrorMessage) {
            return <Text_1.default style={[styles.formError, styles.mh5]}>{plaidDataErrorMessage}</Text_1.default>;
        }
        if (plaidData === null || plaidData === void 0 ? void 0 : plaidData.isLoading) {
            return (<react_native_1.View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <react_native_1.ActivityIndicator color={theme.spinner} size="large"/>
                </react_native_1.View>);
        }
    };
    return (<ScreenWrapper_1.default testID={PlaidConnectionStep.displayName} enableEdgeToEdgeBottomSafeAreaPadding shouldEnablePickerAvoiding={false} shouldEnableMaxHeight>
            <HeaderWithBackButton_1.default title={translate('workspace.companyCards.addCards')} onBackButtonPress={handleBackButtonPress}/>
            {isPlaidDisabled ? (<Text_1.default style={[styles.formError, styles.ph5, styles.mv3]}>{translate('bankAccount.error.tooManyAttempts')}</Text_1.default>) : (<FullPageOfflineBlockingView_1.default>{renderPlaidLink()}</FullPageOfflineBlockingView_1.default>)}
        </ScreenWrapper_1.default>);
}
PlaidConnectionStep.displayName = 'PlaidConnectionStep';
exports.default = PlaidConnectionStep;
