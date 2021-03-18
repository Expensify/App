import React from 'react';
import {init as initOnfido} from 'onfido-sdk-ui';

class Onfido extends React.Component {
    componentDidMount() {
        this.onfidoOut = initOnfido({
            token: this.props.token,
            containerEl: this.onfidoElement,
            onComplete: (onfidoResponse) => {
                this.props.onSubmit({
                    onfidoData: {
                        ...onfidoResponse,
                        applicantID: this.props.applicantID,
                    },
                });
            },
            steps: [
                {
                    type: 'document',
                    options: {
                        documentTypes: {
                            passport: true,
                            driving_licence: true,
                            national_identity_card: true,
                            residence_permit: true,
                        },
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
        });
    }

    componentWillUnmount() {
        if (!this.onfidoOut) {
            return;
        }

        this.onfidoOut.tearDown();
    }

    render() {
        return (
            <div id="onfido-mount" ref={el => this.onfidoElement = el} />
        );
    }
}

export default Onfido;
