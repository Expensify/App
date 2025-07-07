"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var PressableWithoutFeedback_1 = require("./Pressable/PressableWithoutFeedback");
var Text_1 = require("./Text");
var Tooltip_1 = require("./Tooltip");
function CurrencySymbolButton(_a) {
    var onCurrencyButtonPress = _a.onCurrencyButtonPress, currencySymbol = _a.currencySymbol, _b = _a.isCurrencyPressable, isCurrencyPressable = _b === void 0 ? true : _b;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    return isCurrencyPressable ? (<Tooltip_1.default text={translate('common.selectCurrency')}>
            <PressableWithoutFeedback_1.default onPress={onCurrencyButtonPress} accessibilityLabel={translate('common.selectCurrency')} role={CONST_1.default.ROLE.BUTTON} style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                <Icon_1.default small src={Expensicons.DownArrow} fill={theme.icon}/>
                <Text_1.default style={styles.iouAmountText}>{currencySymbol}</Text_1.default>
            </PressableWithoutFeedback_1.default>
        </Tooltip_1.default>) : (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
            <Text_1.default style={styles.iouAmountText}>{currencySymbol}</Text_1.default>
        </react_native_1.View>);
}
CurrencySymbolButton.displayName = 'CurrencySymbolButton';
exports.default = CurrencySymbolButton;
