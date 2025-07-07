"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
function PDFThumbnailError() {
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    return (<react_native_1.View style={[styles.justifyContentCenter, styles.pdfErrorPlaceholder, styles.alignItemsCenter]}>
            <Icon_1.default src={Expensicons.ReceiptSlash} width={variables_1.default.receiptPlaceholderIconWidth} height={variables_1.default.receiptPlaceholderIconHeight} fill={theme.icon}/>
        </react_native_1.View>);
}
exports.default = PDFThumbnailError;
