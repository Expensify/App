import {OnfidoCaptureType, OnfidoCountryCode, OnfidoDocumentType, Onfido as OnfidoSDK, OnfidoTheme} from '@onfido/react-native-sdk';
import React, {useEffect} from 'react';
import {Alert, Linking} from 'react-native';
import {checkMultiple, PERMISSIONS, RESULTS} from 'react-native-permissions';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useLocalize from '@hooks/useLocalize';
import getPlatform from '@libs/getPlatform';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {OnfidoError, OnfidoProps} from './types';

function Onfido({sdkToken, onUserExit, onSuccess, onError}: OnfidoProps) {
    const {translate} = useLocalize();

    useEffect(() => {
        OnfidoSDK.start({
            sdkToken,
            theme: OnfidoTheme.AUTOMATIC,
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
            disableNFC: true,
        })
            .then(onSuccess)
            .catch((error: OnfidoError) => {
                const errorMessage: string = error.message ?? CONST.ERROR.UNKNOWN_ERROR;
                const errorType = error.type;

                Log.hmmm('Onfido error on native', {errorType, errorMessage});

                // If the user cancels the Onfido flow we won't log this error as it's normal. In the React Native SDK the user exiting the flow will trigger this error which we can use as
                // our "user exited the flow" callback. On web, this event has it's own callback passed as a config so we don't need to bother with this there.
                if (([CONST.ONFIDO.ERROR.USER_CANCELLED, CONST.ONFIDO.ERROR.USER_TAPPED_BACK, CONST.ONFIDO.ERROR.USER_EXITED] as string[]).includes(errorMessage)) {
                    onUserExit();
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    return <FullscreenLoadingIndicator />;
}

Onfido.displayName = 'Onfido';

export default Onfido;
