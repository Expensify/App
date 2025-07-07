"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
function HighResolutionInfo(_a) {
    var isUploaded = _a.isUploaded;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var stylesUtils = (0, useStyleUtils_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.justifyContentCenter, stylesUtils.getHighResolutionInfoWrapperStyle(isUploaded)]}>
            <Icon_1.default src={Expensicons.Info} height={variables_1.default.iconSizeExtraSmall} width={variables_1.default.iconSizeExtraSmall} fill={theme.icon} additionalStyles={styles.p1}/>
            <Text_1.default style={[styles.textLabelSupporting]}>{isUploaded ? translate('attachmentPicker.attachmentImageResized') : translate('attachmentPicker.attachmentImageTooLarge')}</Text_1.default>
        </react_native_1.View>);
}
exports.default = HighResolutionInfo;
