"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var Text_1 = require("@components/Text");
var Tooltip_1 = require("@components/Tooltip");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function DefaultAttachmentView(_a) {
    var _b = _a.fileName, fileName = _b === void 0 ? '' : _b, _c = _a.shouldShowLoadingSpinnerIcon, shouldShowLoadingSpinnerIcon = _c === void 0 ? false : _c, shouldShowDownloadIcon = _a.shouldShowDownloadIcon, containerStyles = _a.containerStyles, icon = _a.icon, isUploading = _a.isUploading, isDeleted = _a.isDeleted;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    return (<react_native_1.View style={[styles.defaultAttachmentView, containerStyles]}>
            <react_native_1.View style={styles.mr2}>
                <Icon_1.default fill={theme.icon} src={icon !== null && icon !== void 0 ? icon : Expensicons.Paperclip}/>
            </react_native_1.View>

            <Text_1.default style={[styles.textStrong, styles.flexShrink1, styles.breakAll, styles.flexWrap, styles.mw100, isDeleted && styles.lineThrough]}>{fileName}</Text_1.default>
            {!shouldShowLoadingSpinnerIcon && !!shouldShowDownloadIcon && (<Tooltip_1.default text={translate('common.download')}>
                    <react_native_1.View style={styles.ml2}>
                        <Icon_1.default fill={theme.icon} src={Expensicons.Download}/>
                    </react_native_1.View>
                </Tooltip_1.default>)}
            {shouldShowLoadingSpinnerIcon && (<react_native_1.View style={styles.ml2}>
                    <Tooltip_1.default text={isUploading ? translate('common.uploading') : translate('common.downloading')}>
                        <react_native_1.ActivityIndicator size="small" color={theme.textSupporting} testID="attachment-loading-spinner"/>
                    </Tooltip_1.default>
                </react_native_1.View>)}
        </react_native_1.View>);
}
DefaultAttachmentView.displayName = 'DefaultAttachmentView';
exports.default = DefaultAttachmentView;
