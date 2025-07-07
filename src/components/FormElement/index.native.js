"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
function FormElement(props, ref) {
    return (<react_native_1.View ref={ref} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
FormElement.displayName = 'FormElement';
exports.default = (0, react_1.forwardRef)(FormElement);
