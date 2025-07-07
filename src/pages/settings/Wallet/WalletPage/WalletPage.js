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
var debounce_1 = require("lodash/debounce");
var isEmpty_1 = require("lodash/isEmpty");
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddPaymentMethodMenu_1 = require("@components/AddPaymentMethodMenu");
var ConfirmModal_1 = require("@components/ConfirmModal");
var DelegateNoAccessModalProvider_1 = require("@components/DelegateNoAccessModalProvider");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var KYCWall_1 = require("@components/KYCWall");
var LockedAccountModalProvider_1 = require("@components/LockedAccountModalProvider");
var LottieAnimations_1 = require("@components/LottieAnimations");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Popover_1 = require("@components/Popover");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePaymentMethodState_1 = require("@hooks/usePaymentMethodState");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var CardUtils_1 = require("@libs/CardUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var getClickedTargetLocation_1 = require("@libs/getClickedTargetLocation");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PaymentUtils_1 = require("@libs/PaymentUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SearchQueryUtils_1 = require("@libs/SearchQueryUtils");
var PaymentMethodList_1 = require("@pages/settings/Wallet/PaymentMethodList");
var variables_1 = require("@styles/variables");
var BankAccounts_1 = require("@userActions/BankAccounts");
var Modal_1 = require("@userActions/Modal");
var PaymentMethods_1 = require("@userActions/PaymentMethods");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WalletPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    var _z = _a.shouldListenForResize, shouldListenForResize = _z === void 0 ? false : _z;
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST, { initialValue: {}, canBeMissing: true })[0];
    var cardList = (0, useOnyx_1.default)(ONYXKEYS_1.default.CARD_LIST, { initialValue: {}, canBeMissing: true })[0];
    var fundList = (0, useOnyx_1.default)(ONYXKEYS_1.default.FUND_LIST, { initialValue: {}, canBeMissing: true })[0];
    var isLoadingPaymentMethods = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_PAYMENT_METHODS, { initialValue: true, canBeMissing: true })[0];
    var userWallet = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_WALLET, { canBeMissing: true })[0];
    var walletTerms = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TERMS, { initialValue: {}, canBeMissing: true })[0];
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: false })[0];
    var userAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var isUserValidated = (_b = userAccount === null || userAccount === void 0 ? void 0 : userAccount.validated) !== null && _b !== void 0 ? _b : false;
    var _0 = (0, react_1.useContext)(DelegateNoAccessModalProvider_1.DelegateNoAccessContext), isActingAsDelegate = _0.isActingAsDelegate, showDelegateNoAccessModal = _0.showDelegateNoAccessModal;
    var _1 = (0, react_1.useContext)(LockedAccountModalProvider_1.LockedAccountContext), isAccountLocked = _1.isAccountLocked, showLockedAccountModal = _1.showLockedAccountModal;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var network = (0, useNetwork_1.default)();
    var _2 = (0, useWindowDimensions_1.default)(), windowWidth = _2.windowWidth, windowHeight = _2.windowHeight;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var _3 = (0, usePaymentMethodState_1.default)(), paymentMethod = _3.paymentMethod, setPaymentMethod = _3.setPaymentMethod, resetSelectedPaymentMethodData = _3.resetSelectedPaymentMethodData;
    var _4 = (0, react_1.useState)(false), shouldShowAddPaymentMenu = _4[0], setShouldShowAddPaymentMenu = _4[1];
    var _5 = (0, react_1.useState)(false), shouldShowDefaultDeleteMenu = _5[0], setShouldShowDefaultDeleteMenu = _5[1];
    var _6 = (0, react_1.useState)(false), shouldShowCardMenu = _6[0], setShouldShowCardMenu = _6[1];
    var _7 = (0, react_1.useState)(false), shouldShowLoadingSpinner = _7[0], setShouldShowLoadingSpinner = _7[1];
    var addPaymentMethodAnchorRef = (0, react_1.useRef)(null);
    var paymentMethodButtonRef = (0, react_1.useRef)(null);
    var _8 = (0, react_1.useState)({
        anchorPositionHorizontal: 0,
        anchorPositionVertical: 0,
        anchorPositionTop: 0,
        anchorPositionRight: 0,
    }), anchorPosition = _8[0], setAnchorPosition = _8[1];
    var _9 = (0, react_1.useState)(false), showConfirmDeleteModal = _9[0], setShowConfirmDeleteModal = _9[1];
    var hasWallet = !(0, isEmpty_1.default)(userWallet);
    var hasActivatedWallet = [CONST_1.default.WALLET.TIER_NAME.GOLD, CONST_1.default.WALLET.TIER_NAME.PLATINUM].includes((_c = userWallet === null || userWallet === void 0 ? void 0 : userWallet.tierName) !== null && _c !== void 0 ? _c : '');
    var hasAssignedCard = !(0, isEmpty_1.default)(cardList);
    var isPendingOnfidoResult = (_d = userWallet === null || userWallet === void 0 ? void 0 : userWallet.isPendingOnfidoResult) !== null && _d !== void 0 ? _d : false;
    var hasFailedOnfido = (_e = userWallet === null || userWallet === void 0 ? void 0 : userWallet.hasFailedOnfido) !== null && _e !== void 0 ? _e : false;
    var updateShouldShowLoadingSpinner = (0, react_1.useCallback)(function () {
        // In order to prevent a loop, only update state of the spinner if there is a change
        var showLoadingSpinner = isLoadingPaymentMethods !== null && isLoadingPaymentMethods !== void 0 ? isLoadingPaymentMethods : false;
        if (showLoadingSpinner !== shouldShowLoadingSpinner) {
            setShouldShowLoadingSpinner(showLoadingSpinner && !network.isOffline);
        }
    }, [isLoadingPaymentMethods, network.isOffline, shouldShowLoadingSpinner]);
    var debounceSetShouldShowLoadingSpinner = (0, debounce_1.default)(updateShouldShowLoadingSpinner, CONST_1.default.TIMING.SHOW_LOADING_SPINNER_DEBOUNCE_TIME);
    /**
     * Set position of the payment menu
     */
    var setMenuPosition = (0, react_1.useCallback)(function () {
        if (!paymentMethodButtonRef.current) {
            return;
        }
        var position = (0, getClickedTargetLocation_1.default)(paymentMethodButtonRef.current);
        setAnchorPosition({
            anchorPositionTop: position.top + position.height - variables_1.default.bankAccountActionPopoverTopSpacing,
            // We want the position to be 23px to the right of the left border
            anchorPositionRight: windowWidth - position.right + variables_1.default.bankAccountActionPopoverRightSpacing,
            anchorPositionHorizontal: position.x + variables_1.default.addBankAccountLeftSpacing,
            anchorPositionVertical: position.y,
        });
    }, [windowWidth]);
    var getSelectedPaymentMethodID = (0, react_1.useCallback)(function () {
        if (paymentMethod.selectedPaymentMethodType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
            return paymentMethod.selectedPaymentMethod.bankAccountID;
        }
        if (paymentMethod.selectedPaymentMethodType === CONST_1.default.PAYMENT_METHODS.DEBIT_CARD) {
            return paymentMethod.selectedPaymentMethod.fundID;
        }
    }, [paymentMethod.selectedPaymentMethod.bankAccountID, paymentMethod.selectedPaymentMethod.fundID, paymentMethod.selectedPaymentMethodType]);
    /**
     * Display the delete/default menu, or the add payment method menu
     */
    var paymentMethodPressed = function (nativeEvent, accountType, account, icon, isDefault, methodID, description) {
        var _a, _b;
        if (shouldShowAddPaymentMenu) {
            setShouldShowAddPaymentMenu(false);
            return;
        }
        if (shouldShowDefaultDeleteMenu) {
            setShouldShowDefaultDeleteMenu(false);
            return;
        }
        paymentMethodButtonRef.current = nativeEvent === null || nativeEvent === void 0 ? void 0 : nativeEvent.currentTarget;
        // The delete/default menu
        if (accountType) {
            var formattedSelectedPaymentMethod = {
                title: '',
            };
            if (accountType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                formattedSelectedPaymentMethod = {
                    title: (_a = account === null || account === void 0 ? void 0 : account.addressName) !== null && _a !== void 0 ? _a : '',
                    icon: icon,
                    description: description !== null && description !== void 0 ? description : (0, PaymentUtils_1.getPaymentMethodDescription)(accountType, account),
                    type: CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
                };
            }
            else if (accountType === CONST_1.default.PAYMENT_METHODS.DEBIT_CARD) {
                formattedSelectedPaymentMethod = {
                    title: (_b = account === null || account === void 0 ? void 0 : account.addressName) !== null && _b !== void 0 ? _b : '',
                    icon: icon,
                    description: description !== null && description !== void 0 ? description : (0, PaymentUtils_1.getPaymentMethodDescription)(accountType, account),
                    type: CONST_1.default.PAYMENT_METHODS.DEBIT_CARD,
                };
            }
            setPaymentMethod({
                isSelectedPaymentMethodDefault: !!isDefault,
                selectedPaymentMethod: account !== null && account !== void 0 ? account : {},
                selectedPaymentMethodType: accountType,
                formattedSelectedPaymentMethod: formattedSelectedPaymentMethod,
                methodID: methodID !== null && methodID !== void 0 ? methodID : CONST_1.default.DEFAULT_NUMBER_ID,
            });
            setShouldShowDefaultDeleteMenu(true);
            setMenuPosition();
            return;
        }
        if (isActingAsDelegate) {
            showDelegateNoAccessModal();
            return;
        }
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        setShouldShowAddPaymentMenu(true);
        setMenuPosition();
    };
    var assignedCardPressed = function (nativeEvent, cardData, icon, cardID) {
        if (shouldShowAddPaymentMenu) {
            setShouldShowAddPaymentMenu(false);
            return;
        }
        if (shouldShowDefaultDeleteMenu) {
            setShouldShowDefaultDeleteMenu(false);
            return;
        }
        if (shouldShowCardMenu) {
            setShouldShowCardMenu(false);
            return;
        }
        paymentMethodButtonRef.current = nativeEvent === null || nativeEvent === void 0 ? void 0 : nativeEvent.currentTarget;
        setPaymentMethod({
            isSelectedPaymentMethodDefault: false,
            selectedPaymentMethod: {},
            formattedSelectedPaymentMethod: {
                title: (0, CardUtils_1.maskCardNumber)(cardData === null || cardData === void 0 ? void 0 : cardData.cardName, cardData === null || cardData === void 0 ? void 0 : cardData.bank),
                description: cardData ? (0, PolicyUtils_1.getDescriptionForPolicyDomainCard)(cardData.domainName) : '',
                icon: icon,
            },
            selectedPaymentMethodType: '',
            methodID: cardID !== null && cardID !== void 0 ? cardID : CONST_1.default.DEFAULT_NUMBER_ID,
        });
        setShouldShowCardMenu(true);
        setMenuPosition();
    };
    /**
     * Hide the add payment modal
     */
    var hideAddPaymentMenu = function () {
        setShouldShowAddPaymentMenu(false);
    };
    /**
     * Navigate to the appropriate payment type addition screen
     */
    var addPaymentMethodTypePressed = function (paymentType) {
        hideAddPaymentMenu();
        if (paymentType === CONST_1.default.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ADD_DEBIT_CARD);
            return;
        }
        if (paymentType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT || paymentType === CONST_1.default.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT) {
            (0, BankAccounts_1.openPersonalBankAccountSetupView)();
            return;
        }
        throw new Error('Invalid payment method type selected');
    };
    /**
     * Hide the default / delete modal
     */
    var hideDefaultDeleteMenu = (0, react_1.useCallback)(function () {
        setShouldShowDefaultDeleteMenu(false);
        setShowConfirmDeleteModal(false);
    }, [setShouldShowDefaultDeleteMenu, setShowConfirmDeleteModal]);
    var hideCardMenu = (0, react_1.useCallback)(function () {
        setShouldShowCardMenu(false);
    }, [setShouldShowCardMenu]);
    var makeDefaultPaymentMethod = (0, react_1.useCallback)(function () {
        var _a, _b;
        var paymentCardList = fundList !== null && fundList !== void 0 ? fundList : {};
        // Find the previous default payment method so we can revert if the MakeDefaultPaymentMethod command errors
        var paymentMethods = (0, PaymentUtils_1.formatPaymentMethods)(bankAccountList !== null && bankAccountList !== void 0 ? bankAccountList : {}, paymentCardList, styles);
        var previousPaymentMethod = paymentMethods.find(function (method) { return !!method.isDefault; });
        var currentPaymentMethod = paymentMethods.find(function (method) { return method.methodID === paymentMethod.methodID; });
        if (paymentMethod.selectedPaymentMethodType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
            (0, PaymentMethods_1.makeDefaultPaymentMethod)((_a = paymentMethod.selectedPaymentMethod.bankAccountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID, 0, previousPaymentMethod, currentPaymentMethod);
        }
        else if (paymentMethod.selectedPaymentMethodType === CONST_1.default.PAYMENT_METHODS.DEBIT_CARD) {
            (0, PaymentMethods_1.makeDefaultPaymentMethod)(0, (_b = paymentMethod.selectedPaymentMethod.fundID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID, previousPaymentMethod, currentPaymentMethod);
        }
    }, [
        paymentMethod.methodID,
        paymentMethod.selectedPaymentMethod.bankAccountID,
        paymentMethod.selectedPaymentMethod.fundID,
        paymentMethod.selectedPaymentMethodType,
        bankAccountList,
        fundList,
        styles,
    ]);
    var deletePaymentMethod = (0, react_1.useCallback)(function () {
        var bankAccountID = paymentMethod.selectedPaymentMethod.bankAccountID;
        var fundID = paymentMethod.selectedPaymentMethod.fundID;
        if (paymentMethod.selectedPaymentMethodType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && bankAccountID) {
            (0, BankAccounts_1.deletePaymentBankAccount)(bankAccountID);
        }
        else if (paymentMethod.selectedPaymentMethodType === CONST_1.default.PAYMENT_METHODS.DEBIT_CARD && fundID) {
            (0, PaymentMethods_1.deletePaymentCard)(fundID);
        }
    }, [paymentMethod.selectedPaymentMethod.bankAccountID, paymentMethod.selectedPaymentMethod.fundID, paymentMethod.selectedPaymentMethodType]);
    /**
     * Navigate to the appropriate page after completing the KYC flow, depending on what initiated it
     */
    var navigateToWalletOrTransferBalancePage = function (source) {
        Navigation_1.default.navigate(source === CONST_1.default.KYC_WALL_SOURCE.ENABLE_WALLET ? ROUTES_1.default.SETTINGS_WALLET : ROUTES_1.default.SETTINGS_WALLET_TRANSFER_BALANCE);
    };
    (0, react_1.useEffect)(function () {
        // If the user was previously offline, skip debouncing showing the loader
        if (!network.isOffline) {
            updateShouldShowLoadingSpinner();
        }
        else {
            debounceSetShouldShowLoadingSpinner();
        }
    }, [network.isOffline, debounceSetShouldShowLoadingSpinner, updateShouldShowLoadingSpinner]);
    (0, react_1.useEffect)(function () {
        if (network.isOffline) {
            return;
        }
        (0, PaymentMethods_1.openWalletPage)();
    }, [network.isOffline]);
    (0, react_1.useLayoutEffect)(function () {
        if (!shouldListenForResize || (!shouldShowAddPaymentMenu && !shouldShowDefaultDeleteMenu && !shouldShowCardMenu)) {
            return;
        }
        if (shouldShowAddPaymentMenu) {
            (0, debounce_1.default)(setMenuPosition, CONST_1.default.TIMING.RESIZE_DEBOUNCE_TIME)();
            return;
        }
        setMenuPosition();
        // This effect is intended to update menu position only on window dimension change.
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [windowWidth, windowHeight]);
    (0, react_1.useEffect)(function () {
        if (!shouldShowDefaultDeleteMenu) {
            return;
        }
        // We should reset selected payment method state values and close corresponding modals if the selected payment method is deleted
        var shouldResetPaymentMethodData = false;
        if (paymentMethod.selectedPaymentMethodType === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && (0, isEmpty_1.default)(bankAccountList === null || bankAccountList === void 0 ? void 0 : bankAccountList[paymentMethod.methodID])) {
            shouldResetPaymentMethodData = true;
        }
        else if (paymentMethod.selectedPaymentMethodType === CONST_1.default.PAYMENT_METHODS.DEBIT_CARD && (0, isEmpty_1.default)(fundList === null || fundList === void 0 ? void 0 : fundList[paymentMethod.methodID])) {
            shouldResetPaymentMethodData = true;
        }
        if (shouldResetPaymentMethodData) {
            // Close corresponding selected payment method modals which are open
            if (shouldShowDefaultDeleteMenu) {
                hideDefaultDeleteMenu();
            }
        }
    }, [hideDefaultDeleteMenu, paymentMethod.methodID, paymentMethod.selectedPaymentMethodType, bankAccountList, fundList, shouldShowDefaultDeleteMenu]);
    // Don't show "Make default payment method" button if it's the only payment method or if it's already the default
    var isCurrentPaymentMethodDefault = function () {
        var hasMultiplePaymentMethods = (0, PaymentUtils_1.formatPaymentMethods)(bankAccountList !== null && bankAccountList !== void 0 ? bankAccountList : {}, fundList !== null && fundList !== void 0 ? fundList : {}, styles).length > 1;
        if (hasMultiplePaymentMethods) {
            if (paymentMethod.formattedSelectedPaymentMethod.type === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                return paymentMethod.selectedPaymentMethod.bankAccountID === (userWallet === null || userWallet === void 0 ? void 0 : userWallet.walletLinkedAccountID);
            }
            if (paymentMethod.formattedSelectedPaymentMethod.type === CONST_1.default.PAYMENT_METHODS.DEBIT_CARD) {
                return paymentMethod.selectedPaymentMethod.fundID === (userWallet === null || userWallet === void 0 ? void 0 : userWallet.walletLinkedAccountID);
            }
        }
        return true;
    };
    var shouldShowMakeDefaultButton = !isCurrentPaymentMethodDefault() &&
        !(paymentMethod.formattedSelectedPaymentMethod.type === CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT && paymentMethod.selectedPaymentMethod.type === CONST_1.default.BANK_ACCOUNT.TYPE.BUSINESS);
    // Determines whether or not the modal popup is mounted from the bottom of the screen instead of the side mount on Web or Desktop screens
    var isPopoverBottomMount = anchorPosition.anchorPositionTop === 0 || shouldUseNarrowLayout;
    var alertTextStyle = [styles.inlineSystemMessage, styles.flexShrink1];
    var alertViewStyle = [styles.flexRow, styles.alignItemsCenter, styles.w100];
    var headerWithBackButton = (<HeaderWithBackButton_1.default title={translate('common.wallet')} icon={Illustrations.MoneyIntoWallet} shouldUseHeadlineHeader shouldShowBackButton={shouldUseNarrowLayout} shouldDisplaySearchRouter onBackButtonPress={Navigation_1.default.popToSidebar}/>);
    if (isLoadingApp) {
        return (<ScreenWrapper_1.default testID={WalletPage.displayName} shouldShowOfflineIndicatorInWideScreen>
                {headerWithBackButton}
                <react_native_1.View style={styles.flex1}>
                    <FullscreenLoadingIndicator_1.default />
                </react_native_1.View>
            </ScreenWrapper_1.default>);
    }
    return (<>
            <ScreenWrapper_1.default testID={WalletPage.displayName} shouldShowOfflineIndicatorInWideScreen>
                {headerWithBackButton}
                <ScrollView_1.default style={styles.pt3}>
                    <react_native_1.View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <OfflineWithFeedback_1.default style={styles.flex1} contentContainerStyle={styles.flex1} onClose={PaymentMethods_1.clearWalletError} errors={userWallet === null || userWallet === void 0 ? void 0 : userWallet.errors} errorRowStyles={[styles.ph6]}>
                            <Section_1.default subtitle={translate('walletPage.addBankAccountToSendAndReceive')} title={translate('common.bankAccounts')} isCentralPane subtitleMuted titleStyles={styles.accountSettingsSectionTitle} illustration={LottieAnimations_1.default.BankVault} illustrationStyle={styles.walletIllustration} illustrationContainerStyle={{ height: 220 }} illustrationBackgroundColor="#411103">
                                <PaymentMethodList_1.default shouldShowAddPaymentMethodButton={false} shouldShowEmptyListMessage={false} onPress={paymentMethodPressed} actionPaymentMethodType={shouldShowDefaultDeleteMenu ? paymentMethod.selectedPaymentMethodType : ''} activePaymentMethodID={shouldShowDefaultDeleteMenu ? getSelectedPaymentMethodID() : ''} buttonRef={addPaymentMethodAnchorRef} onListContentSizeChange={shouldShowAddPaymentMenu || shouldShowDefaultDeleteMenu ? setMenuPosition : function () { }} shouldEnableScroll={false} style={[styles.mt5, [shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]]} listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}/>
                            </Section_1.default>

                            {hasAssignedCard ? (<Section_1.default subtitle={translate('walletPage.assignedCardsDescription')} title={translate('walletPage.assignedCards')} isCentralPane subtitleMuted titleStyles={styles.accountSettingsSectionTitle}>
                                    <PaymentMethodList_1.default shouldShowAddBankAccount={false} shouldShowAddPaymentMethodButton={false} shouldShowAssignedCards shouldShowEmptyListMessage={false} shouldEnableScroll={false} onPress={assignedCardPressed} style={[styles.mt5, [shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8]]} listItemStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8} actionPaymentMethodType={shouldShowCardMenu ? paymentMethod.selectedPaymentMethodType : ''} activePaymentMethodID={shouldShowCardMenu ? paymentMethod.methodID : ''} buttonRef={addPaymentMethodAnchorRef} onListContentSizeChange={shouldShowCardMenu ? setMenuPosition : function () { }}/>
                                </Section_1.default>) : null}

                            {hasWallet && (<Section_1.default subtitle={translate("walletPage.sendAndReceiveMoney")} title={translate('walletPage.expensifyWallet')} isCentralPane subtitleMuted titleStyles={styles.accountSettingsSectionTitle}>
                                    <>
                                        {shouldShowLoadingSpinner && (<react_native_1.ActivityIndicator color={theme.spinner} size={CONST_1.default.ACTIVITY_INDICATOR_SIZE.LARGE} style={[styles.mt7, styles.mb5]}/>)}
                                        {!shouldShowLoadingSpinner && hasActivatedWallet && (<OfflineWithFeedback_1.default pendingAction={CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD} errors={walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.errors} onClose={PaymentMethods_1.clearWalletTermsError} errorRowStyles={[styles.ml10, styles.mr2]} style={[styles.mt4, styles.mb2]}>
                                                <MenuItemWithTopDescription_1.default description={translate('walletPage.balance')} title={(0, CurrencyUtils_1.convertToDisplayString)((_f = userWallet === null || userWallet === void 0 ? void 0 : userWallet.currentBalance) !== null && _f !== void 0 ? _f : 0)} titleStyle={styles.textHeadlineH2} interactive={false} wrapperStyle={styles.sectionMenuItemTopDescription} copyValue={(0, CurrencyUtils_1.convertToDisplayString)((_g = userWallet === null || userWallet === void 0 ? void 0 : userWallet.currentBalance) !== null && _g !== void 0 ? _g : 0)}/>
                                            </OfflineWithFeedback_1.default>)}

                                        <KYCWall_1.default onSuccessfulKYC={function (_iouPaymentType, source) { return navigateToWalletOrTransferBalancePage(source); }} onSelectPaymentMethod={function (selectedPaymentMethod) {
                if (hasActivatedWallet || selectedPaymentMethod !== CONST_1.default.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
                    return;
                }
                // To allow upgrading to a gold wallet, continue with the KYC flow after adding a bank account
                (0, BankAccounts_1.setPersonalBankAccountContinueKYCOnSuccess)(ROUTES_1.default.SETTINGS_WALLET);
            }} enablePaymentsRoute={ROUTES_1.default.SETTINGS_ENABLE_PAYMENTS} addBankAccountRoute={ROUTES_1.default.SETTINGS_ADD_BANK_ACCOUNT.route} addDebitCardRoute={ROUTES_1.default.SETTINGS_ADD_DEBIT_CARD} source={hasActivatedWallet ? CONST_1.default.KYC_WALL_SOURCE.TRANSFER_BALANCE : CONST_1.default.KYC_WALL_SOURCE.ENABLE_WALLET} shouldIncludeDebitCard={hasActivatedWallet}>
                                            {function (triggerKYCFlow, buttonRef) {
                if (shouldShowLoadingSpinner) {
                    return null;
                }
                if (hasActivatedWallet) {
                    return (<MenuItem_1.default ref={buttonRef} title={translate('common.transferBalance')} icon={Expensicons.Transfer} onPress={triggerKYCFlow} shouldShowRightIcon disabled={network.isOffline} wrapperStyle={[
                            styles.transferBalance,
                            shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8,
                            shouldUseNarrowLayout ? styles.ph5 : styles.ph8,
                        ]}/>);
                }
                if (isPendingOnfidoResult) {
                    return (<react_native_1.View style={alertViewStyle}>
                                                            <Icon_1.default src={Expensicons.Hourglass} fill={theme.icon}/>

                                                            <Text_1.default style={alertTextStyle}>{translate('walletPage.walletActivationPending')}</Text_1.default>
                                                        </react_native_1.View>);
                }
                if (hasFailedOnfido) {
                    return (<react_native_1.View style={alertViewStyle}>
                                                            <Icon_1.default src={Expensicons.Exclamation} fill={theme.icon}/>

                                                            <Text_1.default style={alertTextStyle}>{translate('walletPage.walletActivationFailed')}</Text_1.default>
                                                        </react_native_1.View>);
                }
                return (<MenuItem_1.default title={translate('walletPage.enableWallet')} icon={Expensicons.Wallet} ref={buttonRef} onPress={function () {
                        if (isActingAsDelegate) {
                            showDelegateNoAccessModal();
                            return;
                        }
                        if (isAccountLocked) {
                            showLockedAccountModal();
                            return;
                        }
                        if (!isUserValidated) {
                            Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(ROUTES_1.default.SETTINGS_WALLET, ROUTES_1.default.SETTINGS_ENABLE_PAYMENTS));
                            return;
                        }
                        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_ENABLE_PAYMENTS);
                    }} disabled={network.isOffline} wrapperStyle={[
                        styles.transferBalance,
                        shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8,
                        shouldUseNarrowLayout ? styles.ph5 : styles.ph8,
                    ]}/>);
            }}
                                        </KYCWall_1.default>
                                    </>
                                </Section_1.default>)}
                        </OfflineWithFeedback_1.default>
                    </react_native_1.View>
                </ScrollView_1.default>
                <Popover_1.default isVisible={shouldShowDefaultDeleteMenu} onClose={hideDefaultDeleteMenu} anchorPosition={{
            top: anchorPosition.anchorPositionTop,
            right: anchorPosition.anchorPositionRight,
        }} anchorRef={paymentMethodButtonRef}>
                    {!showConfirmDeleteModal && (<react_native_1.View style={[
                !shouldUseNarrowLayout
                    ? __assign(__assign({}, styles.sidebarPopover), styles.pv4) : styles.pt5,
            ]}>
                            {isPopoverBottomMount && (<MenuItem_1.default title={paymentMethod.formattedSelectedPaymentMethod.title} icon={(_h = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _h === void 0 ? void 0 : _h.icon} iconHeight={(_k = (_j = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _j === void 0 ? void 0 : _j.iconHeight) !== null && _k !== void 0 ? _k : (_l = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _l === void 0 ? void 0 : _l.iconSize} iconWidth={(_o = (_m = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _m === void 0 ? void 0 : _m.iconWidth) !== null && _o !== void 0 ? _o : (_p = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _p === void 0 ? void 0 : _p.iconSize} iconStyles={(_q = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _q === void 0 ? void 0 : _q.iconStyles} description={paymentMethod.formattedSelectedPaymentMethod.description} wrapperStyle={[styles.mb4, styles.ph5, styles.pv0]} interactive={false} displayInDefaultIconColor/>)}
                            {shouldShowMakeDefaultButton && (<MenuItem_1.default title={translate('walletPage.setDefaultConfirmation')} icon={Expensicons.Star} onPress={function () {
                    if (isActingAsDelegate) {
                        (0, Modal_1.close)(function () {
                            showDelegateNoAccessModal();
                        });
                        return;
                    }
                    if (isAccountLocked) {
                        (0, Modal_1.close)(function () { return showLockedAccountModal(); });
                        return;
                    }
                    makeDefaultPaymentMethod();
                    setShouldShowDefaultDeleteMenu(false);
                }} wrapperStyle={[styles.pv3, styles.ph5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]} numberOfLinesTitle={0}/>)}
                            <MenuItem_1.default title={translate('common.delete')} icon={Expensicons.Trashcan} onPress={function () {
                if (isActingAsDelegate) {
                    (0, Modal_1.close)(function () {
                        showDelegateNoAccessModal();
                    });
                    return;
                }
                if (isAccountLocked) {
                    (0, Modal_1.close)(function () { return showLockedAccountModal(); });
                    return;
                }
                (0, Modal_1.close)(function () { return setShowConfirmDeleteModal(true); });
            }} wrapperStyle={[styles.pv3, styles.ph5, !shouldUseNarrowLayout ? styles.sidebarPopover : {}]}/>
                        </react_native_1.View>)}
                </Popover_1.default>
                <Popover_1.default isVisible={shouldShowCardMenu} onClose={hideCardMenu} anchorPosition={{
            top: anchorPosition.anchorPositionTop,
            right: anchorPosition.anchorPositionRight,
        }} anchorRef={paymentMethodButtonRef}>
                    <react_native_1.View style={[
            !shouldUseNarrowLayout
                ? __assign(__assign({}, styles.sidebarPopover), styles.pv4) : styles.pt5,
        ]}>
                        {isPopoverBottomMount && (<MenuItem_1.default title={paymentMethod.formattedSelectedPaymentMethod.title} icon={(_r = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _r === void 0 ? void 0 : _r.icon} iconHeight={(_t = (_s = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _s === void 0 ? void 0 : _s.iconHeight) !== null && _t !== void 0 ? _t : (_u = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _u === void 0 ? void 0 : _u.iconSize} iconWidth={(_w = (_v = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _v === void 0 ? void 0 : _v.iconWidth) !== null && _w !== void 0 ? _w : (_x = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _x === void 0 ? void 0 : _x.iconSize} iconStyles={(_y = paymentMethod.formattedSelectedPaymentMethod.icon) === null || _y === void 0 ? void 0 : _y.iconStyles} description={paymentMethod.formattedSelectedPaymentMethod.description} wrapperStyle={[styles.mb4, styles.ph5, styles.pv0]} interactive={false} displayInDefaultIconColor/>)}
                        <MenuItem_1.default icon={Expensicons.MoneySearch} title={translate('workspace.common.viewTransactions')} onPress={function () {
            Navigation_1.default.navigate(ROUTES_1.default.SEARCH_ROOT.getRoute({
                query: (0, SearchQueryUtils_1.buildCannedSearchQuery)({
                    type: CONST_1.default.SEARCH.DATA_TYPES.EXPENSE,
                    status: CONST_1.default.SEARCH.STATUS.EXPENSE.ALL,
                    cardID: String(paymentMethod.methodID),
                }),
            }));
        }}/>
                    </react_native_1.View>
                </Popover_1.default>
                <ConfirmModal_1.default isVisible={showConfirmDeleteModal} onConfirm={function () {
            hideDefaultDeleteMenu();
            deletePaymentMethod();
        }} onCancel={hideDefaultDeleteMenu} title={translate('walletPage.deleteAccount')} prompt={translate('walletPage.deleteConfirmation')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} shouldShowCancelButton danger onModalHide={resetSelectedPaymentMethodData}/>
            </ScreenWrapper_1.default>
            <AddPaymentMethodMenu_1.default isVisible={shouldShowAddPaymentMenu} onClose={hideAddPaymentMenu} anchorPosition={{
            horizontal: anchorPosition.anchorPositionHorizontal,
            vertical: anchorPosition.anchorPositionVertical - CONST_1.default.MODAL.POPOVER_MENU_PADDING,
        }} onItemSelected={function (method) { return addPaymentMethodTypePressed(method); }} anchorRef={addPaymentMethodAnchorRef} shouldShowPersonalBankAccountOption/>
        </>);
}
WalletPage.displayName = 'WalletPage';
exports.default = WalletPage;
