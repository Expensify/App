"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseKYCWall_1 = require("./BaseKYCWall");
function KYCWall(props) {
    return (<BaseKYCWall_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} shouldListenForResize/>);
}
KYCWall.displayName = 'KYCWall';
exports.default = KYCWall;
