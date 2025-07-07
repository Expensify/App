"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
function CellRendererComponent(props) {
    return (<react_native_1.View 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} style={[
            props.style,
            /**
             * To achieve absolute positioning and handle overflows for list items,
             * it is necessary to assign zIndex values. In the case of inverted lists,
             * the lower list items will have higher zIndex values compared to the upper
             * list items. Consequently, lower list items can overflow the upper list items.
             * See: https://github.com/Expensify/App/issues/20451
             */
            { zIndex: -props.index, position: 'relative' },
        ]}/>);
}
CellRendererComponent.displayName = 'CellRendererComponent';
exports.default = CellRendererComponent;
