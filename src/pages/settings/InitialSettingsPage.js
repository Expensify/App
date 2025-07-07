"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var src_1 = require("@expensify/react-native-hybrid-app/src");
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AccountSwitcher_1 = require("@components/AccountSwitcher");
var AccountSwitcherSkeletonView_1 = require("@components/AccountSwitcherSkeletonView");
var ConfirmModal_1 = require("@components/ConfirmModal");
var CustomStatusBarAndBackgroundContext_1 = require("@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var NavigationTabBar_1 = require("@components/Navigation/NavigationTabBar");
var NAVIGATION_TABS_1 = require("@components/Navigation/NavigationTabBar/NAVIGATION_TABS");
var Pressable_1 = require("@components/Pressable");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollOffsetContextProvider_1 = require("@components/ScrollOffsetContextProvider");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSingleExecution_1 = require("@hooks/useSingleExecution");
var useSubscriptionPlan_1 = require("@hooks/useSubscriptionPlan");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ExitSurvey_1 = require("@libs/actions/ExitSurvey");
var CardUtils_1 = require("@libs/CardUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var useIsSidebarRouteActive_1 = require("@libs/Navigation/helpers/useIsSidebarRouteActive");
var Navigation_1 = require("@libs/Navigation/Navigation");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var UserUtils_1 = require("@libs/UserUtils");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var variables_1 = require("@styles/variables");
var App_1 = require("@userActions/App");
var Link_1 = require("@userActions/Link");
var PaymentMethods_1 = require("@userActions/PaymentMethods");
var Session_1 = require("@userActions/Session");
var Wallet_1 = require("@userActions/Wallet");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function InitialSettingsPage(_a) {
    var _b, _c, _d, _e;
    var currentUserPersonalDetails = _a.currentUserPersonalDetails;
    var userWallet = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_WALLET, { canBeMissing: true })[0];
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST, { canBeMissing: true })[0];
    var fundList = (0, useOnyx_1.default)(ONYXKEYS_1.default.FUND_LIST, { canBeMissing: true })[0];
    var walletTerms = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TERMS, { canBeMissing: true })[0];
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: true })[0];
    var privatePersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS, { canBeMissing: true })[0];
    var tryNewDot = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_TRY_NEW_DOT, { canBeMissing: true })[0];
    var allCards = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { canBeMissing: true })[0];
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: true })[0];
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var network = (0, useNetwork_1.default)();
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _f = (0, useSingleExecution_1.default)(), isExecuting = _f.isExecuting, singleExecution = _f.singleExecution;
    var popoverAnchor = (0, react_1.useRef)(null);
    var translate = (0, useLocalize_1.default)().translate;
    var focusedRouteName = (0, native_1.useNavigationState)(function (state) { var _a; return (_a = (0, native_1.findFocusedRoute)(state)) === null || _a === void 0 ? void 0 : _a.name; });
    var emojiCode = (_c = (_b = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.status) === null || _b === void 0 ? void 0 : _b.emojiCode) !== null && _c !== void 0 ? _c : '';
    var setRootStatusBarEnabled = (0, react_1.useContext)(CustomStatusBarAndBackgroundContext_1.default).setRootStatusBarEnabled;
    var isScreenFocused = (0, useIsSidebarRouteActive_1.default)(NAVIGATORS_1.default.SETTINGS_SPLIT_NAVIGATOR, shouldUseNarrowLayout);
    var hasActivatedWallet = [CONST_1.default.WALLET.TIER_NAME.GOLD, CONST_1.default.WALLET.TIER_NAME.PLATINUM].includes((_d = userWallet === null || userWallet === void 0 ? void 0 : userWallet.tierName) !== null && _d !== void 0 ? _d : '');
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION, { canBeMissing: true })[0];
    var subscriptionPlan = (0, useSubscriptionPlan_1.default)();
    var shouldLogout = (0, react_1.useRef)(false);
    var freeTrialText = (0, SubscriptionUtils_1.getFreeTrialText)(policies);
    var shouldDisplayLHB = !shouldUseNarrowLayout;
    var hasBrokenFeedConnection = (0, CardUtils_1.checkIfFeedConnectionIsBroken)(allCards, CONST_1.default.EXPENSIFY_CARD.BANK);
    var walletBrickRoadIndicator = (0, PaymentMethods_1.hasPaymentMethodError)(bankAccountList, fundList) || !(0, EmptyObject_1.isEmptyObject)(userWallet === null || userWallet === void 0 ? void 0 : userWallet.errors) || !(0, EmptyObject_1.isEmptyObject)(walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.errors) || hasBrokenFeedConnection ? 'error' : undefined;
    var _g = (0, react_1.useState)(false), shouldShowSignoutConfirmModal = _g[0], setShouldShowSignoutConfirmModal = _g[1];
    var shouldOpenSurveyReasonPage = ((_e = tryNewDot === null || tryNewDot === void 0 ? void 0 : tryNewDot.classicRedirect) === null || _e === void 0 ? void 0 : _e.dismissed) === false;
    (0, react_1.useEffect)(function () {
        (0, Wallet_1.openInitialSettingsPage)();
        (0, App_1.confirmReadyToOpenApp)();
    }, []);
    var toggleSignoutConfirmModal = function (value) {
        setShouldShowSignoutConfirmModal(value);
    };
    var signOut = (0, react_1.useCallback)(function (shouldForceSignout) {
        if (shouldForceSignout === void 0) { shouldForceSignout = false; }
        if (!network.isOffline || shouldForceSignout) {
            (0, Session_1.signOutAndRedirectToSignIn)();
            return;
        }
        // When offline, warn the user that any actions they took while offline will be lost if they sign out
        toggleSignoutConfirmModal(true);
    }, [network.isOffline]);
    /**
     * Return a list of menu items data for account section
     * @returns object with translationKey, style and items for the account section
     */
    var accountMenuItemsData = (0, react_1.useMemo)(function () {
        var profileBrickRoadIndicator = (0, UserUtils_1.getProfilePageBrickRoadIndicator)(loginList, privatePersonalDetails);
        var items = [
            {
                translationKey: 'common.profile',
                icon: Expensicons.Profile,
                screenName: SCREENS_1.default.SETTINGS.PROFILE.ROOT,
                brickRoadIndicator: profileBrickRoadIndicator,
                action: function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_PROFILE.getRoute()); },
            },
            {
                translationKey: 'common.wallet',
                icon: Expensicons.Wallet,
                screenName: SCREENS_1.default.SETTINGS.WALLET.ROOT,
                brickRoadIndicator: walletBrickRoadIndicator,
                action: function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_WALLET); },
                badgeText: hasActivatedWallet ? (0, CurrencyUtils_1.convertToDisplayString)(userWallet === null || userWallet === void 0 ? void 0 : userWallet.currentBalance) : undefined,
            },
            {
                translationKey: 'common.preferences',
                icon: Expensicons.Gear,
                screenName: SCREENS_1.default.SETTINGS.PREFERENCES.ROOT,
                action: function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_PREFERENCES); },
            },
            {
                translationKey: 'initialSettingsPage.security',
                icon: Expensicons.Lock,
                screenName: SCREENS_1.default.SETTINGS.SECURITY,
                action: function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SECURITY); },
            },
        ];
        if (subscriptionPlan) {
            items.splice(1, 0, {
                translationKey: 'allSettingsScreen.subscription',
                icon: Expensicons.CreditCard,
                screenName: SCREENS_1.default.SETTINGS.SUBSCRIPTION.ROOT,
                brickRoadIndicator: !!(privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.errors) || (0, SubscriptionUtils_1.hasSubscriptionRedDotError)() ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                badgeText: freeTrialText,
                badgeStyle: freeTrialText ? styles.badgeSuccess : undefined,
                action: function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SUBSCRIPTION.route); },
            });
        }
        return {
            sectionStyle: styles.accountSettingsSectionContainer,
            sectionTranslationKey: 'initialSettingsPage.account',
            items: items,
        };
    }, [
        loginList,
        privatePersonalDetails,
        walletBrickRoadIndicator,
        hasActivatedWallet,
        userWallet === null || userWallet === void 0 ? void 0 : userWallet.currentBalance,
        subscriptionPlan,
        styles.accountSettingsSectionContainer,
        styles.badgeSuccess,
        privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.errors,
        freeTrialText,
    ]);
    /**
     * Return a list of menu items data for general section
     * @returns object with translationKey, style and items for the general section
     */
    var generalMenuItemsData = (0, react_1.useMemo)(function () {
        var signOutTranslationKey = (0, Session_1.isSupportAuthToken)() ? 'initialSettingsPage.restoreStashed' : 'initialSettingsPage.signOut';
        return {
            sectionStyle: __assign({}, styles.pt4),
            sectionTranslationKey: 'initialSettingsPage.general',
            items: [
                {
                    translationKey: 'initialSettingsPage.help',
                    icon: Expensicons.QuestionMark,
                    iconRight: Expensicons.NewWindow,
                    shouldShowRightIcon: true,
                    link: CONST_1.default.NEWHELP_URL,
                    action: function () {
                        (0, Link_1.openExternalLink)(CONST_1.default.NEWHELP_URL);
                    },
                },
                __assign({ translationKey: 'exitSurvey.goToExpensifyClassic', icon: Expensicons.ExpensifyLogoNew }, (CONFIG_1.default.IS_HYBRID_APP
                    ? {
                        action: function () {
                            src_1.default.closeReactNativeApp({ shouldSignOut: false, shouldSetNVP: true });
                            setRootStatusBarEnabled(false);
                        },
                    }
                    : {
                        action: function () {
                            (0, ExitSurvey_1.resetExitSurveyForm)(function () {
                                if (shouldOpenSurveyReasonPage) {
                                    Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_EXIT_SURVEY_REASON.route);
                                    return;
                                }
                                Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_EXIT_SURVEY_CONFIRM.route);
                            });
                        },
                    })),
                {
                    translationKey: 'initialSettingsPage.about',
                    icon: Expensicons.Info,
                    screenName: SCREENS_1.default.SETTINGS.ABOUT,
                    action: function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ABOUT); },
                },
                {
                    translationKey: 'initialSettingsPage.aboutPage.troubleshoot',
                    icon: Expensicons.Lightbulb,
                    screenName: SCREENS_1.default.SETTINGS.TROUBLESHOOT,
                    action: function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_TROUBLESHOOT); },
                },
                {
                    translationKey: 'sidebarScreen.saveTheWorld',
                    icon: Expensicons.Heart,
                    screenName: SCREENS_1.default.SETTINGS.SAVE_THE_WORLD,
                    action: function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_SAVE_THE_WORLD); },
                },
                {
                    translationKey: signOutTranslationKey,
                    icon: Expensicons.Exit,
                    action: function () {
                        signOut(false);
                    },
                },
            ],
        };
    }, [styles.pt4, setRootStatusBarEnabled, shouldOpenSurveyReasonPage, signOut]);
    /**
     * Return JSX.Element with menu items
     * @param menuItemsData list with menu items data
     * @returns the menu items for passed data
     */
    var getMenuItemsSection = (0, react_1.useCallback)(function (menuItemsData) {
        var openPopover = function (link, event) {
            var _a;
            if (!Navigation_1.default.isActiveRoute(ROUTES_1.default.SETTINGS)) {
                return;
            }
            if (typeof link === 'function') {
                (_a = link === null || link === void 0 ? void 0 : link()) === null || _a === void 0 ? void 0 : _a.then(function (url) {
                    return (0, ReportActionContextMenu_1.showContextMenu)({
                        type: CONST_1.default.CONTEXT_MENU_TYPES.LINK,
                        event: event,
                        selection: url,
                        contextMenuAnchor: popoverAnchor.current,
                    });
                });
            }
            else if (link) {
                (0, ReportActionContextMenu_1.showContextMenu)({
                    type: CONST_1.default.CONTEXT_MENU_TYPES.LINK,
                    event: event,
                    selection: link,
                    contextMenuAnchor: popoverAnchor.current,
                });
            }
        };
        return (<react_native_1.View style={[menuItemsData.sectionStyle, styles.pb4, styles.mh3]}>
                    <Text_1.default style={styles.sectionTitle}>{translate(menuItemsData.sectionTranslationKey)}</Text_1.default>
                    {menuItemsData.items.map(function (item) {
                var keyTitle = item.translationKey ? translate(item.translationKey) : item.title;
                var isFocused = focusedRouteName ? focusedRouteName === item.screenName : false;
                return (<MenuItem_1.default key={keyTitle} wrapperStyle={styles.sectionMenuItem} title={keyTitle} icon={item.icon} iconType={item.iconType} disabled={isExecuting} onPress={singleExecution(function () {
                        item.action();
                    })} iconStyles={item.iconStyles} badgeText={item.badgeText} badgeStyle={item.badgeStyle} fallbackIcon={item.fallbackIcon} brickRoadIndicator={item.brickRoadIndicator} floatRightAvatars={item.floatRightAvatars} shouldStackHorizontally={item.shouldStackHorizontally} floatRightAvatarSize={item.avatarSize} ref={popoverAnchor} shouldBlockSelection={!!item.link} onSecondaryInteraction={item.link ? function (event) { return openPopover(item.link, event); } : undefined} focused={isFocused} isPaneMenu iconRight={item.iconRight} shouldShowRightIcon={item.shouldShowRightIcon} shouldIconUseAutoWidthStyle/>);
            })}
                </react_native_1.View>);
    }, [styles.pb4, styles.mh3, styles.sectionTitle, styles.sectionMenuItem, translate, focusedRouteName, isExecuting, singleExecution]);
    var accountMenuItems = (0, react_1.useMemo)(function () { return getMenuItemsSection(accountMenuItemsData); }, [accountMenuItemsData, getMenuItemsSection]);
    var generalMenuItems = (0, react_1.useMemo)(function () { return getMenuItemsSection(generalMenuItemsData); }, [generalMenuItemsData, getMenuItemsSection]);
    var headerContent = (<react_native_1.View style={[styles.ph5, styles.pv4]}>
            {(0, EmptyObject_1.isEmptyObject)(currentUserPersonalDetails) || currentUserPersonalDetails.displayName === undefined ? (<AccountSwitcherSkeletonView_1.default avatarSize={CONST_1.default.AVATAR_SIZE.DEFAULT}/>) : (<react_native_1.View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, styles.gap3]}>
                    <AccountSwitcher_1.default isScreenFocused={isScreenFocused}/>
                    <Tooltip_1.default text={translate('statusPage.status')}>
                        <Pressable_1.PressableWithFeedback accessibilityLabel={translate('statusPage.status')} accessibilityRole="button" accessible onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_STATUS); }}>
                            <react_native_1.View style={styles.primaryMediumIcon}>
                                {emojiCode ? (<Text_1.default style={styles.primaryMediumText}>{emojiCode}</Text_1.default>) : (<Icon_1.default src={Expensicons.Emoji} width={variables_1.default.iconSizeNormal} height={variables_1.default.iconSizeNormal} fill={theme.icon}/>)}
                            </react_native_1.View>
                        </Pressable_1.PressableWithFeedback>
                    </Tooltip_1.default>
                </react_native_1.View>)}
        </react_native_1.View>);
    var _h = (0, react_1.useContext)(ScrollOffsetContextProvider_1.ScrollOffsetContext), saveScrollOffset = _h.saveScrollOffset, getScrollOffset = _h.getScrollOffset;
    var route = (0, native_1.useRoute)();
    var scrollViewRef = (0, react_1.useRef)(null);
    var onScroll = (0, react_1.useCallback)(function (e) {
        // If the layout measurement is 0, it means the flash list is not displayed but the onScroll may be triggered with offset value 0.
        // We should ignore this case.
        if (e.nativeEvent.layoutMeasurement.height === 0) {
            return;
        }
        saveScrollOffset(route, e.nativeEvent.contentOffset.y);
    }, [route, saveScrollOffset]);
    (0, react_1.useLayoutEffect)(function () {
        var scrollOffset = getScrollOffset(route);
        if (!scrollOffset || !scrollViewRef.current) {
            return;
        }
        scrollViewRef.current.scrollTo({ y: scrollOffset, animated: false });
    }, [getScrollOffset, route]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom testID={InitialSettingsPage.displayName} bottomContent={!shouldDisplayLHB && <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.SETTINGS}/>} shouldEnableKeyboardAvoidingView={false}>
            {headerContent}
            <ScrollView_1.default ref={scrollViewRef} onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={[styles.w100]} showsVerticalScrollIndicator={false}>
                {accountMenuItems}
                {generalMenuItems}
                <ConfirmModal_1.default danger title={translate('common.areYouSure')} prompt={translate('initialSettingsPage.signOutConfirmationText')} confirmText={translate('initialSettingsPage.signOut')} cancelText={translate('common.cancel')} isVisible={shouldShowSignoutConfirmModal} onConfirm={function () {
            toggleSignoutConfirmModal(false);
            shouldLogout.current = true;
        }} onCancel={function () { return toggleSignoutConfirmModal(false); }} onModalHide={function () {
            if (!shouldLogout.current) {
                return;
            }
            signOut(true);
        }}/>
            </ScrollView_1.default>
            {shouldDisplayLHB && <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.SETTINGS}/>}
        </ScreenWrapper_1.default>);
}
InitialSettingsPage.displayName = 'InitialSettingsPage';
exports.default = (0, withCurrentUserPersonalDetails_1.default)(InitialSettingsPage);
