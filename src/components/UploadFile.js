"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var CONST_1 = require("@src/CONST");
var AttachmentPicker_1 = require("./AttachmentPicker");
var Button_1 = require("./Button");
var DotIndicatorMessage_1 = require("./DotIndicatorMessage");
var Icon_1 = require("./Icon");
var Expensicons_1 = require("./Icon/Expensicons");
var Pressable_1 = require("./Pressable");
var TextWithMiddleEllipsis_1 = require("./TextWithMiddleEllipsis");
function UploadFile(_a) {
    var buttonText = _a.buttonText, uploadedFiles = _a.uploadedFiles, onUpload = _a.onUpload, onRemove = _a.onRemove, acceptedFileTypes = _a.acceptedFileTypes, style = _a.style, _b = _a.errorText, errorText = _b === void 0 ? '' : _b, setError = _a.setError, _c = _a.onInputChange, onInputChange = _c === void 0 ? function () { } : _c, _d = _a.totalFilesSizeLimit, totalFilesSizeLimit = _d === void 0 ? 0 : _d, _e = _a.fileLimit, fileLimit = _e === void 0 ? 0 : _e;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var handleFileUpload = function (files) {
        var resultedFiles = __spreadArray(__spreadArray([], uploadedFiles, true), files, true);
        var totalSize = resultedFiles.reduce(function (sum, file) { var _a; return sum + ((_a = file.size) !== null && _a !== void 0 ? _a : 0); }, 0);
        if (totalFilesSizeLimit) {
            if (totalSize > totalFilesSizeLimit) {
                setError(translate('attachmentPicker.sizeExceededWithValue', { maxUploadSizeInMB: totalFilesSizeLimit / (1024 * 1024) }));
                return;
            }
        }
        if (fileLimit && resultedFiles.length > 0 && resultedFiles.length > fileLimit) {
            setError(translate('attachmentPicker.tooManyFiles', { fileLimit: fileLimit }));
            return;
        }
        if (acceptedFileTypes.length > 0) {
            var filesExtensions_1 = files.map(function (file) { var _a; return (0, FileUtils_1.splitExtensionFromFileName)((_a = file === null || file === void 0 ? void 0 : file.name) !== null && _a !== void 0 ? _a : '').fileExtension.toLowerCase(); });
            if (acceptedFileTypes.every(function (element) { return !filesExtensions_1.includes(element); })) {
                setError(translate('attachmentPicker.notAllowedExtension'));
                return;
            }
        }
        var uploadedFilesNames = uploadedFiles.map(function (uploadedFile) { return uploadedFile.name; });
        var newFilesToUpload = files.filter(function (file) { return !uploadedFilesNames.includes(file.name); });
        onInputChange(newFilesToUpload);
        onUpload(newFilesToUpload);
        setError('');
    };
    return (<react_native_1.View style={[styles.alignItemsStart, style]}>
            <AttachmentPicker_1.default acceptedFileTypes={acceptedFileTypes} fileLimit={fileLimit} allowMultiple={fileLimit > 1}>
                {function (_a) {
            var openPicker = _a.openPicker;
            return (<Button_1.default medium text={buttonText} accessibilityLabel={buttonText} onPress={function () {
                    openPicker({
                        onPicked: handleFileUpload,
                    });
                }}/>);
        }}
            </AttachmentPicker_1.default>
            {uploadedFiles.map(function (file) {
            var _a;
            return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.border, styles.p5, styles.mt3, styles.mw100]} key={file.name}>
                    <Icon_1.default src={Expensicons_1.Paperclip} fill={theme.icon} medium/>
                    <TextWithMiddleEllipsis_1.default text={(_a = file.name) !== null && _a !== void 0 ? _a : ''} style={[styles.ml2, styles.mr2, styles.w100, styles.flexShrink1]} textStyle={styles.textBold}/>
                    <Pressable_1.PressableWithFeedback onPress={function () { var _a; return onRemove((_a = file === null || file === void 0 ? void 0 : file.name) !== null && _a !== void 0 ? _a : ''); }} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={translate('common.remove')}>
                        <Icon_1.default src={Expensicons_1.Close} fill={theme.icon} medium/>
                    </Pressable_1.PressableWithFeedback>
                </react_native_1.View>);
        })}
            {errorText !== '' && (<DotIndicatorMessage_1.default style={[styles.formError, styles.mt3]} type="error" messages={{ errorText: errorText }}/>)}
        </react_native_1.View>);
}
UploadFile.displayName = 'UploadFile';
exports.default = UploadFile;
