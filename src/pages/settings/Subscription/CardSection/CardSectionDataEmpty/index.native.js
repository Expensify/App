"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function CardSectionDataEmpty() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
            <Icon_1.default src={Expensicons.CreditCardExclamation} additionalStyles={styles.subscriptionCardIcon} fill={theme.icon} medium/>
            <Text_1.default style={[styles.mutedNormalTextLabel, styles.textStrong]}>{translate('subscription.cardSection.cardNotFound')}</Text_1.default>
        </react_native_1.View>);
}
CardSectionDataEmpty.displayName = 'CardSectionDataEmpty';
exports.default = CardSectionDataEmpty;
