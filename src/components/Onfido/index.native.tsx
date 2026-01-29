import {OnfidoCaptureType, OnfidoCountryCode, OnfidoDocumentType, OnfidoNFCOptions, Onfido as OnfidoSDK, OnfidoTheme} from '@onfido/react-native-sdk';
import React, {useEffect} from 'react';
import {Alert, Linking, NativeModules} from 'react-native';
import {checkMultiple, PERMISSIONS, RESULTS} from 'react-native-permissions';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useLocalize from '@hooks/useLocalize';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import saveLastRoute from '@libs/saveLastRoute';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {OnfidoError, OnfidoProps} from './types';

const {AppStateTracker} = NativeModules;

function Onfido({sdkToken, onUserExit, onSuccess, onError}: OnfidoProps) {
    const {translate} = useLocalize();

    useEffect(() => {
        OnfidoSDK.start({
            sdkToken,
            theme: OnfidoTheme.AUTOMATIC,
            // eslint-disable-next-line
            nfcOption: OnfidoNFCOptions.DISABLED,
            flowSteps: {
                welcome: true,
                captureFace: {
                    type: OnfidoCaptureType.VIDEO,
                },
                captureDocument: {
                    docType: OnfidoDocumentType.GENERIC,
                    countryCode: OnfidoCountryCode.USA,
                },
            },
        })
            .then(onSuccess)
            .catch((error: OnfidoError) => {
                const errorMessage: string = error.message ?? CONST.ERROR.UNKNOWN_ERROR;
                const errorType = error.type;

                Log.hmmm('Onfido error on native', {errorType, errorMessage});

                // If the user cancels the Onfido flow we won't log this error as it's normal. In the React Native SDK the user exiting the flow will trigger this error which we can use as
                // our "user exited the flow" callback. On web, this event has it's own callback passed as a config so we don't need to bother with this there.
                if (([CONST.ONFIDO.ERROR.USER_CANCELLED, CONST.ONFIDO.ERROR.USER_TAPPED_BACK, CONST.ONFIDO.ERROR.USER_EXITED] as string[]).includes(errorMessage)) {
                    if (getPlatform() === CONST.PLATFORM.ANDROID) {
                        AppStateTracker.getWasAppRelaunchedFromIcon().then((wasAppRelaunchedFromIcon) => {
                            onUserExit(!wasAppRelaunchedFromIcon);
                        });
                        return;
                    }

                    onUserExit(true);
                    return;
                }

                if (!!errorMessage && getPlatform() === CONST.PLATFORM.IOS) {
                    checkMultiple([PERMISSIONS.IOS.MICROPHONE, PERMISSIONS.IOS.CAMERA])
                        .then((statuses) => {
                            const isMicAllowed = statuses[PERMISSIONS.IOS.MICROPHONE] === RESULTS.GRANTED;
                            const isCameraAllowed = statuses[PERMISSIONS.IOS.CAMERA] === RESULTS.GRANTED;
                            let alertTitle: TranslationPaths | '' = '';
                            let alertMessage: TranslationPaths | '' = '';
                            if (!isCameraAllowed) {
                                alertTitle = 'onfidoStep.cameraPermissionsNotGranted';
                                alertMessage = 'onfidoStep.cameraRequestMessage';
                            } else if (!isMicAllowed) {
                                alertTitle = 'onfidoStep.microphonePermissionsNotGranted';
                                alertMessage = 'onfidoStep.microphoneRequestMessage';
                            }

                            if (!!alertTitle && !!alertMessage) {
                                Alert.alert(
                                    translate(alertTitle),
                                    translate(alertMessage),
                                    [
                                        {
                                            text: translate('common.cancel'),
                                            onPress: () => onUserExit(),
                                        },
                                        {
                                            text: translate('common.settings'),
                                            onPress: () => {
                                                // Save the current route so the user can return to the verification flow
                                                // after granting permissions in settings. On iOS, the app restarts when
                                                // certain permissions are changed, so we need to preserve the navigation state.
                                                saveLastRoute();
                                                onUserExit();
                                                Linking.openSettings();
                                            },
                                        },
                                    ],
                                    {cancelable: false},
                                );
                                return;
                            }
                            onError(errorMessage);
                        })
                        .catch(() => {
                            onError(errorMessage);
                        });
                } else {
                    onError(errorMessage);
                }
            });
        // Onfido should be initialized only once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <FullscreenLoadingIndicator />;
}

export default Onfido;
