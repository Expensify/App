"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_config_1 = require("react-native-config");
var useWDYR = (react_native_config_1.default === null || react_native_config_1.default === void 0 ? void 0 : react_native_config_1.default.USE_WDYR) === 'true';
if (useWDYR) {
    var whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(react_1.default, {
        // Enable tracking in all pure components by default
        trackAllPureComponents: true,
        include: [
        // Uncomment to enable tracking in all components. Must also uncomment /^Screen/ in exclude.
        // /.*/,
        // Uncomment to enable tracking by displayName, e.g.:
        // /^Avatar/,
        // /^ReportActionItem/,
        // /^ReportActionItemSingle/,
        ],
        exclude: [
        // Uncomment to enable tracking in all components
        // /^Screen/
        ],
    });
}
