"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_render_html_1 = require("react-native-render-html");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
// We are using the explicit composite architecture for performance gains.
// Configuration for RenderHTML is handled in a top-level component providing
// context to RenderHTMLSource components. See https://git.io/JRcZb
// The provider is available at src/components/HTMLEngineProvider/
function RenderHTML(_a) {
    var html = _a.html;
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    return (<react_native_render_html_1.RenderHTMLSource contentWidth={windowWidth * 0.8} source={{ html: html }}/>);
}
RenderHTML.displayName = 'RenderHTML';
exports.default = RenderHTML;
