"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useSidebarOrderedReports_1 = require("@hooks/useSidebarOrderedReports");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SidebarLinks_1 = require("./SidebarLinks");
function SidebarLinksData(_a) {
    var insets = _a.insets;
    var isFocused = (0, native_1.useIsFocused)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { initialValue: true, canBeMissing: true })[0];
    var priorityMode = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIORITY_MODE, { initialValue: CONST_1.default.PRIORITY_MODE.DEFAULT, canBeMissing: true })[0];
    var _b = (0, useSidebarOrderedReports_1.useSidebarOrderedReports)(), orderedReports = _b.orderedReports, currentReportID = _b.currentReportID;
    var currentReportIDRef = (0, react_1.useRef)(currentReportID);
    // eslint-disable-next-line react-compiler/react-compiler
    currentReportIDRef.current = currentReportID;
    var isActiveReport = (0, react_1.useCallback)(function (reportID) { return currentReportIDRef.current === reportID; }, []);
    return (<react_native_1.View accessibilityElementsHidden={!isFocused} collapsable={false} accessibilityLabel={translate('sidebarScreen.listOfChats')} style={[styles.flex1, styles.h100]}>
            <SidebarLinks_1.default 
    // Forwarded props:
    insets={insets} priorityMode={priorityMode !== null && priorityMode !== void 0 ? priorityMode : CONST_1.default.PRIORITY_MODE.DEFAULT} 
    // Data props:
    isActiveReport={isActiveReport} isLoading={isLoadingApp !== null && isLoadingApp !== void 0 ? isLoadingApp : false} optionListItems={orderedReports}/>
        </react_native_1.View>);
}
SidebarLinksData.displayName = 'SidebarLinksData';
exports.default = SidebarLinksData;
