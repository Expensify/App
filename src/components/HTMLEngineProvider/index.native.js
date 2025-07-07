"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseHTMLEngineProvider_1 = require("./BaseHTMLEngineProvider");
function HTMLEngineProvider(_a) {
    var children = _a.children;
    return <BaseHTMLEngineProvider_1.default enableExperimentalBRCollapsing>{children}</BaseHTMLEngineProvider_1.default>;
}
HTMLEngineProvider.displayName = 'HTMLEngineProvider';
exports.default = HTMLEngineProvider;
