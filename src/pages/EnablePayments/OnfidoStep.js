import lodashGet from 'lodash.get';
import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import Onfido from './Onfido';
import * as API from '../../libs/API';
import styles from '../../styles/styles';

class OnfidoStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sdkToken: null,
            applicantID: null,
        };
    }

    componentDidMount() {
        // Call Web-Secure to get the SDK token
        API.Wallet_GetOnfidoToken()
            .then((response) => {
                const sdkToken = lodashGet(response, 'requestorIdentityOnfido.apiResult.sdkToken');
                const applicantID = lodashGet(response, 'requestorIdentityOnfido.apiResult.applicantID');
                this.setState({sdkToken, applicantID});
            });
    }

    render() {
        if (!this.state.sdkToken) {
            return (
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <ActivityIndicator large />
                </View>
            );
        }

        return (
            <Onfido
                token={this.state.sdkToken}
                applicantID={this.state.applicantID}
                onSubmit={this.props.onSubmit}
                onCancel={() => {
                    // @TODO Need to handle the user canceling this flow somehow...
                }}
            />
        );
    }
}

export default OnfidoStep;
