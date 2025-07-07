"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BasePicker_1 = require("./BasePicker");
function Picker(props, ref) {
    return (<BasePicker_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} key={props.inputID} ref={ref}/>);
}
exports.default = (0, react_1.forwardRef)(Picker);
