"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_onyx_1 = require("react-native-onyx");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
/**
 * Sets the selected tab for a given tab ID
 */
function setSelectedTab(id, index) {
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.SELECTED_TAB).concat(id), index);
}
exports.default = {
    setSelectedTab: setSelectedTab,
};
