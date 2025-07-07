"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var implementation_1 = require("./implementation");
function ComposerE2E(props, ref) {
    return (<implementation_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref} 
    // In the app we only focus when actually pressing the input, for the e2e tests calling .focus() must open the keyboard
    showSoftInputOnFocus/>);
}
exports.default = react_1.default.forwardRef(ComposerE2E);
