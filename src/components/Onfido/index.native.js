import {OnfidoCaptureType, OnfidoCountryCode, OnfidoDocumentType, Onfido as OnfidoSDK} from '@onfido/react-native-sdk';
import lodashGet from 'lodash/get';
import React, {useEffect} from 'react';
import {Alert, Linking} from 'react-native';
import _ from 'underscore';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useLocalize from '@hooks/useLocalize';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import onfidoPropTypes from './onfidoPropTypes';

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

                // Handle user camera permission on iOS and Android
                if (_.contains([CONST.ONFIDO.ERROR.USER_CAMERA_PERMISSION, CONST.ONFIDO.ERROR.USER_CAMERA_DENINED, CONST.ONFIDO.ERROR.USER_CAMERA_CONSENT_DENIED], errorMessage)) {
                    Alert.alert(
                        translate('onfidoStep.cameraPermissionsNotGranted'),
                        translate('onfidoStep.cameraRequestMessage'),
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
        // Onfido should be initialized only once on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <FullscreenLoadingIndicator />;
}

Onfido.propTypes = onfidoPropTypes;
Onfido.displayName = 'Onfido';

export default Onfido;
