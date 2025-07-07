"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var useLocalize_1 = require("@hooks/useLocalize");
var CONST_1 = require("@src/CONST");
function SaveWithExpensifyButton() {
    var translate = (0, useLocalize_1.default)().translate;
    var onLinkPress = function () {
        react_native_1.Linking.openURL(CONST_1.default.SAVE_WITH_EXPENSIFY_URL);
    };
    return (<Button_1.default small text={translate('subscription.yourPlan.saveWithExpensifyButton')} onPress={onLinkPress}/>);
}
SaveWithExpensifyButton.displayName = 'SaveWithExpensifyButton';
exports.default = SaveWithExpensifyButton;
