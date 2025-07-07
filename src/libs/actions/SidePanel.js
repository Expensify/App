"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Open the side panel
 *
 * @param shouldOpenOnNarrowScreen - Whether to open the side panel on narrow screen
 */
function openSidePanel(shouldOpenOnNarrowScreen) {
    var optimisticData = [
        {
            key: ONYXKEYS_1.default.NVP_SIDE_PANEL,
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            value: shouldOpenOnNarrowScreen ? { open: true, openNarrowScreen: true } : { open: true },
        },
    ];
    var params = { isNarrowScreen: shouldOpenOnNarrowScreen };
    API.write(types_1.WRITE_COMMANDS.OPEN_SIDE_PANEL, params, { optimisticData: optimisticData });
}
/**
 * Close the side panel
 *
 * @param shouldCloseOnNarrowScreen - Whether to close the side panel on narrow screen
 */
function closeSidePanel(shouldCloseOnNarrowScreen) {
    var optimisticData = [
        {
            key: ONYXKEYS_1.default.NVP_SIDE_PANEL,
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            value: shouldCloseOnNarrowScreen ? { openNarrowScreen: false } : { open: false },
        },
    ];
    var params = { isNarrowScreen: shouldCloseOnNarrowScreen };
    API.write(types_1.WRITE_COMMANDS.CLOSE_SIDE_PANEL, params, { optimisticData: optimisticData });
}
exports.default = { openSidePanel: openSidePanel, closeSidePanel: closeSidePanel };
