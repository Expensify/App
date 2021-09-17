import lodashGet from 'lodash/get';
import React from 'react';
import {
    Onfido as OnfidoSDK,
    OnfidoCaptureType,
    OnfidoDocumentType,
    OnfidoCountryCode,
} from '@onfido/react-native-sdk';
import onfidoPropTypes from './onfidoPropTypes';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';

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
                const errorMessage = lodashGet(error, 'message');
                if (!errorMessage) {
                    this.props.onError('Unknown error');
                    return;
                }

                // If the user cancels the Onfido flow we won't log this error as it's normal
                if (errorMessage === CONST.ONFIDO.ERROR.USER_CANCELLED) {
                    this.props.onUserExit();
                    return;
                }

                // This is an unexpected error so we'll call the error handling callback if provided
                this.props.onError(errorMessage);
            });
    }

    render() {
        return null;
    }
}

Onfido.propTypes = propTypes;
export default withLocalize(Onfido);
