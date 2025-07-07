"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BasePicker_1 = require("./BasePicker");
function Picker(props, ref) {
    var additionalPickerEvents = function (onMouseDown, onChange) { return ({
        onMouseDown: onMouseDown,
        onChange: function (e) {
            if (e.target.selectedIndex === undefined) {
                return;
            }
            var index = e.target.selectedIndex;
            var value = e.target.options[index].value;
            onChange(value, index);
        },
    }); };
    return (<BasePicker_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} 
    // Forward the ref to Picker, as we implement imperative methods there
    ref={ref} 
    // On the Web, focusing the inner picker improves the accessibility,
    // but doesn't open the picker (which we don't want), like it does on
    // Native.
    shouldFocusPicker key={props.inputID} additionalPickerEvents={additionalPickerEvents}/>);
}
exports.default = (0, react_1.forwardRef)(Picker);
