"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseSectionList_1 = require("./BaseSectionList");
function SectionList(props, ref) {
    return (<BaseSectionList_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref}/>);
}
SectionList.displayName = 'SectionList';
exports.default = (0, react_1.forwardRef)(SectionList);
