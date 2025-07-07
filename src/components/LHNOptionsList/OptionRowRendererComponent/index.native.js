"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var flash_list_1 = require("@shopify/flash-list");
var react_1 = require("react");
function OptionRowRendererComponent(props, ref) {
    return (<flash_list_1.CellContainer 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} ref={ref} style={[props.style, { zIndex: -props.index }]}/>);
}
OptionRowRendererComponent.displayName = 'OptionRowRendererComponent';
exports.default = (0, react_1.forwardRef)(OptionRowRendererComponent);
