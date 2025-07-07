"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
function PDFInfoMessage(_a) {
    var onShowForm = _a.onShowForm;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={styles.alignItemsCenter}>
            <Icon_1.default fill={theme.icon} src={Expensicons.EyeDisabled} width={variables_1.default.iconSizeSuperLarge} height={variables_1.default.iconSizeSuperLarge}/>
            <Text_1.default style={[styles.textHeadline, styles.mb3, styles.mt3]}>{translate('attachmentView.pdfPasswordForm.title')}</Text_1.default>
            <Text_1.default>{translate('attachmentView.pdfPasswordForm.infoText')}</Text_1.default>
            <Text_1.default>
                {translate('attachmentView.pdfPasswordForm.beforeLinkText')}
                <TextLink_1.default onPress={onShowForm}>{" ".concat(translate('attachmentView.pdfPasswordForm.linkText'), " ")}</TextLink_1.default>
                {translate('attachmentView.pdfPasswordForm.afterLinkText')}
            </Text_1.default>
        </react_native_1.View>);
}
PDFInfoMessage.displayName = 'PDFInfoMessage';
exports.default = PDFInfoMessage;
