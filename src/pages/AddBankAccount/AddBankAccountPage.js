import _ from 'underscore';
import React from 'react';
import {View, ActivityIndicator, Text, Button} from 'react-native';
import styles from '../../styles/styles';
import PlaidLink from './PlaidLink';
import * as API from '../../libs/API';

class AddBankAccountPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            plaidToken: '',
            publicToken: '',
            accounts: [],
        };
    }

    componentDidMount() {
        API.Plaid_GetLinkToken()
            .then((response) => {
                if (!response || !response.plaidToken) {
                    return;
                }
                this.setState({plaidToken: response.plaidToken});
            });
    }

    render() {
        if (!this.state.plaidToken) {
            // Full page spinner
            return (
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <ActivityIndicator large />
                </View>
            );
        }

        if (!this.state.publicToken) {
            return (
                <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    <PlaidLink
                        token={this.state.plaidToken}
                        onSuccess={(publicToken, metadata) => {
                            console.debug(publicToken, metadata);
                            const accounts = (metadata && metadata.accounts) || [];
                            this.setState({accounts, publicToken});
                        }}
                        onExit={(response) => {
                            console.debug(response);
                        }}
                        onEvent={(response) => {
                            console.log(response);
                        }}
                    >
                        <Text>Connect a bank account</Text>
                    </PlaidLink>
                </View>
            );
        }

        return (
            <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                {/* Allow user to select which account they want to use */}
                {_.map(this.state.accounts, account => (
                    <View key={account.id}>
                        <Text>{account.name}-{account.mask}</Text>
                    </View>
                ))}
            </View>
        );
    }
}

export default AddBankAccountPage;
