"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function WhyLink(_a) {
    var containerStyles = _a.containerStyles;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, containerStyles]}>
            <Icon_1.default src={Expensicons.QuestionMark} width={12} height={12} fill={theme.icon}/>
            <react_native_1.View style={[styles.ml2, styles.dFlex, styles.flexRow]}>
                <TextLink_1.default style={[styles.textMicro]} href={CONST_1.default.HELP_LINK_URL}>
                    {translate('common.whyDoWeAskForThis')}
                </TextLink_1.default>
            </react_native_1.View>
        </react_native_1.View>);
}
WhyLink.displayName = 'WhyLink';
exports.default = WhyLink;
