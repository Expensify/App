"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BaseSelectionList_1 = require("./BaseSelectionList");
function SelectionList(props, ref) {
    return (<BaseSelectionList_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref} onScrollBeginDrag={function () { return react_native_1.Keyboard.dismiss(); }}/>);
}
SelectionList.displayName = 'SelectionList';
exports.default = (0, react_1.forwardRef)(SelectionList);
