"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowContextMenuContext = void 0;
exports.showContextMenuForReport = showContextMenuForReport;
var react_1 = require("react");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var ReportUtils_1 = require("@libs/ReportUtils");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var CONST_1 = require("@src/CONST");
var ShowContextMenuContext = (0, react_1.createContext)({
    anchor: null,
    onShowContextMenu: function (callback) { return callback(); },
    report: undefined,
    isReportArchived: false,
    action: undefined,
    transactionThreadReport: undefined,
    checkIfContextMenuActive: function () { },
    isDisabled: true,
    shouldDisplayContextMenu: true,
});
exports.ShowContextMenuContext = ShowContextMenuContext;
ShowContextMenuContext.displayName = 'ShowContextMenuContext';
/**
 * Show the report action context menu.
 *
 * @param event - Press event object
 * @param anchor - Context menu anchor
 * @param reportID - Active Report ID
 * @param action - ReportAction for ContextMenu
 * @param checkIfContextMenuActive Callback to update context menu active state
 * @param isArchivedRoom - Is the report an archived room
 */
function showContextMenuForReport(event, anchor, reportID, action, checkIfContextMenuActive, isArchivedRoom) {
    if (isArchivedRoom === void 0) { isArchivedRoom = false; }
    if (!(0, DeviceCapabilities_1.canUseTouchScreen)()) {
        return;
    }
    (0, ReportActionContextMenu_1.showContextMenu)({
        type: CONST_1.default.CONTEXT_MENU_TYPES.REPORT_ACTION,
        event: event,
        selection: '',
        contextMenuAnchor: anchor,
        report: {
            reportID: reportID,
            originalReportID: reportID ? (0, ReportUtils_1.getOriginalReportID)(reportID, action) : undefined,
            isArchivedRoom: isArchivedRoom,
        },
        reportAction: {
            reportActionID: action === null || action === void 0 ? void 0 : action.reportActionID,
        },
        callbacks: {
            onShow: checkIfContextMenuActive,
            onHide: checkIfContextMenuActive,
        },
    });
}
