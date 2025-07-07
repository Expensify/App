"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseSectionList_1 = require("./BaseSectionList");
function SectionListWithRef(props, ref) {
    var _a;
    return (<BaseSectionList_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref} 
    // For Android we want to use removeClippedSubviews since it helps manage memory consumption. When we
    // run out memory images stop loading and appear as grey circles
    // eslint-disable-next-line react/jsx-props-no-multi-spaces
    removeClippedSubviews={(_a = props.removeClippedSubviews) !== null && _a !== void 0 ? _a : true}/>);
}
SectionListWithRef.displayName = 'SectionListWithRef';
exports.default = (0, react_1.forwardRef)(SectionListWithRef);
