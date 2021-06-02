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
import Growl from '../../libs/Growl';

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
                if (error.message === CONST.ONFIDO.ERROR.USER_CANCELLED) {
                    this.props.onUserExit();
                    Growl.show(this.props.translate('onfidoStep.genericError'), CONST.GROWL.ERROR);
                }
            });
    }

    render() {
        return null;
    }
}

Onfido.propTypes = propTypes;
export default withLocalize(Onfido);
