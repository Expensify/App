"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var BaseValidateCodeForm_1 = require("./BaseValidateCodeForm");
var ValidateCodeForm = (0, react_1.forwardRef)(function (props, ref) { return (<BaseValidateCodeForm_1.default autoComplete="sms-otp" 
// eslint-disable-next-line react/jsx-props-no-spreading
{...props} innerRef={ref}/>); });
exports.default = (0, react_native_gesture_handler_1.gestureHandlerRootHOC)(ValidateCodeForm);
