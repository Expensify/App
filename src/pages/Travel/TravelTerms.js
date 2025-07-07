"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var CheckboxWithLabel_1 = require("@components/CheckboxWithLabel");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Link_1 = require("@libs/actions/Link");
var Travel_1 = require("@libs/actions/Travel");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function TravelTerms(_a) {
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isBlockedFromSpotnanaTravel = (0, usePermissions_1.default)().isBlockedFromSpotnanaTravel;
    var _b = (0, react_1.useState)(false), hasAcceptedTravelTerms = _b[0], setHasAcceptedTravelTerms = _b[1];
    var _c = (0, react_1.useState)(''), errorMessage = _c[0], setErrorMessage = _c[1];
    var travelProvisioning = (0, useOnyx_1.default)(ONYXKEYS_1.default.TRAVEL_PROVISIONING, { canBeMissing: true })[0];
    var isLoading = travelProvisioning === null || travelProvisioning === void 0 ? void 0 : travelProvisioning.isLoading;
    var domain = route.params.domain === CONST_1.default.TRAVEL.DEFAULT_DOMAIN ? undefined : route.params.domain;
    (0, react_1.useEffect)(function () {
        var _a;
        if ((travelProvisioning === null || travelProvisioning === void 0 ? void 0 : travelProvisioning.error) === CONST_1.default.TRAVEL.PROVISIONING.ERROR_PERMISSION_DENIED && domain) {
            Navigation_1.default.navigate(ROUTES_1.default.TRAVEL_DOMAIN_PERMISSION_INFO.getRoute(domain));
            (0, Travel_1.cleanupTravelProvisioningSession)();
        }
        if (travelProvisioning === null || travelProvisioning === void 0 ? void 0 : travelProvisioning.spotnanaToken) {
            Navigation_1.default.closeRHPFlow();
            (0, Travel_1.cleanupTravelProvisioningSession)();
            // TravelDot is a standalone white-labeled implementation of Spotnana so it has to be opened in a new tab
            react_native_1.Linking.openURL((0, Link_1.buildTravelDotURL)(travelProvisioning.spotnanaToken, (_a = travelProvisioning.isTestAccount) !== null && _a !== void 0 ? _a : false));
        }
        if ((travelProvisioning === null || travelProvisioning === void 0 ? void 0 : travelProvisioning.errors) && !(travelProvisioning === null || travelProvisioning === void 0 ? void 0 : travelProvisioning.error)) {
            setErrorMessage((0, ErrorUtils_1.getLatestErrorMessage)(travelProvisioning));
        }
    }, [travelProvisioning, domain]);
    var toggleTravelTerms = function () {
        setHasAcceptedTravelTerms(!hasAcceptedTravelTerms);
    };
    (0, react_1.useEffect)(function () {
        if (!hasAcceptedTravelTerms) {
            return;
        }
        setErrorMessage('');
    }, [hasAcceptedTravelTerms]);
    var AgreeToTheLabel = (0, react_1.useCallback)(function () { return (<Text_1.default>
                {"".concat(translate('travel.termsAndConditions.agree'))}
                <TextLink_1.default href={CONST_1.default.TRAVEL_TERMS_URL}>{"".concat(translate('travel.termsAndConditions.travelTermsAndConditions'))}</TextLink_1.default>
            </Text_1.default>); }, [translate]);
    // Add beta support for FullPageNotFound that is universal across travel pages
    return (<ScreenWrapper_1.default shouldEnableMaxHeight testID={TravelTerms.displayName}>
            <FullPageNotFoundView_1.default shouldShow={!CONFIG_1.default.IS_HYBRID_APP && isBlockedFromSpotnanaTravel}>
                <HeaderWithBackButton_1.default title={translate('travel.termsAndConditions.header')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <react_native_gesture_handler_1.ScrollView contentContainerStyle={[styles.flexGrow1, styles.ph5, styles.pb5]}>
                    <react_native_1.View style={styles.flex1}>
                        <Text_1.default style={styles.headerAnonymousFooter}>{"".concat(translate('travel.termsAndConditions.title'))}</Text_1.default>
                        <Text_1.default style={styles.mt4}>
                            {"".concat(translate('travel.termsAndConditions.subtitle'))}
                            <TextLink_1.default href={CONST_1.default.TRAVEL_TERMS_URL}>{"".concat(translate('travel.termsAndConditions.termsAndConditions'), ".")}</TextLink_1.default>
                        </Text_1.default>
                        <CheckboxWithLabel_1.default style={styles.mt6} accessibilityLabel={translate('travel.termsAndConditions.travelTermsAndConditions')} onInputChange={toggleTravelTerms} LabelComponent={AgreeToTheLabel}/>
                    </react_native_1.View>

                    <FormAlertWithSubmitButton_1.default buttonText={translate('common.continue')} isDisabled={!hasAcceptedTravelTerms} onSubmit={function () {
            if (!hasAcceptedTravelTerms) {
                setErrorMessage(translate('travel.termsAndConditions.error'));
                return;
            }
            if (errorMessage) {
                setErrorMessage('');
            }
            (0, Travel_1.acceptSpotnanaTerms)(domain);
        }} message={errorMessage} isAlertVisible={!!errorMessage} containerStyles={[styles.mh0, styles.mt5]} isLoading={isLoading}/>
                </react_native_gesture_handler_1.ScrollView>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
TravelTerms.displayName = 'TravelMenu';
exports.default = TravelTerms;
