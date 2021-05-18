import React from 'react';
import {
    Onfido as OnfidoSDK,
    OnfidoCaptureType,
} from '@onfido/react-native-sdk';
import onfidoPropTypes from './onfidoPropTypes';
import CONST from '../../CONST';

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
            .then(this.props.onSuccess)
            .catch((error) => {
                if (error.message === CONST.ONFIDO.ERROR.USER_CANCELLED) {
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
