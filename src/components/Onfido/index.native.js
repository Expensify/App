import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useEffect} from 'react';
import {Alert, Linking, Platform} from 'react-native';
import {RESULTS, PERMISSIONS, checkMultiple} from 'react-native-permissions';
import {Onfido as OnfidoSDK, OnfidoCaptureType, OnfidoDocumentType, OnfidoCountryCode} from '@onfido/react-native-sdk';
import onfidoPropTypes from './onfidoPropTypes';
import CONST from '../../CONST';
import Log from '../../libs/Log';
import FullscreenLoadingIndicator from '../FullscreenLoadingIndicator';
import useLocalize from '../../hooks/useLocalize';

function Onfido({sdkToken, onUserExit, onSuccess, onError}) {
    const {translate} = useLocalize();

    useEffect(() => {
        OnfidoSDK.start({
            sdkToken,
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
            .catch((error) => {
                const errorMessage = lodashGet(error, 'message', CONST.ERROR.UNKNOWN_ERROR);
                const errorType = lodashGet(error, 'type');
                Log.hmmm('Onfido error on native', {errorType, errorMessage});

                // If the user cancels the Onfido flow we won't log this error as it's normal. In the React Native SDK the user exiting the flow will trigger this error which we can use as
                // our "user exited the flow" callback. On web, this event has it's own callback passed as a config so we don't need to bother with this there.
                if (_.contains([CONST.ONFIDO.ERROR.USER_CANCELLED, CONST.ONFIDO.ERROR.USER_TAPPED_BACK, CONST.ONFIDO.ERROR.USER_EXITED], errorMessage)) {
                    onUserExit();
                    return;
                }

                if (!_.isEmpty(errorMessage)) {
                    const micPermission = Platform.select({
                        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
                        ios: PERMISSIONS.IOS.MICROPHONE,
                    });
                    const cameraPermission = Platform.select({
                        android: PERMISSIONS.ANDROID.CAMERA,
                        ios: PERMISSIONS.IOS.CAMERA,
                    });
                    checkMultiple([micPermission, cameraPermission]).then((statuses) => {
                        const isMicAllowed = statuses[micPermission] === RESULTS.GRANTED;
                        const isCameraAllowed = statuses[cameraPermission] === RESULTS.GRANTED;
                        let alertTitle = '';
                        let alertMessage = '';
                        if (!isMicAllowed) {
                            alertTitle = 'onfidoStep.microphonePermissionsNotGranted';
                            alertMessage = 'onfidoStep.microphoneRequestMessage';
                        }
                        if (!isCameraAllowed) {
                            alertTitle = 'onfidoStep.cameraPermissionsNotGranted';
                            alertMessage = 'onfidoStep.cameraRequestMessage';
                        }

                        if (!_.isEmpty(alertTitle) && !_.isEmpty(alertMessage)) {
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
                    });
                }
            });
        // Onfido should be initialized only once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <FullscreenLoadingIndicator />;
}

Onfido.propTypes = onfidoPropTypes;
Onfido.displayName = 'Onfido';

export default Onfido;
