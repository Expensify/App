"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseValidateCodeForm_1 = require("./BaseValidateCodeForm");
function ValidateCodeForm(props, ref) {
    return (<BaseValidateCodeForm_1.default autoComplete="one-time-code" ref={ref} 
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    {...props}/>);
}
ValidateCodeForm.displayName = 'ValidateCodeForm';
exports.default = (0, react_1.forwardRef)(ValidateCodeForm);
