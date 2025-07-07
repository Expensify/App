"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var LottieAnimations_1 = require("@components/LottieAnimations");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var User_1 = require("@libs/actions/User");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var getPlatform_1 = require("@libs/getPlatform");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var LOCALES_1 = require("@src/CONST/LOCALES");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function PreferencesPage() {
    var _a, _b, _c;
    var priorityMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIORITY_MODE, { canBeMissing: true })[0];
    var platform = (0, getPlatform_1.default)(true);
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_MUTED_PLATFORMS, { canBeMissing: true })[0], mutedPlatforms = _d === void 0 ? {} : _d;
    var isPlatformMuted = mutedPlatforms[platform];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: false })[0];
    var preferredTheme = (0, useOnyx_1.default)(ONYXKEYS_1.default.PREFERRED_THEME, { canBeMissing: true })[0];
    var preferredLocale = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, { canBeMissing: true })[0];
    var personalPolicy = (0, usePolicy_1.default)((_a = (0, PolicyUtils_1.getPersonalPolicy)()) === null || _a === void 0 ? void 0 : _a.id);
    var paymentCurrency = (_b = personalPolicy === null || personalPolicy === void 0 ? void 0 : personalPolicy.outputCurrency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldShowOfflineIndicatorInWideScreen testID={PreferencesPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('common.preferences')} icon={Illustrations.Gears} shouldUseHeadlineHeader shouldShowBackButton={shouldUseNarrowLayout} shouldDisplaySearchRouter onBackButtonPress={Navigation_1.default.popToSidebar}/>
            <ScrollView_1.default contentContainerStyle={styles.pt3}>
                <react_native_1.View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section_1.default title={translate('preferencesPage.appSection.title')} isCentralPane illustration={LottieAnimations_1.default.PreferencesDJ} titleStyles={styles.accountSettingsSectionTitle}>
                        <react_native_1.View style={[styles.flex1, styles.mt5]}>
                            <react_native_1.View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween, styles.sectionMenuItemTopDescription]}>
                                <react_native_1.View style={styles.flex4}>
                                    <Text_1.default>{translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')}</Text_1.default>
                                </react_native_1.View>
                                <react_native_1.View style={[styles.flex1, styles.alignItemsEnd]}>
                                    <Switch_1.default accessibilityLabel={translate('preferencesPage.receiveRelevantFeatureUpdatesAndExpensifyNews')} isOn={(_c = account === null || account === void 0 ? void 0 : account.isSubscribedToNewsletter) !== null && _c !== void 0 ? _c : true} onToggle={User_1.updateNewsletterSubscription}/>
                                </react_native_1.View>
                            </react_native_1.View>
                            <react_native_1.View style={[styles.flexRow, styles.mb4, styles.justifyContentBetween]}>
                                <react_native_1.View style={styles.flex4}>
                                    <Text_1.default>{translate('preferencesPage.muteAllSounds')}</Text_1.default>
                                </react_native_1.View>
                                <react_native_1.View style={[styles.flex1, styles.alignItemsEnd]}>
                                    <Switch_1.default accessibilityLabel={translate('preferencesPage.muteAllSounds')} isOn={isPlatformMuted !== null && isPlatformMuted !== void 0 ? isPlatformMuted : false} onToggle={function () { return (0, User_1.togglePlatformMute)(platform, mutedPlatforms); }}/>
                                </react_native_1.View>
                            </react_native_1.View>
                            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={translate("priorityModePage.priorityModes.".concat(priorityMode !== null && priorityMode !== void 0 ? priorityMode : CONST_1.default.PRIORITY_MODE.DEFAULT, ".label"))} description={translate('priorityModePage.priorityMode')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_PRIORITY_MODE); }} wrapperStyle={styles.sectionMenuItemTopDescription}/>
                            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={preferredLocale ? LOCALES_1.LOCALE_TO_LANGUAGE_STRING[preferredLocale] : undefined} description={translate('languagePage.language')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_LANGUAGE); }} wrapperStyle={styles.sectionMenuItemTopDescription} hintText={!preferredLocale || !(0, LOCALES_1.isFullySupportedLocale)(preferredLocale) ? translate('languagePage.aiGenerated') : ''}/>
                            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={"".concat(paymentCurrency, " - ").concat((0, CurrencyUtils_1.getCurrencySymbol)(paymentCurrency))} description={translate('billingCurrency.paymentCurrency')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_PAYMENT_CURRENCY); }} wrapperStyle={styles.sectionMenuItemTopDescription}/>
                            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={translate("themePage.themes.".concat(preferredTheme !== null && preferredTheme !== void 0 ? preferredTheme : CONST_1.default.THEME.DEFAULT, ".label"))} description={translate('themePage.theme')} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_THEME); }} wrapperStyle={styles.sectionMenuItemTopDescription}/>
                        </react_native_1.View>
                    </Section_1.default>
                </react_native_1.View>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
PreferencesPage.displayName = 'PreferencesPage';
exports.default = PreferencesPage;
