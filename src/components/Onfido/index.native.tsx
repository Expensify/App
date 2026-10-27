import ActivityIndicator from '@components/ActivityIndicator';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';
import goToSettings from '@libs/goToSettings';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import {OnfidoCaptureType, OnfidoCountryCode, OnfidoDocumentType, OnfidoNFCOptions, Onfido as OnfidoSDK, OnfidoTheme} from '@onfido/react-native-sdk';
import React, {useEffect} from 'react';
import {Alert, NativeModules} from 'react-native';
import {checkMultiple, PERMISSIONS, RESULTS} from 'react-native-permissions';

import type {OnfidoError, OnfidoProps} from './types';

const {AppStateTracker} = NativeModules;

function Onfido({sdkToken, onUserExit, onSuccess, onError}: OnfidoProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    useEffect(() => {
        // Back is exposed while OnfidoSDK.start() is still pending, so a late resolve/reject could navigate or mutate
        // wallet/bank-account state after the user has already left. Ignore the callbacks once this component unmounts.
        let isActive = true;
        const handleSuccess: OnfidoProps['onSuccess'] = (data) => {
            if (!isActive) {
                return;
            }
            onSuccess(data);
        };
        const handleUserExit: OnfidoProps['onUserExit'] = (isUserInitiated) => {
            if (!isActive) {
                return;
            }
            onUserExit(isUserInitiated);
        };
        const handleError: OnfidoProps['onError'] = (error) => {
            if (!isActive) {
                return;
            }
            onError(error);
        };

        OnfidoSDK.start({
            sdkToken,
            theme: OnfidoTheme.AUTOMATIC,

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
            .then(handleSuccess)
            .catch((error: OnfidoError) => {
                const errorMessage: string = error.message ?? CONST.ERROR.UNKNOWN_ERROR;
                const errorType = error.type;

                Log.hmmm('Onfido error on native', {errorType, errorMessage});

                // If the user cancels the Onfido flow we won't log this error as it's normal. In the React Native SDK the user exiting the flow will trigger this error which we can use as
                // our "user exited the flow" callback. On web, this event has it's own callback passed as a config so we don't need to bother with this there.
                if (([CONST.ONFIDO.ERROR.USER_CANCELLED, CONST.ONFIDO.ERROR.USER_TAPPED_BACK, CONST.ONFIDO.ERROR.USER_EXITED] as string[]).includes(errorMessage)) {
                    if (getPlatform() === CONST.PLATFORM.ANDROID) {
                        AppStateTracker.getWasAppRelaunchedFromIcon().then((wasAppRelaunchedFromIcon) => {
                            handleUserExit(!wasAppRelaunchedFromIcon);
                        });
                        return;
                    }

                    handleUserExit(true);
                    return;
                }

                if (!!errorMessage && getPlatform() === CONST.PLATFORM.IOS) {
                    checkMultiple([PERMISSIONS.IOS.MICROPHONE, PERMISSIONS.IOS.CAMERA])
                        .then((statuses) => {
                            // The permission check resolves asynchronously, so the user may have already backed out (unmounting this
                            // component) by the time it settles. Skip the alert to avoid showing a stale permission prompt on the screen they returned to.
                            if (!isActive) {
                                return;
                            }
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
                                            onPress: () => handleUserExit(true),
                                        },
                                        {
                                            text: translate('common.settings'),
                                            onPress: () => {
                                                handleUserExit();
                                                goToSettings();
                                            },
                                        },
                                    ],
                                    {cancelable: false},
                                );
                                return;
                            }
                            handleError(errorMessage);
                        })
                        .catch(() => {
                            handleError(errorMessage);
                        });
                } else {
                    handleError(errorMessage);
                }
            });

        return () => {
            isActive = false;
        };
        // Onfido should be initialized only once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ActivityIndicator
            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
            style={styles.flex1}
        />
    );
}

export default Onfido;
