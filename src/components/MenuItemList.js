"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useSingleExecution_1 = require("@hooks/useSingleExecution");
var mergeRefs_1 = require("@libs/mergeRefs");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var CONST_1 = require("@src/CONST");
var MenuItem_1 = require("./MenuItem");
var OfflineWithFeedback_1 = require("./OfflineWithFeedback");
function MenuItemList(_a) {
    var _b = _a.menuItems, menuItems = _b === void 0 ? [] : _b, _c = _a.shouldUseSingleExecution, shouldUseSingleExecution = _c === void 0 ? false : _c, _d = _a.wrapperStyle, wrapperStyle = _d === void 0 ? {} : _d, _e = _a.icon, icon = _e === void 0 ? undefined : _e, _f = _a.iconWidth, iconWidth = _f === void 0 ? undefined : _f, _g = _a.iconHeight, iconHeight = _g === void 0 ? undefined : _g;
    var popoverAnchor = (0, react_1.useRef)(null);
    var _h = (0, useSingleExecution_1.default)(), isExecuting = _h.isExecuting, singleExecution = _h.singleExecution;
    /**
     * Handle the secondary interaction for a menu item.
     *
     * @param link the menu item link or function to get the link
     * @param event the interaction event
     */
    var secondaryInteraction = function (link, event) {
        if (typeof link === 'function') {
            link().then(function (url) {
                return (0, ReportActionContextMenu_1.showContextMenu)({
                    type: CONST_1.default.CONTEXT_MENU_TYPES.LINK,
                    event: event,
                    selection: url,
                    contextMenuAnchor: popoverAnchor.current,
                });
            });
        }
        else if (link) {
            (0, ReportActionContextMenu_1.showContextMenu)({
                type: CONST_1.default.CONTEXT_MENU_TYPES.LINK,
                event: event,
                selection: link,
                contextMenuAnchor: popoverAnchor.current,
            });
        }
    };
    return (
    // ref is accessed for MenuItem's ref initialization
    // eslint-disable-next-line react-compiler/react-compiler
    menuItems.map(function (_a) {
        var key = _a.key, ref = _a.ref, menuItemProps = __rest(_a, ["key", "ref"]);
        return (<OfflineWithFeedback_1.default key={key !== null && key !== void 0 ? key : menuItemProps.title} pendingAction={menuItemProps.pendingAction} onClose={menuItemProps.onPendingActionDismiss} errors={menuItemProps.error} shouldForceOpacity={menuItemProps.shouldForceOpacity}>
                <MenuItem_1.default key={key !== null && key !== void 0 ? key : menuItemProps.title} wrapperStyle={wrapperStyle} onSecondaryInteraction={menuItemProps.link !== undefined ? function (e) { return secondaryInteraction(menuItemProps.link, e); } : undefined} ref={(0, mergeRefs_1.default)(ref, popoverAnchor)} shouldBlockSelection={!!menuItemProps.link} icon={icon} iconWidth={iconWidth} iconHeight={iconHeight} 
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...menuItemProps} disabled={!!menuItemProps.disabled || isExecuting} onPress={shouldUseSingleExecution ? singleExecution(menuItemProps.onPress) : menuItemProps.onPress}/>
            </OfflineWithFeedback_1.default>);
    }));
}
MenuItemList.displayName = 'MenuItemList';
exports.default = MenuItemList;
