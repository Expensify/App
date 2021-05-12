import React from 'react';
import {
    Onfido as OnfidoSDK,
    OnfidoCaptureType,
} from '@onfido/react-native-sdk';
import onfidoPropTypes from './onfidoPropTypes';

class Onfido extends React.Component {
    componentDidMount() {
        OnfidoSDK.start({
            sdkToken: this.props.sdkToken,
            flowSteps: {
                welcome: true,
                captureFace: {
                    type: OnfidoCaptureType.VIDEO,
                },
                captureDocument: {},
            },
        })
            .then((success) => {
                console.log(success);
            })
            .catch((error) => {
                if (error.message === 'User canceled flow') {
                    this.props.onUserExit();
                }
            });
    }

    render() {
        return null;
    }
}

Onfido.propTypes = onfidoPropTypes;
export default Onfido;
