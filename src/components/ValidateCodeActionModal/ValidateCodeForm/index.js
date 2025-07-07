"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseValidateCodeForm_1 = require("./BaseValidateCodeForm");
var ValidateCodeForm = (0, react_1.forwardRef)(function (props, ref) { return (<BaseValidateCodeForm_1.default autoComplete="one-time-code" 
// eslint-disable-next-line react/jsx-props-no-spreading
{...props} innerRef={ref}/>); });
exports.default = ValidateCodeForm;
