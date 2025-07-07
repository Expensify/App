"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseInvertedFlatList_1 = require("./BaseInvertedFlatList");
var CellRendererComponent_1 = require("./CellRendererComponent");
function BaseInvertedFlatListWithRef(props, ref) {
    return (<BaseInvertedFlatList_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref} CellRendererComponent={CellRendererComponent_1.default} 
    /**
     * To achieve absolute positioning and handle overflows for list items, the property must be disabled
     * for Android native builds.
     * Source: https://reactnative.dev/docs/0.71/optimizing-flatlist-configuration#removeclippedsubviews
     */
    removeClippedSubviews={false}/>);
}
BaseInvertedFlatListWithRef.displayName = 'BaseInvertedFlatListWithRef';
exports.default = (0, react_1.forwardRef)(BaseInvertedFlatListWithRef);
