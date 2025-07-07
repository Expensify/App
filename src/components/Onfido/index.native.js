"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_sdk_1 = require("@onfido/react-native-sdk");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_permissions_1 = require("react-native-permissions");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useLocalize_1 = require("@hooks/useLocalize");
var getPlatform_1 = require("@libs/getPlatform");
var Log_1 = require("@libs/Log");
var CONST_1 = require("@src/CONST");
var AppStateTracker = react_native_1.NativeModules.AppStateTracker;
function Onfido(_a) {
    var sdkToken = _a.sdkToken, onUserExit = _a.onUserExit, onSuccess = _a.onSuccess, onError = _a.onError;
    var translate = (0, useLocalize_1.default)().translate;
    (0, react_1.useEffect)(function () {
        react_native_sdk_1.Onfido.start({
            sdkToken: sdkToken,
            theme: react_native_sdk_1.OnfidoTheme.AUTOMATIC,
            flowSteps: {
                welcome: true,
                captureFace: {
                    type: react_native_sdk_1.OnfidoCaptureType.VIDEO,
                },
                captureDocument: {
                    docType: react_native_sdk_1.OnfidoDocumentType.GENERIC,
                    countryCode: react_native_sdk_1.OnfidoCountryCode.USA,
                },
            },
            disableNFC: true,
        })
            .then(onSuccess)
            .catch(function (error) {
            var _a;
            var errorMessage = (_a = error.message) !== null && _a !== void 0 ? _a : CONST_1.default.ERROR.UNKNOWN_ERROR;
            var errorType = error.type;
            Log_1.default.hmmm('Onfido error on native', { errorType: errorType, errorMessage: errorMessage });
            // If the user cancels the Onfido flow we won't log this error as it's normal. In the React Native SDK the user exiting the flow will trigger this error which we can use as
            // our "user exited the flow" callback. On web, this event has it's own callback passed as a config so we don't need to bother with this there.
            if ([CONST_1.default.ONFIDO.ERROR.USER_CANCELLED, CONST_1.default.ONFIDO.ERROR.USER_TAPPED_BACK, CONST_1.default.ONFIDO.ERROR.USER_EXITED].includes(errorMessage)) {
                if ((0, getPlatform_1.default)() === CONST_1.default.PLATFORM.ANDROID) {
                    AppStateTracker.getApplicationState().then(function (appState) {
                        var wasInBackground = appState.prevState === 'background';
                        onUserExit(!wasInBackground);
                    });
                    return;
                }
                onUserExit(true);
                return;
            }
            if (!!errorMessage && (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.IOS) {
                (0, react_native_permissions_1.checkMultiple)([react_native_permissions_1.PERMISSIONS.IOS.MICROPHONE, react_native_permissions_1.PERMISSIONS.IOS.CAMERA])
                    .then(function (statuses) {
                    var isMicAllowed = statuses[react_native_permissions_1.PERMISSIONS.IOS.MICROPHONE] === react_native_permissions_1.RESULTS.GRANTED;
                    var isCameraAllowed = statuses[react_native_permissions_1.PERMISSIONS.IOS.CAMERA] === react_native_permissions_1.RESULTS.GRANTED;
                    var alertTitle = '';
                    var alertMessage = '';
                    if (!isCameraAllowed) {
                        alertTitle = 'onfidoStep.cameraPermissionsNotGranted';
                        alertMessage = 'onfidoStep.cameraRequestMessage';
                    }
                    else if (!isMicAllowed) {
                        alertTitle = 'onfidoStep.microphonePermissionsNotGranted';
                        alertMessage = 'onfidoStep.microphoneRequestMessage';
                    }
                    if (!!alertTitle && !!alertMessage) {
                        react_native_1.Alert.alert(translate(alertTitle), translate(alertMessage), [
                            {
                                text: translate('common.cancel'),
                                onPress: function () { return onUserExit(); },
                            },
                            {
                                text: translate('common.settings'),
                                onPress: function () {
                                    onUserExit();
                                    react_native_1.Linking.openSettings();
                                },
                            },
                        ], { cancelable: false });
                        return;
                    }
                    onError(errorMessage);
                })
                    .catch(function () {
                    onError(errorMessage);
                });
            }
            else {
                onError(errorMessage);
            }
        });
        // Onfido should be initialized only once on mount
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    return <FullscreenLoadingIndicator_1.default />;
}
Onfido.displayName = 'Onfido';
exports.default = Onfido;
