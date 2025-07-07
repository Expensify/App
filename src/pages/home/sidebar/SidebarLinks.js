"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var LHNOptionsList_1 = require("@components/LHNOptionsList/LHNOptionsList");
var OptionsListSkeletonView_1 = require("@components/OptionsListSkeletonView");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var App_1 = require("@libs/actions/App");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportActionContextMenu = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function SidebarLinks(_a) {
    var insets = _a.insets, optionListItems = _a.optionListItems, isLoading = _a.isLoading, _b = _a.priorityMode, priorityMode = _b === void 0 ? CONST_1.default.PRIORITY_MODE.DEFAULT : _b, isActiveReport = _a.isActiveReport;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    (0, react_1.useEffect)(function () {
        (0, App_1.confirmReadyToOpenApp)();
    }, []);
    (0, react_1.useEffect)(function () {
        ReportActionContextMenu.hideContextMenu(false);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    /**
     * Show Report page with selected report id
     */
    var showReportPage = (0, react_1.useCallback)(function (option) {
        // Prevent opening Report page when clicking LHN row quickly after clicking FAB icon
        // or when clicking the active LHN row on large screens
        // or when continuously clicking different LHNs, only apply to small screen
        // since getTopmostReportId always returns on other devices
        var reportActionID = Navigation_1.default.getTopmostReportActionId();
        // Prevent opening a new Report page if the user quickly taps on another conversation
        // before the first one is displayed.
        var shouldBlockReportNavigation = Navigation_1.default.getActiveRoute() !== '/home' && shouldUseNarrowLayout;
        if ((option.reportID === Navigation_1.default.getTopmostReportId() && !reportActionID) ||
            (shouldUseNarrowLayout && isActiveReport(option.reportID) && !reportActionID) ||
            shouldBlockReportNavigation) {
            return;
        }
        Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(option.reportID));
    }, [shouldUseNarrowLayout, isActiveReport]);
    var viewMode = priorityMode === CONST_1.default.PRIORITY_MODE.GSD ? CONST_1.default.OPTION_MODE.COMPACT : CONST_1.default.OPTION_MODE.DEFAULT;
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    var contentContainerStyles = (0, react_1.useMemo)(function () { return react_native_1.StyleSheet.flatten([styles.pt2, { paddingBottom: StyleUtils.getSafeAreaMargins(insets).marginBottom }]); }, [insets]);
    return (<react_native_1.View style={[styles.flex1, styles.h100]}>
            <react_native_1.View style={[styles.pRelative, styles.flex1]}>
                <LHNOptionsList_1.default style={styles.flex1} contentContainerStyles={contentContainerStyles} data={optionListItems} onSelectRow={showReportPage} shouldDisableFocusOptions={shouldUseNarrowLayout} optionMode={viewMode} onFirstItemRendered={App_1.setSidebarLoaded}/>
                {!!isLoading && (optionListItems === null || optionListItems === void 0 ? void 0 : optionListItems.length) === 0 && (<react_native_1.View style={[react_native_1.StyleSheet.absoluteFillObject, styles.appBG, styles.mt3]}>
                        <OptionsListSkeletonView_1.default shouldAnimate/>
                    </react_native_1.View>)}
            </react_native_1.View>
        </react_native_1.View>);
}
SidebarLinks.displayName = 'SidebarLinks';
exports.default = (0, react_1.memo)(SidebarLinks);
