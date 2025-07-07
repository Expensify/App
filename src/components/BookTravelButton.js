"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_hybrid_app_1 = require("@expensify/react-native-hybrid-app");
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var usePolicy_1 = require("@hooks/usePolicy");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link_1 = require("@libs/actions/Link");
var Travel_1 = require("@libs/actions/Travel");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var colors_1 = require("@styles/theme/colors");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var Button_1 = require("./Button");
var ConfirmModal_1 = require("./ConfirmModal");
var CustomStatusBarAndBackgroundContext_1 = require("./CustomStatusBarAndBackground/CustomStatusBarAndBackgroundContext");
var DotIndicatorMessage_1 = require("./DotIndicatorMessage");
var Illustrations_1 = require("./Icon/Illustrations");
var Text_1 = require("./Text");
var TextLink_1 = require("./TextLink");
var navigateToAcceptTerms = function (domain, isUserValidated) {
    // Remove the previous provision session information if any is cached.
    (0, Travel_1.cleanupTravelProvisioningSession)();
    if (isUserValidated) {
        Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_TCS.getRoute(domain));
        return;
    }
    Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT.getRoute(Navigation_1.default.getActiveRoute(), ROUTES_1.default.TRAVEL_TCS.getRoute(domain)));
};
function BookTravelButton(_a) {
    var _b, _c, _d;
    var text = _a.text, _e = _a.shouldRenderErrorMessageBelowButton, shouldRenderErrorMessageBelowButton = _e === void 0 ? false : _e, setShouldScrollToBottom = _a.setShouldScrollToBottom;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: false })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var isUserValidated = (_b = account === null || account === void 0 ? void 0 : account.validated) !== null && _b !== void 0 ? _b : false;
    var primaryLogin = (_c = account === null || account === void 0 ? void 0 : account.primaryLogin) !== null && _c !== void 0 ? _c : '';
    var policy = (0, usePolicy_1.default)(activePolicyID);
    var _f = (0, react_1.useState)(''), errorMessage = _f[0], setErrorMessage = _f[1];
    var travelSettings = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_TRAVEL_SETTINGS, { canBeMissing: false })[0];
    var sessionEmail = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { selector: function (session) { return session === null || session === void 0 ? void 0 : session.email; }, canBeMissing: false })[0];
    var primaryContactMethod = (_d = primaryLogin !== null && primaryLogin !== void 0 ? primaryLogin : sessionEmail) !== null && _d !== void 0 ? _d : '';
    var setRootStatusBarEnabled = (0, react_1.useContext)(CustomStatusBarAndBackgroundContext_1.default).setRootStatusBarEnabled;
    var _g = (0, usePermissions_1.default)(), isBlockedFromSpotnanaTravel = _g.isBlockedFromSpotnanaTravel, isBetaEnabled = _g.isBetaEnabled;
    var _h = (0, react_1.useState)(false), isPreventionModalVisible = _h[0], setPreventionModalVisibility = _h[1];
    var _j = (0, react_1.useState)(false), isVerificationModalVisible = _j[0], setVerificationModalVisibility = _j[1];
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { canBeMissing: false })[0];
    var currentUserLogin = (0, useCurrentUserPersonalDetails_1.default)().login;
    var activePolicies = (0, PolicyUtils_1.getActivePolicies)(policies, currentUserLogin);
    var groupPaidPolicies = activePolicies.filter(function (activePolicy) { return activePolicy.type !== CONST_1.default.POLICY.TYPE.PERSONAL && (0, PolicyUtils_1.isPaidGroupPolicy)(activePolicy); });
    // Flag indicating whether NewDot was launched exclusively for Travel,
    // e.g., when the user selects "Trips" from the Expensify Classic menu in HybridApp.
    var wasNewDotLaunchedJustForTravel = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SINGLE_NEW_DOT_ENTRY, { canBeMissing: false })[0];
    var hidePreventionModal = function () { return setPreventionModalVisibility(false); };
    var hideVerificationModal = function () { return setVerificationModalVisibility(false); };
    (0, react_1.useEffect)(function () {
        if (!errorMessage) {
            return;
        }
        setShouldScrollToBottom === null || setShouldScrollToBottom === void 0 ? void 0 : setShouldScrollToBottom(true);
    }, [errorMessage, setShouldScrollToBottom]);
    var bookATrip = (0, react_1.useCallback)(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        setErrorMessage('');
        if (isBlockedFromSpotnanaTravel) {
            setPreventionModalVisibility(true);
            return;
        }
        // The primary login of the user is where Spotnana sends the emails with booking confirmations, itinerary etc. It can't be a phone number.
        if (!primaryContactMethod || expensify_common_1.Str.isSMSLogin(primaryContactMethod)) {
            setErrorMessage(<Text_1.default style={[styles.flexRow, StyleUtils.getDotIndicatorTextStyles(true)]}>
                    <Text_1.default style={[StyleUtils.getDotIndicatorTextStyles(true)]}>{translate('travel.phoneError.phrase1')}</Text_1.default>{' '}
                    <TextLink_1.default style={[StyleUtils.getDotIndicatorTextStyles(true), styles.link]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONTACT_METHODS.getRoute(Navigation_1.default.getActiveRoute())); }}>
                        {translate('travel.phoneError.link')}
                    </TextLink_1.default>
                    <Text_1.default style={[StyleUtils.getDotIndicatorTextStyles(true)]}>{translate('travel.phoneError.phrase2')}</Text_1.default>
                </Text_1.default>);
            return;
        }
        var adminDomains = (0, PolicyUtils_1.getAdminsPrivateEmailDomains)(policy);
        if (adminDomains.length === 0) {
            Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_PUBLIC_DOMAIN_ERROR.getRoute(Navigation_1.default.getActiveRoute()));
            return;
        }
        if (groupPaidPolicies.length < 1) {
            Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_UPGRADE.getRoute(Navigation_1.default.getActiveRoute()));
            return;
        }
        if (!(0, PolicyUtils_1.isPaidGroupPolicy)(policy)) {
            setErrorMessage(translate('travel.termsAndConditions.defaultWorkspaceError'));
            return;
        }
        var isPolicyProvisioned = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.travelSettings) === null || _a === void 0 ? void 0 : _a.spotnanaCompanyID) !== null && _b !== void 0 ? _b : (_c = policy === null || policy === void 0 ? void 0 : policy.travelSettings) === null || _c === void 0 ? void 0 : _c.associatedTravelDomainAccountID;
        if ((_e = (_d = policy === null || policy === void 0 ? void 0 : policy.travelSettings) === null || _d === void 0 ? void 0 : _d.hasAcceptedTerms) !== null && _e !== void 0 ? _e : ((travelSettings === null || travelSettings === void 0 ? void 0 : travelSettings.hasAcceptedTerms) && isPolicyProvisioned)) {
            (_g = (_f = (0, Link_1.openTravelDotLink)(policy === null || policy === void 0 ? void 0 : policy.id)) === null || _f === void 0 ? void 0 : _f.then(function () {
                // When a user selects "Trips" in the Expensify Classic menu, the HybridApp opens the ManageTrips page in NewDot.
                // The wasNewDotLaunchedJustForTravel flag indicates if NewDot was launched solely for this purpose.
                if (!CONFIG_1.default.IS_HYBRID_APP || !wasNewDotLaunchedJustForTravel) {
                    return;
                }
                // Close NewDot if it was opened only for Travel, as its purpose is now fulfilled.
                Log_1.default.info('[HybridApp] Returning to OldDot after opening TravelDot');
                react_native_hybrid_app_1.default.closeReactNativeApp({ shouldSignOut: false, shouldSetNVP: false });
                setRootStatusBarEnabled(false);
            })) === null || _g === void 0 ? void 0 : _g.catch(function () {
                setErrorMessage(translate('travel.errorMessage'));
            });
        }
        else if (isPolicyProvisioned) {
            navigateToAcceptTerms(CONST_1.default.TRAVEL.DEFAULT_DOMAIN);
        }
        else if (!isBetaEnabled(CONST_1.default.BETAS.IS_TRAVEL_VERIFIED)) {
            setVerificationModalVisibility(true);
            if (!(travelSettings === null || travelSettings === void 0 ? void 0 : travelSettings.lastTravelSignupRequestTime)) {
                (0, Travel_1.requestTravelAccess)();
            }
        }
        // Determine the domain to associate with the workspace during provisioning in Spotnana.
        // - If all admins share the same private domain, the workspace is tied to it automatically.
        // - If admins have multiple private domains, the user must select one.
        // - Public domains are not allowed; an error page is shown in that case.
        else if (adminDomains.length === 1) {
            var domain = (_h = adminDomains.at(0)) !== null && _h !== void 0 ? _h : CONST_1.default.TRAVEL.DEFAULT_DOMAIN;
            if ((0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.address)) {
                // Spotnana requires an address anytime an entity is created for a policy
                Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_WORKSPACE_ADDRESS.getRoute(domain, Navigation_1.default.getActiveRoute()));
            }
            else {
                navigateToAcceptTerms(domain, !!isUserValidated);
            }
        }
        else {
            Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_DOMAIN_SELECTOR.getRoute(Navigation_1.default.getActiveRoute()));
        }
    }, [
        isBlockedFromSpotnanaTravel,
        primaryContactMethod,
        policy,
        travelSettings === null || travelSettings === void 0 ? void 0 : travelSettings.hasAcceptedTerms,
        styles.flexRow,
        styles.link,
        StyleUtils,
        translate,
        wasNewDotLaunchedJustForTravel,
        setRootStatusBarEnabled,
        isUserValidated,
        groupPaidPolicies.length,
        isBetaEnabled,
        travelSettings === null || travelSettings === void 0 ? void 0 : travelSettings.lastTravelSignupRequestTime,
    ]);
    return (<>
            {!shouldRenderErrorMessageBelowButton && !!errorMessage && (<DotIndicatorMessage_1.default style={styles.mb1} messages={{ error: errorMessage }} type="error"/>)}
            <Button_1.default text={text} onPress={bookATrip} accessibilityLabel={translate('travel.bookTravel')} style={styles.w100} success large/>
            {shouldRenderErrorMessageBelowButton && !!errorMessage && (<DotIndicatorMessage_1.default style={[styles.mb1, styles.pt3]} messages={{ error: errorMessage }} type="error"/>)}
            <ConfirmModal_1.default title={translate('travel.blockedFeatureModal.title')} titleStyles={styles.textHeadlineH1} titleContainerStyles={styles.mb2} onConfirm={hidePreventionModal} onCancel={hidePreventionModal} image={Illustrations_1.RocketDude} imageStyles={StyleUtils.getBackgroundColorStyle(colors_1.default.ice600)} isVisible={isPreventionModalVisible} prompt={translate('travel.blockedFeatureModal.message')} promptStyles={styles.mb2} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
            <ConfirmModal_1.default title={translate('travel.verifyCompany.title')} titleStyles={styles.textHeadlineH1} titleContainerStyles={styles.mb2} onConfirm={hideVerificationModal} onCancel={hideVerificationModal} image={Illustrations_1.RocketDude} imageStyles={StyleUtils.getBackgroundColorStyle(colors_1.default.ice600)} isVisible={isVerificationModalVisible} prompt={translate('travel.verifyCompany.message')} promptStyles={styles.mb2} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
        </>);
}
BookTravelButton.displayName = 'BookTravelButton';
exports.default = BookTravelButton;
