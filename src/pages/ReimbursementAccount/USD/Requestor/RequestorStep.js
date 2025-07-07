"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var PersonalInfo_1 = require("./PersonalInfo/PersonalInfo");
var VerifyIdentity_1 = require("./VerifyIdentity/VerifyIdentity");
function RequestorStep(_a, ref) {
    var shouldShowOnfido = _a.shouldShowOnfido, onBackButtonPress = _a.onBackButtonPress;
    if (shouldShowOnfido) {
        return <VerifyIdentity_1.default onBackButtonPress={onBackButtonPress}/>;
    }
    return (<PersonalInfo_1.default ref={ref} onBackButtonPress={onBackButtonPress}/>);
}
RequestorStep.displayName = 'RequestorStep';
exports.default = (0, react_1.forwardRef)(RequestorStep);
