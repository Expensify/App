"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var BaseLocationErrorMessage_1 = require("./BaseLocationErrorMessage");
/** Opens app level settings from the native system settings  */
var openAppSettings = function () {
    react_native_1.Linking.openSettings();
};
function LocationErrorMessage(props) {
    return (<BaseLocationErrorMessage_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} onAllowLocationLinkPress={openAppSettings}/>);
}
LocationErrorMessage.displayName = 'LocationErrorMessage';
exports.default = LocationErrorMessage;
