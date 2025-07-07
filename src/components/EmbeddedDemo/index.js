"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function EmbeddedDemo(_a) {
    var url = _a.url, iframeTitle = _a.iframeTitle, iframeProps = _a.iframeProps;
    var styles = (0, useThemeStyles_1.default)();
    return (<iframe title={iframeTitle} src={url} style={styles.embeddedDemoIframe} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...iframeProps}/>);
}
EmbeddedDemo.displayName = 'EmbeddedDemo';
exports.default = EmbeddedDemo;
