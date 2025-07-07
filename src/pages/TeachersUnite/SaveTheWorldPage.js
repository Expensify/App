"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Illustrations = require("@components/Icon/Illustrations");
var LottieAnimations_1 = require("@components/LottieAnimations");
var MenuItemList_1 = require("@components/MenuItemList");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Section_1 = require("@components/Section");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWaitForNavigation_1 = require("@hooks/useWaitForNavigation");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
function SaveTheWorldPage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var waitForNavigate = (0, useWaitForNavigation_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var theme = (0, useTheme_1.default)();
    var menuItems = (0, react_1.useMemo)(function () {
        var baseMenuItems = [
            {
                translationKey: 'teachersUnitePage.iKnowATeacher',
                action: waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.I_KNOW_A_TEACHER); }),
            },
            {
                translationKey: 'teachersUnitePage.iAmATeacher',
                action: waitForNavigate(function () { return Navigation_1.default.navigate(ROUTES_1.default.I_AM_A_TEACHER); }),
            },
        ];
        return baseMenuItems.map(function (item) { return ({
            key: item.translationKey,
            title: translate(item.translationKey),
            onPress: item.action,
            shouldShowRightIcon: true,
            link: '',
            wrapperStyle: [styles.sectionMenuItemTopDescription],
        }); });
    }, [translate, waitForNavigate, styles]);
    return (<ScreenWrapper_1.default testID={SaveTheWorldPage.displayName} includeSafeAreaPaddingBottom={false} shouldEnablePickerAvoiding={false} shouldShowOfflineIndicatorInWideScreen>
            <HeaderWithBackButton_1.default title={translate('sidebarScreen.saveTheWorld')} shouldShowBackButton={shouldUseNarrowLayout} shouldDisplaySearchRouter onBackButtonPress={Navigation_1.default.popToSidebar} icon={Illustrations.TeachersUnite} shouldUseHeadlineHeader/>
            <ScrollView_1.default contentContainerStyle={styles.pt3}>
                <react_native_1.View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section_1.default title={translate('teachersUnitePage.teachersUnite')} subtitle={translate('teachersUnitePage.joinExpensifyOrg')} isCentralPane subtitleMuted illustration={LottieAnimations_1.default.SaveTheWorld} illustrationBackgroundColor={theme.PAGE_THEMES[SCREENS_1.default.SAVE_THE_WORLD.ROOT].backgroundColor} titleStyles={styles.accountSettingsSectionTitle} childrenStyles={styles.pt5}>
                        <MenuItemList_1.default menuItems={menuItems} shouldUseSingleExecution/>
                    </Section_1.default>
                </react_native_1.View>
            </ScrollView_1.default>
        </ScreenWrapper_1.default>);
}
SaveTheWorldPage.displayName = 'SettingSecurityPage';
exports.default = SaveTheWorldPage;
