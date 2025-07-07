"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var ImportOnyxState_1 = require("@components/ImportOnyxState");
var LottieAnimations_1 = require("@components/LottieAnimations");
var MenuItemList_1 = require("@components/MenuItemList");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var RecordTroubleshootDataToolMenu_1 = require("@components/RecordTroubleshootDataToolMenu");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Switch_1 = require("@components/Switch");
var TestToolMenu_1 = require("@components/TestToolMenu");
var TestToolRow_1 = require("@components/TestToolRow");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useEnvironment_1 = require("@hooks/useEnvironment");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWaitForNavigation_1 = require("@hooks/useWaitForNavigation");
var MaskOnyx_1 = require("@libs/actions/MaskOnyx");
var ExportOnyxState_1 = require("@libs/ExportOnyxState");
var Navigation_1 = require("@libs/Navigation/Navigation");
var App_1 = require("@userActions/App");
var Report_1 = require("@userActions/Report");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var getLightbulbIllustrationStyle_1 = require("./getLightbulbIllustrationStyle");
function TroubleshootPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isProduction = (0, useEnvironment_1.default)().isProduction;
    var _a = (0, react_1.useState)(false), isConfirmationModalVisible = _a[0], setIsConfirmationModalVisible = _a[1];
    var waitForNavigate = (0, useWaitForNavigation_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var illustrationStyle = (0, getLightbulbIllustrationStyle_1.default)();
    var _b = (0, react_1.useState)(false), isLoading = _b[0], setIsLoading = _b[1];
    var shouldStoreLogs = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHOULD_STORE_LOGS, { canBeMissing: true })[0];
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.SHOULD_MASK_ONYX_STATE, { canBeMissing: true })[0], shouldMaskOnyxState = _c === void 0 ? true : _c;
    var resetOptions = (0, OptionListContextProvider_1.useOptionsList)({ shouldInitialize: false }).resetOptions;
    var exportOnyxState = (0, react_1.useCallback)(function () {
        ExportOnyxState_1.default.readFromOnyxDatabase().then(function (value) {
            var dataToShare = ExportOnyxState_1.default.maskOnyxState(value, shouldMaskOnyxState);
            ExportOnyxState_1.default.shareAsFile(JSON.stringify(dataToShare));
        });
    }, [shouldMaskOnyxState]);
    var menuItems = (0, react_1.useMemo)(function () {
        var debugConsoleItem = {
            translationKey: 'initialSettingsPage.troubleshoot.viewConsole',
            icon: Expensicons.Bug,
            action: waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_CONSOLE.getRoute(ROUTES_1.default.SETTINGS_TROUBLESHOOT)); }),
        };
        var baseMenuItems = [
            {
                translationKey: 'initialSettingsPage.troubleshoot.clearCacheAndRestart',
                icon: Expensicons.RotateLeft,
                action: function () { return setIsConfirmationModalVisible(true); },
            },
            {
                translationKey: 'initialSettingsPage.troubleshoot.exportOnyxState',
                icon: Expensicons.Download,
                action: exportOnyxState,
            },
        ];
        if (shouldStoreLogs) {
            baseMenuItems.push(debugConsoleItem);
        }
        return baseMenuItems
            .map(function (item) { return ({
            key: item.translationKey,
            title: translate(item.translationKey),
            icon: item.icon,
            onPress: item.action,
            wrapperStyle: [styles.sectionMenuItemTopDescription],
        }); })
            .reverse();
    }, [waitForNavigate, exportOnyxState, shouldStoreLogs, translate, styles.sectionMenuItemTopDescription]);
    return (<ScreenWrapper_1.default shouldEnablePickerAvoiding={false} shouldShowOfflineIndicatorInWideScreen testID={TroubleshootPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('initialSettingsPage.aboutPage.troubleshoot')} shouldShowBackButton={shouldUseNarrowLayout} shouldDisplaySearchRouter onBackButtonPress={Navigation_1.default.popToSidebar} icon={Illustrations.Lightbulb} shouldUseHeadlineHeader/>
            {isLoading && <FullscreenLoadingIndicator_1.default />}
            <ScrollView_1.default contentContainerStyle={styles.pt3}>
                <react_native_1.View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section_1.default title={translate('initialSettingsPage.aboutPage.troubleshoot')} subtitle={translate('initialSettingsPage.troubleshoot.description')} isCentralPane subtitleMuted illustration={LottieAnimations_1.default.Desk} illustrationStyle={illustrationStyle} titleStyles={styles.accountSettingsSectionTitle} renderSubtitle={function () { return (<Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
                                <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('initialSettingsPage.troubleshoot.description')}</Text_1.default>{' '}
                                <TextLink_1.default style={styles.link} onPress={function () { return (0, Report_1.navigateToConciergeChat)(); }}>
                                    {translate('initialSettingsPage.troubleshoot.submitBug')}
                                </TextLink_1.default>
                                .
                            </Text_1.default>); }}>
                        <react_native_1.View style={[styles.flex1, styles.mt5]}>
                            <react_native_1.View>
                                <RecordTroubleshootDataToolMenu_1.default />
                                <TestToolRow_1.default title={translate('initialSettingsPage.troubleshoot.maskExportOnyxStateData')}>
                                    <Switch_1.default accessibilityLabel={translate('initialSettingsPage.troubleshoot.maskExportOnyxStateData')} isOn={shouldMaskOnyxState} onToggle={MaskOnyx_1.setShouldMaskOnyxState}/>
                                </TestToolRow_1.default>
                            </react_native_1.View>
                            <ImportOnyxState_1.default setIsLoading={setIsLoading}/>
                            <MenuItemList_1.default menuItems={menuItems} shouldUseSingleExecution/>
                            {!isProduction && (<react_native_1.View style={[styles.mt6]}>
                                    <TestToolMenu_1.default />
                                </react_native_1.View>)}
                            <ConfirmModal_1.default title={translate('common.areYouSure')} isVisible={isConfirmationModalVisible} onConfirm={function () {
            setIsConfirmationModalVisible(false);
            resetOptions();
            (0, App_1.clearOnyxAndResetApp)();
        }} onCancel={function () { return setIsConfirmationModalVisible(false); }} prompt={translate('initialSettingsPage.troubleshoot.confirmResetDescription')} confirmText={translate('initialSettingsPage.troubleshoot.resetAndRefresh')} cancelText={translate('common.cancel')}/>
                        </react_native_1.View>
                    </Section_1.default>
                </react_native_1.View>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
TroubleshootPage.displayName = 'TroubleshootPage';
exports.default = TroubleshootPage;
