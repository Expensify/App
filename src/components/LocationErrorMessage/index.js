"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var CONST_1 = require("@src/CONST");
var BaseLocationErrorMessage_1 = require("./BaseLocationErrorMessage");
/** Opens expensify help site in a new browser tab */
var navigateToExpensifyHelpSite = function () {
    react_native_1.Linking.openURL(CONST_1.default.NEWHELP_URL);
};
function LocationErrorMessage(props) {
    return (<BaseLocationErrorMessage_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} onAllowLocationLinkPress={navigateToExpensifyHelpSite}/>);
}
LocationErrorMessage.displayName = 'LocationErrorMessage';
exports.default = LocationErrorMessage;
