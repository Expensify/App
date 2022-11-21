import _ from 'underscore';
import lodashGet from 'lodash/get';
import React from 'react';
import {Alert, Linking} from 'react-native';
import {
    Onfido as OnfidoSDK,
    OnfidoCaptureType,
    OnfidoDocumentType,
    OnfidoCountryCode,
} from '@onfido/react-native-sdk';
import onfidoPropTypes from './onfidoPropTypes';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Log from '../../libs/Log';

const propTypes = {
    ...withLocalizePropTypes,
    ...onfidoPropTypes,
};

class Onfido extends React.Component {
    componentDidMount() {
        OnfidoSDK.start({
            sdkToken: this.props.sdkToken,
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
            .then(this.props.onSuccess)
            .catch((error) => {
                const errorMessage = lodashGet(error, 'message', CONST.ERROR.UNKNOWN_ERROR);
                const errorType = lodashGet(error, 'type');
                Log.hmmm('Onfido error on native', {errorType, errorMessage});

                // If the user cancels the Onfido flow we won't log this error as it's normal. In the React Native SDK the user exiting the flow will trigger this error which we can use as
                // our "user exited the flow" callback. On web, this event has it's own callback passed as a config so we don't need to bother with this there.
                if (_.contains(
                    [
                        CONST.ONFIDO.ERROR.USER_CANCELLED,
                        CONST.ONFIDO.ERROR.USER_TAPPED_BACK,
                        CONST.ONFIDO.ERROR.USER_EXITED,
                    ],
                    errorMessage,
                )) {
                    this.props.onUserExit();
                    return;
                }

                // Handle user camera permission on iOS and Android
                if (_.contains(
                    [
                        CONST.ONFIDO.ERROR.USER_CAMERA_PERMISSION,
                        CONST.ONFIDO.ERROR.USER_CAMERA_DENINED,
                        CONST.ONFIDO.ERROR.USER_CAMERA_CONSENT_DENIED,
                    ],
                    errorMessage,
                )) {
                    Alert.alert(
                        this.props.translate('onfidoStep.cameraPermissionsNotGranted'),
                        this.props.translate('onfidoStep.cameraRequestMessage'),
                        [
                            {
                                text: this.props.translate('common.cancel'),
                                onPress: () => this.props.onUserExit(),
                            },
                            {
                                text: this.props.translate('common.settings'),
                                onPress: () => {
                                    this.props.onUserExit();
                                    Linking.openSettings();
                                },
                            },
                        ],
                        {cancelable: false},
                    );
                    return;
                }

                this.props.onError(errorMessage);
            });
    }

    render() {
        return null;
    }
}

Onfido.propTypes = propTypes;
export default withLocalize(Onfido);
