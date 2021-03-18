import React from 'react';
import {
    Onfido as OnfidoSDK,
    OnfidoCaptureType,
    OnfidoCountryCode,
    OnfidoDocumentType,
} from '@onfido/react-native-sdk';

class Onfido extends React.Component {
    componentDidMount() {
        OnfidoSDK.start({
            sdkToken: this.props.token,
            flowSteps: {
                captureDocument: {
                    docType: OnfidoDocumentType.DRIVING_LICENCE,
                    countryCode: OnfidoCountryCode.USA,
                },
                captureFace: {
                    type: OnfidoCaptureType.VIDEO,
                },
            },
        })
            .then((res) => {
                this.props.onSubmit({
                    onfidoData: res,
                });
            })
            .catch((err) => {
                if (err.message === 'User canceled flow') {
                    this.props.onCancel();
                }
            });
    }

    render() {
        return null;
    }
}

export default Onfido;
