"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function ReducedFunctionalityMessage() {
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return <Text_1.default style={[styles.ph5, styles.pb5, styles.textSupporting]}>{translate('subscription.mobileReducedFunctionalityMessage')}</Text_1.default>;
}
ReducedFunctionalityMessage.displayName = 'ReducedFunctionalityMessage';
exports.default = ReducedFunctionalityMessage;
