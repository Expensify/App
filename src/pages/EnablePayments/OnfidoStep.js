import React from 'react';
import {View, Text} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Onfido from '../../components/Onfido';
import FullscreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';
import ONYXKEYS from '../../ONYXKEYS';
import {activateWallet, fetchOnfidoToken} from '../../libs/actions/BankAccounts';
import Navigation from '../../libs/Navigation/Navigation';
import CONST from '../../CONST';
import Button from '../../components/Button';
import styles from '../../styles/styles';

const propTypes = {
    walletOnfidoData: PropTypes.shape({
        applicantID: PropTypes.string,
        sdkToken: PropTypes.string,
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    walletOnfidoData: {
        loading: true,
    },
};

class OnfidoStep extends React.Component {
    componentDidMount() {
        fetchOnfidoToken();
    }

    render() {
        if (this.props.walletOnfidoData.loading) {
            return <FullscreenLoadingIndicator />;
        }

        if (this.props.walletOnfidoData.error || !this.props.walletOnfidoData.sdkToken) {
            return (
                <View style={[styles.m5]}>
                    <Text style={[styles.h3, styles.mb2]}>
                        {this.props.walletOnfidoData.error}
                    </Text>
                    <Button
                        success
                        text="Try again"
                        onPress={() => {
                            // Restart the flow so the user can try again.
                            fetchOnfidoToken();
                        }}
                    />
                </View>
            );
        }

        return (
            <Onfido
                sdkToken={this.props.walletOnfidoData.sdkToken}
                onUserExit={() => {
                    Navigation.goBack();
                }}
                onSuccess={(data) => {
                    activateWallet(CONST.WALLET.STEP.ONFIDO, {
                        onfidoData: JSON.stringify({
                            ...data,
                            applicantID: this.props.walletOnfidoData.applicantID,
                        }),
                    });
                }}
            />
        );
    }
}

OnfidoStep.propTypes = propTypes;
OnfidoStep.defaultProps = defaultProps;

export default withOnyx({
    walletOnfidoData: {
        key: ONYXKEYS.WALLET_ONFIDO,

        // Let's get a new onfido token each time the user hits this flow (as it should only be once)
        initWithStoredValues: false,
    },
})(OnfidoStep);
