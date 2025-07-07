"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var NavigationTabBar_1 = require("@components/Navigation/NavigationTabBar");
var NAVIGATION_TABS_1 = require("@components/Navigation/NavigationTabBar/NAVIGATION_TABS");
var TopBar_1 = require("@components/Navigation/TopBar");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser_1 = require("@libs/Browser");
var Performance_1 = require("@libs/Performance");
var CONST_1 = require("@src/CONST");
var SidebarLinksData_1 = require("./SidebarLinksData");
function BaseSidebarScreen() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var shouldDisplayLHB = !shouldUseNarrowLayout;
    (0, react_1.useEffect)(function () {
        Performance_1.default.markStart(CONST_1.default.TIMING.SIDEBAR_LOADED);
    }, []);
    return (<ScreenWrapper_1.default shouldEnableKeyboardAvoidingView={false} style={[styles.sidebar, (0, Browser_1.isMobile)() ? styles.userSelectNone : {}]} testID={BaseSidebarScreen.displayName} bottomContent={!shouldDisplayLHB && <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.HOME}/>}>
            {function (_a) {
            var insets = _a.insets;
            return (<>
                    <TopBar_1.default breadcrumbLabel={translate('common.inbox')} shouldDisplaySearch={shouldUseNarrowLayout} shouldDisplayHelpButton={shouldUseNarrowLayout}/>
                    <react_native_1.View style={[styles.flex1]}>
                        <SidebarLinksData_1.default insets={insets}/>
                    </react_native_1.View>
                    {shouldDisplayLHB && <NavigationTabBar_1.default selectedTab={NAVIGATION_TABS_1.default.HOME}/>}
                </>);
        }}
        </ScreenWrapper_1.default>);
}
BaseSidebarScreen.displayName = 'BaseSidebarScreen';
exports.default = BaseSidebarScreen;
