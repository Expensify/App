"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var linkingConfig_1 = require("@libs/Navigation/linkingConfig");
function syncBrowserHistory(state) {
    // We reset the URL as the browser sets it in a way that doesn't match the navigation state
    // eslint-disable-next-line no-restricted-globals
    history.replaceState({}, '', (0, native_1.getPathFromState)(state, linkingConfig_1.linkingConfig.config));
}
exports.default = syncBrowserHistory;
