"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var DeviceCapabilities = require("@libs/DeviceCapabilities");
var BaseHTMLEngineProvider_1 = require("./BaseHTMLEngineProvider");
function HTMLEngineProvider(_a) {
    var children = _a.children;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return <BaseHTMLEngineProvider_1.default textSelectable={!DeviceCapabilities.canUseTouchScreen() || !shouldUseNarrowLayout}>{children}</BaseHTMLEngineProvider_1.default>;
}
HTMLEngineProvider.displayName = 'HTMLEngineProvider';
exports.default = HTMLEngineProvider;
