"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ControlSelection_1 = require("@libs/ControlSelection");
var DeviceCapabilities = require("@libs/DeviceCapabilities");
var BaseAnchorForCommentsOnly_1 = require("./BaseAnchorForCommentsOnly");
function AnchorForCommentsOnly(props) {
    return (<BaseAnchorForCommentsOnly_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} onPressIn={function () { return DeviceCapabilities.canUseTouchScreen() && ControlSelection_1.default.block(); }} onPressOut={function () { return ControlSelection_1.default.unblock(); }}/>);
}
AnchorForCommentsOnly.displayName = 'AnchorForCommentsOnly';
exports.default = AnchorForCommentsOnly;
