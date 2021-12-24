import _ from 'underscore';
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
                if (_.contains([CONST.ONFIDO.ERROR.USER_CANCELLED, CONST.ONFIDO.ERROR.USER_TAPPED_BACK], errorMessage)) {
                    this.props.onUserExit();
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
