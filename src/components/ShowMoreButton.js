"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Button_1 = require("./Button");
var Expensicons = require("./Icon/Expensicons");
var Text_1 = require("./Text");
function ShowMoreButton(_a) {
    var containerStyle = _a.containerStyle, currentCount = _a.currentCount, totalCount = _a.totalCount, onPress = _a.onPress;
    var _b = (0, useLocalize_1.default)(), translate = _b.translate, numberFormat = _b.numberFormat;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var shouldShowCounter = !!(currentCount && totalCount);
    return (<react_native_1.View style={[styles.alignItemsCenter, containerStyle]}>
            {shouldShowCounter && (<Text_1.default style={[styles.mb2, styles.textLabelSupporting]}>
                    {"".concat(translate('common.showing'), " ")}
                    <Text_1.default style={styles.textStrong}>{currentCount}</Text_1.default>
                    {" ".concat(translate('common.of'), " ")}
                    <Text_1.default style={styles.textStrong}>{numberFormat(totalCount)}</Text_1.default>
                </Text_1.default>)}
            <react_native_1.View style={[styles.w100, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <react_native_1.View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.mr0]}/>
                <Button_1.default style={styles.mh0} small shouldShowRightIcon iconFill={theme.icon} iconRight={Expensicons.DownArrow} text={translate('common.showMore')} accessibilityLabel={translate('common.showMore')} onPress={onPress}/>
                <react_native_1.View style={[styles.shortTermsHorizontalRule, styles.flex1, styles.ml0]}/>
            </react_native_1.View>
        </react_native_1.View>);
}
ShowMoreButton.displayName = 'ShowMoreButton';
exports.default = ShowMoreButton;
