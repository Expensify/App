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
var react_native_hybrid_app_1 = require("@expensify/react-native-hybrid-app");
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmationPage_1 = require("@components/ConfirmationPage");
var CustomStatusBarAndBackgroundContext_1 = require("@components/CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var LottieAnimations_1 = require("@components/LottieAnimations");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Link_1 = require("@userActions/Link");
var Report_1 = require("@userActions/Report");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
function MergeResultPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var setRootStatusBarEnabled = (0, react_1.useContext)(CustomStatusBarAndBackgroundContext_1.default).setRootStatusBarEnabled;
    var userEmailOrPhone = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; }, canBeMissing: true })[0];
    var params = (0, native_1.useRoute)().params;
    var result = params.result, login = params.login;
    var defaultResult = {
        heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
        buttonText: translate('common.buttonConfirm'),
        illustration: Illustrations.LockClosedOrange,
    };
    var results = (0, react_1.useMemo)(function () {
        var _a;
        return _a = {},
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.SUCCESS] = {
                heading: translate('mergeAccountsPage.mergeSuccess.accountsMerged'),
                description: (<>
                        {translate('mergeAccountsPage.mergeSuccess.successfullyMergedAllData.beforeFirstEmail')}
                        <Text_1.default style={[styles.textStrong, styles.textSupporting]}>{login}</Text_1.default>
                        {translate('mergeAccountsPage.mergeSuccess.successfullyMergedAllData.beforeSecondEmail')}
                        <Text_1.default style={[styles.textStrong, styles.textSupporting]}>{userEmailOrPhone}</Text_1.default>
                        {translate('mergeAccountsPage.mergeSuccess.successfullyMergedAllData.afterSecondEmail')}
                    </>),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
                illustration: LottieAnimations_1.default.Fireworks,
                illustrationStyle: { width: 150, height: 150 },
            },
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_NO_EXIST] = {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (<>
                        {translate('mergeAccountsPage.mergeFailureUncreatedAccount.noExpensifyAccount.beforeEmail')}
                        <Text_1.default style={[styles.textStrong, styles.textSupporting]}>{login}</Text_1.default>
                        {translate('mergeAccountsPage.mergeFailureUncreatedAccount.noExpensifyAccount.afterEmail')}{' '}
                        {translate('mergeAccountsPage.mergeFailureUncreatedAccount.addContactMethod.beforeLink')}
                        <TextLink_1.default onPress={function () {
                        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONTACT_METHODS.getRoute());
                    }}>
                            {translate('mergeAccountsPage.mergeFailureUncreatedAccount.addContactMethod.linkText')}
                        </TextLink_1.default>
                        {translate('mergeAccountsPage.mergeFailureUncreatedAccount.addContactMethod.afterLink')}
                    </>),
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_2FA] = {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (<>
                        {translate('mergeAccountsPage.mergeFailure2FA.oldAccount2FAEnabled.beforeFirstEmail')}
                        <Text_1.default style={[styles.textStrong, styles.textSupporting]}>{login}</Text_1.default>
                        {translate('mergeAccountsPage.mergeFailure2FA.oldAccount2FAEnabled.beforeSecondEmail')}
                        <Text_1.default style={[styles.textStrong, styles.textSupporting]}>{login}</Text_1.default>
                        {translate('mergeAccountsPage.mergeFailure2FA.oldAccount2FAEnabled.afterSecondEmail')}
                    </>),
                cta: <TextLink_1.default href={CONST_1.default.MERGE_ACCOUNT_HELP_URL}>{translate('mergeAccountsPage.mergeFailure2FA.learnMore')}</TextLink_1.default>,
                ctaStyle: __assign(__assign({}, styles.mt2), styles.textSupporting),
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_SMART_SCANNER] = {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (<>
                        {translate('mergeAccountsPage.mergeFailureSmartScannerAccount.beforeEmail')}
                        <Text_1.default style={[styles.textStrong, styles.textSupporting]}>{login}</Text_1.default>
                        {translate('mergeAccountsPage.mergeFailureSmartScannerAccount.afterEmail')}
                    </>),
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
            },
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_SAML_DOMAIN_CONTROL] = {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (<>
                        {translate('mergeAccountsPage.mergeFailureSAMLDomainControl.beforeFirstEmail')}
                        <Text_1.default style={[styles.textStrong, styles.textSupporting]}>{login}</Text_1.default>
                        {translate('mergeAccountsPage.mergeFailureSAMLDomainControl.beforeDomain')}
                        <Text_1.default style={[styles.textStrong, styles.textSupporting]}>{login.split('@').at(1)}</Text_1.default>
                        {translate('mergeAccountsPage.mergeFailureSAMLDomainControl.afterDomain')}
                        <TextLink_1.default onPress={function () {
                        (0, Report_1.navigateToConciergeChat)();
                    }}>
                            {translate('mergeAccountsPage.mergeFailureSAMLDomainControl.linkText')}
                        </TextLink_1.default>
                        {translate('mergeAccountsPage.mergeFailureSAMLDomainControl.afterLink')}
                    </>),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
                illustration: Illustrations.LockClosedOrange,
            },
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_SAML_NOT_SUPPORTED] = {
                heading: translate('mergeAccountsPage.mergePendingSAML.weAreWorkingOnIt'),
                description: <Text_1.default style={[styles.textSupporting, styles.textAlignCenter]}>{translate('mergeAccountsPage.mergePendingSAML.limitedSupport')}</Text_1.default>,
                cta: (<Text_1.default style={[styles.textAlignCenter, styles.textSupporting]}>
                        {translate('mergeAccountsPage.mergePendingSAML.reachOutForHelp.beforeLink')}
                        <TextLink_1.default onPress={function () {
                        (0, Report_1.navigateToConciergeChat)();
                    }}>
                            {translate('mergeAccountsPage.mergePendingSAML.reachOutForHelp.linkText')}
                        </TextLink_1.default>
                        {translate('mergeAccountsPage.mergePendingSAML.reachOutForHelp.afterLink')}
                    </Text_1.default>),
                ctaStyle: styles.mt2,
                secondaryButtonText: translate('mergeAccountsPage.mergePendingSAML.goToExpensifyClassic'),
                onSecondaryButtonPress: function () {
                    if (CONFIG_1.default.IS_HYBRID_APP) {
                        react_native_hybrid_app_1.default.closeReactNativeApp({ shouldSignOut: false, shouldSetNVP: true });
                        setRootStatusBarEnabled(false);
                        return;
                    }
                    (0, Link_1.openOldDotLink)(CONST_1.default.OLDDOT_URLS.INBOX, false);
                },
                shouldShowSecondaryButton: true,
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
                illustration: Illustrations.RunningTurtle,
                illustrationStyle: { width: 132, height: 150 },
            },
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_SAML_PRIMARY_LOGIN] = {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (<>
                        {translate('mergeAccountsPage.mergeFailureSAMLAccount.beforeEmail')}
                        <Text_1.default style={[styles.textStrong, styles.textSupporting]}>{login}</Text_1.default>
                        {translate('mergeAccountsPage.mergeFailureSAMLAccount.afterEmail')}
                    </>),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
                illustration: Illustrations.LockClosedOrange,
            },
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_ACCOUNT_LOCKED] = {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (<>
                        {translate('mergeAccountsPage.mergeFailureAccountLocked.beforeEmail')}
                        <Text_1.default style={[styles.textStrong, styles.textSupporting]}>{login}</Text_1.default>
                        {translate('mergeAccountsPage.mergeFailureAccountLocked.afterEmail')}
                        <TextLink_1.default onPress={function () {
                        (0, Report_1.navigateToConciergeChat)();
                    }}>
                            {translate('mergeAccountsPage.mergeFailureAccountLocked.linkText')}
                        </TextLink_1.default>
                        {translate('mergeAccountsPage.mergeFailureAccountLocked.afterLink')}
                    </>),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
                illustration: Illustrations.LockClosedOrange,
            },
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_INVOICING] = {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: (<>
                        {translate('mergeAccountsPage.mergeFailureInvoicedAccount.beforeEmail')}
                        <Text_1.default style={[styles.textStrong, styles.textSupporting]}>{login}</Text_1.default>
                        {translate('mergeAccountsPage.mergeFailureInvoicedAccount.afterEmail')}
                    </>),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
                illustration: Illustrations.LockClosedOrange,
            },
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.TOO_MANY_ATTEMPTS] = {
                heading: translate('mergeAccountsPage.mergeFailureTooManyAttempts.heading'),
                description: translate('mergeAccountsPage.mergeFailureTooManyAttempts.description'),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
                illustration: Illustrations.LockClosedOrange,
            },
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.ACCOUNT_UNVALIDATED] = {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: translate('mergeAccountsPage.mergeFailureUnvalidatedAccount.description'),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
                illustration: Illustrations.LockClosedOrange,
            },
            _a[CONST_1.default.MERGE_ACCOUNT_RESULTS.ERR_MERGE_SELF] = {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: translate('mergeAccountsPage.mergeFailureSelfMerge.description'),
                buttonText: translate('common.buttonConfirm'),
                onButtonPress: function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_SECURITY); },
                illustration: Illustrations.LockClosedOrange,
            },
            _a;
    }, [setRootStatusBarEnabled, login, translate, userEmailOrPhone, styles]);
    (0, react_1.useEffect)(function () {
        /**
         * If the result is success, we need to remove the initial screen from the navigation state
         * so that the back button closes the modal instead of going back to the initial screen.
         */
        if (result !== CONST_1.default.MERGE_ACCOUNT_RESULTS.SUCCESS) {
            return;
        }
        react_native_1.InteractionManager.runAfterInteractions(function () {
            Navigation_1.default.removeScreenFromNavigationState(SCREENS_1.default.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_DETAILS);
        });
    }, [result]);
    var _a = results[result] || defaultResult, heading = _a.heading, headingStyle = _a.headingStyle, onButtonPress = _a.onButtonPress, descriptionStyle = _a.descriptionStyle, illustration = _a.illustration, illustrationStyle = _a.illustrationStyle, description = _a.description, buttonText = _a.buttonText, secondaryButtonText = _a.secondaryButtonText, onSecondaryButtonPress = _a.onSecondaryButtonPress, shouldShowSecondaryButton = _a.shouldShowSecondaryButton, cta = _a.cta, ctaStyle = _a.ctaStyle;
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom testID={MergeResultPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('mergeAccountsPage.mergeAccount')} shouldShowBackButton={result !== CONST_1.default.MERGE_ACCOUNT_RESULTS.SUCCESS} onBackButtonPress={function () {
            Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_MERGE_ACCOUNTS.getRoute());
        }} shouldDisplayHelpButton={false}/>
            <ConfirmationPage_1.default containerStyle={__assign(__assign({}, styles.flexGrow1), styles.mt3)} heading={heading} headingStyle={headingStyle} onButtonPress={onButtonPress} shouldShowButton buttonText={buttonText} shouldShowSecondaryButton={shouldShowSecondaryButton} secondaryButtonText={secondaryButtonText} onSecondaryButtonPress={onSecondaryButtonPress} description={description} descriptionStyle={[descriptionStyle, styles.textSupporting]} illustration={illustration} illustrationStyle={illustrationStyle} cta={cta} ctaStyle={ctaStyle}/>
        </ScreenWrapper_1.default>);
}
MergeResultPage.displayName = 'MergeResultPage';
exports.default = MergeResultPage;
