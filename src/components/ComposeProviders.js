"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function ComposeProviders(props) {
    return props.components.reduceRight(function (memo, Component) { return <Component>{memo}</Component>; }, props.children);
}
ComposeProviders.displayName = 'ComposeProviders';
exports.default = ComposeProviders;
