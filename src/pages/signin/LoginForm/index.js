"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseLoginForm_1 = require("./BaseLoginForm");
function LoginForm(props, ref) {
    return (<BaseLoginForm_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref}/>);
}
LoginForm.displayName = 'LoginForm';
exports.default = (0, react_1.forwardRef)(LoginForm);
