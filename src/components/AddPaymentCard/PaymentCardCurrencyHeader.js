"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function PaymentCardCurrencyHeader(_a) {
    var isSectionList = _a.isSectionList;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={[isSectionList && styles.mh5]}>
            <Text_1.default style={[styles.mt3, isSectionList && styles.mb5]}>
                {"".concat(translate('billingCurrency.note'))}{' '}
                <TextLink_1.default style={styles.link} href={CONST_1.default.PRICING}>{"".concat(translate('billingCurrency.noteLink'))}</TextLink_1.default>{' '}
                {"".concat(translate('billingCurrency.noteDetails'))}
            </Text_1.default>
        </react_native_1.View>);
}
PaymentCardCurrencyHeader.displayName = 'PaymentCardCurrencyHeader';
exports.default = PaymentCardCurrencyHeader;
