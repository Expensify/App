"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var CurrencySelectionList_1 = require("@components/CurrencySelectionList");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Onboarding_1 = require("@libs/actions/Onboarding");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function BaseOnboardingWorkspaceCurrency(_a) {
    var _b, _c, _d;
    var route = _a.route, shouldUseNativeStyles = _a.shouldUseNativeStyles;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var onboardingIsMediumOrLargerScreenWidth = (0, useResponsiveLayout_1.default)().onboardingIsMediumOrLargerScreenWidth;
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var draftValues = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM_DRAFT, { canBeMissing: true })[0];
    var value = (_c = (_b = draftValues === null || draftValues === void 0 ? void 0 : draftValues.currency) !== null && _b !== void 0 ? _b : currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.localCurrencyCode) !== null && _c !== void 0 ? _c : CONST_1.default.CURRENCY.USD;
    var goBack = (0, react_1.useCallback)(function () {
        var _a;
        var backTo = (_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.backTo;
        if (backTo) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        Navigation_1.default.goBack();
    }, [(_d = route === null || route === void 0 ? void 0 : route.params) === null || _d === void 0 ? void 0 : _d.backTo]);
    var updateInput = (0, react_1.useCallback)(function (item) {
        (0, Onboarding_1.setWorkspaceCurrency)(item.currencyCode);
        goBack();
    }, [goBack]);
    return (<ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={BaseOnboardingWorkspaceCurrency.displayName} style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]} shouldShowOfflineIndicator={!onboardingIsMediumOrLargerScreenWidth}>
            <HeaderWithBackButton_1.default progressBarPercentage={100} onBackButtonPress={goBack}/>
            <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                <Text_1.default style={styles.textHeadlineH1}>{translate('common.currency')}</Text_1.default>
            </react_native_1.View>
            <CurrencySelectionList_1.default listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []} textInputStyle={onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5} initiallySelectedCurrencyCode={value} onSelect={updateInput} searchInputLabel={translate('common.search')} addBottomSafeAreaPadding/>
        </ScreenWrapper_1.default>);
}
BaseOnboardingWorkspaceCurrency.displayName = 'BaseOnboardingWorkspaceCurrency';
exports.default = BaseOnboardingWorkspaceCurrency;
