"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showErrorAlert = showErrorAlert;
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TabNavigatorSkeleton_1 = require("@components/Skeletons/TabNavigatorSkeleton");
var TabSelector_1 = require("@components/TabSelector/TabSelector");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Share_1 = require("@libs/actions/Share");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var FileUtils_1 = require("@libs/fileDownload/FileUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OnyxTabNavigator_1 = require("@libs/Navigation/OnyxTabNavigator");
var ShareActionHandlerModule_1 = require("@libs/ShareActionHandlerModule");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var getFileSize_1 = require("./getFileSize");
var ShareTab_1 = require("./ShareTab");
var SubmitTab_1 = require("./SubmitTab");
function showErrorAlert(title, message) {
    react_native_1.Alert.alert(title, message, [
        {
            onPress: function () {
                Navigation_1.default.navigate(ROUTES_1.default.HOME);
            },
        },
    ]);
    Navigation_1.default.navigate(ROUTES_1.default.HOME);
}
function ShareRootPage() {
    var appState = (0, react_1.useRef)(react_native_1.AppState.currentState);
    var _a = (0, react_1.useState)(false), isFileReady = _a[0], setIsFileReady = _a[1];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, react_1.useState)(false), isFileScannable = _b[0], setIsFileScannable = _b[1];
    var receiptFileFormats = Object.values(CONST_1.default.RECEIPT_ALLOWED_FILE_TYPES);
    var shareFileMimeTypes = Object.values(CONST_1.default.SHARE_FILE_MIMETYPE);
    var _c = (0, react_1.useState)(undefined), errorTitle = _c[0], setErrorTitle = _c[1];
    var _d = (0, react_1.useState)(undefined), errorMessage = _d[0], setErrorMessage = _d[1];
    (0, react_1.useEffect)(function () {
        if (!errorTitle || !errorMessage) {
            return;
        }
        showErrorAlert(errorTitle, errorMessage);
    }, [errorTitle, errorMessage]);
    var handleProcessFiles = (0, react_1.useCallback)(function () {
        ShareActionHandlerModule_1.default.processFiles(function (processedFiles) {
            var tempFile = Array.isArray(processedFiles) ? processedFiles.at(0) : JSON.parse(processedFiles);
            if (errorTitle) {
                return;
            }
            if (!(tempFile === null || tempFile === void 0 ? void 0 : tempFile.mimeType) || !shareFileMimeTypes.includes(tempFile === null || tempFile === void 0 ? void 0 : tempFile.mimeType)) {
                setErrorTitle(translate('attachmentPicker.wrongFileType'));
                setErrorMessage(translate('attachmentPicker.notAllowedExtension'));
                return;
            }
            var isImage = /image\/.*/.test(tempFile === null || tempFile === void 0 ? void 0 : tempFile.mimeType);
            if ((tempFile === null || tempFile === void 0 ? void 0 : tempFile.mimeType) && (tempFile === null || tempFile === void 0 ? void 0 : tempFile.mimeType) !== 'txt' && !isImage) {
                (0, getFileSize_1.default)(tempFile === null || tempFile === void 0 ? void 0 : tempFile.content).then(function (size) {
                    if (size > CONST_1.default.API_ATTACHMENT_VALIDATIONS.MAX_SIZE) {
                        setErrorTitle(translate('attachmentPicker.attachmentTooLarge'));
                        setErrorMessage(translate('attachmentPicker.sizeExceeded'));
                    }
                    if (size < CONST_1.default.API_ATTACHMENT_VALIDATIONS.MIN_SIZE) {
                        setErrorTitle(translate('attachmentPicker.attachmentTooSmall'));
                        setErrorMessage(translate('attachmentPicker.sizeNotMet'));
                    }
                });
            }
            if (isImage) {
                var fileObject = { name: tempFile.id, uri: tempFile === null || tempFile === void 0 ? void 0 : tempFile.content, type: tempFile === null || tempFile === void 0 ? void 0 : tempFile.mimeType };
                (0, FileUtils_1.validateImageForCorruption)(fileObject).catch(function () {
                    setErrorTitle(translate('attachmentPicker.attachmentError'));
                    setErrorMessage(translate('attachmentPicker.errorWhileSelectingCorruptedAttachment'));
                });
            }
            var fileExtension = (0, FileUtils_1.splitExtensionFromFileName)(tempFile === null || tempFile === void 0 ? void 0 : tempFile.content).fileExtension;
            if (tempFile) {
                if (tempFile.mimeType) {
                    if (receiptFileFormats.includes(tempFile.mimeType) && fileExtension) {
                        setIsFileScannable(true);
                    }
                    else {
                        setIsFileScannable(false);
                    }
                    setIsFileReady(true);
                }
                (0, Share_1.addTempShareFile)(tempFile);
            }
        });
    }, [receiptFileFormats, shareFileMimeTypes, translate, errorTitle]);
    (0, react_1.useEffect)(function () {
        var subscription = react_native_1.AppState.addEventListener('change', function (nextAppState) {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                handleProcessFiles();
            }
            appState.current = nextAppState;
        });
        return function () {
            subscription.remove();
        };
    }, [handleProcessFiles]);
    (0, react_1.useEffect)(function () {
        (0, Share_1.clearShareData)();
        handleProcessFiles();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} shouldEnableKeyboardAvoidingView={false} shouldEnableMinHeight={(0, DeviceCapabilities_1.canUseTouchScreen)()} testID={ShareRootPage.displayName}>
            <react_native_1.View style={[styles.flex1]}>
                <HeaderWithBackButton_1.default title={translate('share.shareToExpensify')} shouldShowBackButton onBackButtonPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.HOME); }}/>
                {isFileReady ? (<OnyxTabNavigator_1.default id={CONST_1.default.TAB.SHARE.NAVIGATOR_ID} tabBar={TabSelector_1.default}>
                        <OnyxTabNavigator_1.TopTab.Screen name={CONST_1.default.TAB.SHARE.SHARE}>{function () { return <ShareTab_1.default />; }}</OnyxTabNavigator_1.TopTab.Screen>
                        {isFileScannable && <OnyxTabNavigator_1.TopTab.Screen name={CONST_1.default.TAB.SHARE.SUBMIT}>{function () { return <SubmitTab_1.default />; }}</OnyxTabNavigator_1.TopTab.Screen>}
                    </OnyxTabNavigator_1.default>) : (<TabNavigatorSkeleton_1.default />)}
            </react_native_1.View>
        </ScreenWrapper_1.default>);
}
ShareRootPage.displayName = 'ShareRootPage';
exports.default = ShareRootPage;
