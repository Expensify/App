"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function RedDotCardSection(_a) {
    var title = _a.title, description = _a.description;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.p5, styles.flexRow, styles.alignItemsStart]}>
            <react_native_1.View style={styles.offlineFeedback.errorDot}>
                <Icon_1.default src={Expensicons.DotIndicator} fill={theme.danger}/>
            </react_native_1.View>
            <react_native_1.View style={[styles.flexRow, styles.flexShrink1]}>
                <react_native_1.View style={styles.flexShrink1}>
                    <Text_1.default style={[styles.walletRedDotSectionTitle, styles.mb1]}>{title}</Text_1.default>
                    <Text_1.default style={styles.walletRedDotSectionText}>{description}</Text_1.default>
                </react_native_1.View>
            </react_native_1.View>
        </react_native_1.View>);
}
RedDotCardSection.displayName = 'RedDotCardSection';
exports.default = RedDotCardSection;
