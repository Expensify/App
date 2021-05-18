import './index.css';
import React from 'react';
import * as OnfidoSDK from 'onfido-sdk-ui';
import onfidoPropTypes from './onfidoPropTypes';
import CONST from '../../CONST';

class Onfido extends React.Component {
    constructor(props) {
        super(props);
        this.onfidoOut = undefined;
    }

    componentDidMount() {
        this.onfidoOut = OnfidoSDK.init({
            token: this.props.sdkToken,
            containerId: CONST.ONFIDO.CONTAINER_ID,
            steps: [
                {
                    type: CONST.ONFIDO.TYPE.DOCUMENT,
                    options: {
                        forceCrossDevice: true,
                    },
                },
                {
                    type: CONST.ONFIDO.TYPE.FACE,
                    options: {
                        requestedVariant: CONST.ONFIDO.VARIANT.VIDEO,
                        uploadFallback: false,
                    },
                },
            ],
            smsNumberCountryCode: CONST.ONFIDO.SMS_NUMBER_COUNTRY_CODE,
            onComplete: this.props.onSuccess,
            onError: () => {

            },
            onUserExit: this.props.onUserExit,
            onModalRequestClose: () => {

            },
        });
    }

    componentWillUnmount() {
        if (this.onfidoOut) {
            this.onfidoOut.tearDown();
        }
    }

    render() {
        return (
            <div id={CONST.ONFIDO.CONTAINER_ID} />
        );
    }
}

Onfido.propTypes = onfidoPropTypes;
export default Onfido;
