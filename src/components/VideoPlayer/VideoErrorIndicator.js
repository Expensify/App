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
var variables_1 = require("@styles/variables");
function VideoErrorIndicator(_a) {
    var _b = _a.isPreview, isPreview = _b === void 0 ? false : _b;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={[styles.flexColumn, styles.alignItemsCenter, styles.justifyContentCenter, styles.pAbsolute, styles.h100, styles.w100]}>
            <Icon_1.default fill={isPreview ? theme.border : theme.icon} src={Expensicons.VideoSlash} width={variables_1.default.eReceiptEmptyIconWidth} height={variables_1.default.eReceiptEmptyIconWidth}/>
            {!isPreview && (<react_native_1.View>
                    <Text_1.default style={[styles.notFoundTextHeader, styles.ph11]}>{translate('common.errorOccurredWhileTryingToPlayVideo')}</Text_1.default>
                </react_native_1.View>)}
        </react_native_1.View>);
}
VideoErrorIndicator.displayName = 'VideoErrorIndicator';
exports.default = VideoErrorIndicator;
