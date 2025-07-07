"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_device_info_1 = require("react-native-device-info");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var Illustrations = require("@components/Icon/Illustrations");
var LottieAnimations_1 = require("@components/LottieAnimations");
var MenuItemList_1 = require("@components/MenuItemList");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWaitForNavigation_1 = require("@hooks/useWaitForNavigation");
var Environment_1 = require("@libs/Environment/Environment");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var Link_1 = require("@userActions/Link");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var package_json_1 = require("../../../../package.json");
function getFlavor() {
    var bundleId = react_native_device_info_1.default.getBundleId();
    if (bundleId.includes('dev')) {
        return ' Develop';
    }
    if (bundleId.includes('adhoc')) {
        return ' Ad-Hoc';
    }
    return '';
}
function AboutPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var popoverAnchor = (0, react_1.useRef)(null);
    var waitForNavigate = (0, useWaitForNavigation_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var menuItems = (0, react_1.useMemo)(function () {
        var baseMenuItems = [
            {
                translationKey: 'initialSettingsPage.aboutPage.appDownloadLinks',
                icon: Expensicons.Link,
                action: waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_APP_DOWNLOAD_LINKS); }),
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.viewKeyboardShortcuts',
                icon: Expensicons.Keyboard,
                action: waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.KEYBOARD_SHORTCUTS); }),
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.viewTheCode',
                icon: Expensicons.Eye,
                iconRight: Expensicons.NewWindow,
                action: function () {
                    (0, Link_1.openExternalLink)(CONST_1.default.GITHUB_URL);
                    return Promise.resolve();
                },
                link: CONST_1.default.GITHUB_URL,
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.viewOpenJobs',
                icon: Expensicons.MoneyBag,
                iconRight: Expensicons.NewWindow,
                action: function () {
                    (0, Link_1.openExternalLink)(CONST_1.default.UPWORK_URL);
                    return Promise.resolve();
                },
                link: CONST_1.default.UPWORK_URL,
            },
            {
                translationKey: 'initialSettingsPage.aboutPage.reportABug',
                icon: Expensicons.Bug,
                action: waitForNavigate(Report_1.navigateToConciergeChat),
            },
        ];
        return baseMenuItems.map(function (_a) {
            var translationKey = _a.translationKey, icon = _a.icon, iconRight = _a.iconRight, action = _a.action, link = _a.link;
            return ({
                key: translationKey,
                title: translate(translationKey),
                icon: icon,
                iconRight: iconRight,
                onPress: action,
                shouldShowRightIcon: true,
                onSecondaryInteraction: link
                    ? function (event) {
                        return (0, ReportActionContextMenu_1.showContextMenu)({
                            type: CONST_1.default.CONTEXT_MENU_TYPES.LINK,
                            event: event,
                            selection: link,
                            contextMenuAnchor: popoverAnchor.current,
                        });
                    }
                    : undefined,
                ref: popoverAnchor,
                shouldBlockSelection: !!link,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
            });
        });
    }, [styles, translate, waitForNavigate]);
    var overlayContent = (0, react_1.useCallback)(function () { return (<react_native_1.View style={[styles.pAbsolute, styles.w100, styles.h100, styles.justifyContentEnd, styles.pb3]}>
                <Text_1.default selectable style={[styles.textLabel, styles.textVersion, styles.alignSelfCenter]}>
                    v{(0, Environment_1.isInternalTestBuild)() ? "".concat(package_json_1.default.version, " PR:").concat(CONST_1.default.PULL_REQUEST_NUMBER).concat(getFlavor()) : "".concat(package_json_1.default.version).concat(getFlavor())}
                </Text_1.default>
            </react_native_1.View>); }, 
    // disabling this rule, as we want this to run only on the first render
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    []);
    return (<ScreenWrapper_1.default shouldEnablePickerAvoiding={false} shouldShowOfflineIndicatorInWideScreen testID={AboutPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('initialSettingsPage.about')} shouldShowBackButton={shouldUseNarrowLayout} shouldDisplaySearchRouter onBackButtonPress={Navigation_1.default.popToSidebar} icon={Illustrations.PalmTree} shouldUseHeadlineHeader/>
            <ScrollView_1.default contentContainerStyle={styles.pt3}>
                <react_native_1.View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section_1.default title={translate('footer.aboutExpensify')} subtitle={translate('initialSettingsPage.aboutPage.description')} isCentralPane subtitleMuted illustration={LottieAnimations_1.default.Coin} titleStyles={styles.accountSettingsSectionTitle} overlayContent={overlayContent}>
                        <react_native_1.View style={[styles.flex1, styles.mt5]}>
                            <MenuItemList_1.default menuItems={menuItems} shouldUseSingleExecution/>
                        </react_native_1.View>
                    </Section_1.default>
                </react_native_1.View>
                <react_native_1.View style={[styles.sidebarFooter, styles.mb5]}>
                    <Text_1.default style={[styles.chatItemMessageHeaderTimestamp]} numberOfLines={1}>
                        {translate('initialSettingsPage.readTheTermsAndPrivacy.phrase1')}{' '}
                        <TextLink_1.default style={[styles.textMicroSupporting, styles.link]} href={CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL}>
                            {translate('initialSettingsPage.readTheTermsAndPrivacy.phrase2')}
                        </TextLink_1.default>{' '}
                        {translate('initialSettingsPage.readTheTermsAndPrivacy.phrase3')}{' '}
                        <TextLink_1.default style={[styles.textMicroSupporting, styles.link]} href={CONST_1.default.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}>
                            {translate('initialSettingsPage.readTheTermsAndPrivacy.phrase4')}
                        </TextLink_1.default>
                        .
                    </Text_1.default>
                </react_native_1.View>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
AboutPage.displayName = 'AboutPage';
exports.default = AboutPage;
