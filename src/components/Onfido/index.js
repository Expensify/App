import './index.css';
import React from 'react';
import * as OnfidoSDK from 'onfido-sdk-ui';
import onfidoPropTypes from './onfidoPropTypes';

class Onfido extends React.Component {
    constructor(props) {
        super(props);
        this.onfidoOut = undefined;
    }

    componentDidMount() {
        this.onfidoOut = OnfidoSDK.init({
            token: this.props.sdkToken,
            containerId: 'onfido-mount',
            steps: [
                {
                    type: 'document',
                    options: {
                        forceCrossDevice: true,
                    },
                },
                {
                    type: 'face',
                    options: {
                        requestedVariant: 'video',
                        uploadFallback: false,
                    },
                },
            ],
            smsNumberCountryCode: 'US',
            onComplete: (derp) => {
                console.log(derp);
            },
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
            <div id="onfido-mount" />
        );
    }
}

Onfido.propTypes = onfidoPropTypes;
export default Onfido;
