import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import {ScrollView} from 'react-native-gesture-handler';
import ONYXKEYS from '../../../ONYXKEYS';
import ROUTES from '../../../ROUTES';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Navigation from '../../../libs/Navigation/Navigation';
import styles from '../../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import KeyboardAvoidingView from '../../../components/KeyboardAvoidingView/index';
import {
    Bank, Bolt,
} from '../../../components/Icon/Expensicons';
import MenuItem from '../../../components/MenuItem';
import CONST from '../../../CONST';
import variables from '../../../styles/variables';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import FixedFooter from '../../../components/FixedFooter';
import CurrentWalletBalance from '../../../components/CurrentWalletBalance';
import userWalletPropTypes from '../../EnablePayments/userWalletPropTypes';
import {transferWalletBalance} from '../../../libs/actions/PaymentMethods';


const propTypes = {
    /** Route params */
    route: PropTypes.shape({
        params: PropTypes.shape({
            /** Selected Account for transferring amount */
            account: PropTypes.string,
        }),
    }).isRequired,

    ...userWalletPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    // eslint-disable-next-line react/default-props-match-prop-types
    userWallet: {},
};
const Fee = 0.30;

class TransferBalancePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedPaymentType: CONST.WALLET.PAYMENT_TYPE.INSTANT,
            selectedBankAccount: props.userWallet.linkedBankAccount,

            // Show loader while tranfer is in-transit
            loading: false,
        };

        this.paymentTypes = [
            {
                key: CONST.WALLET.PAYMENT_TYPE.INSTANT,
                title: this.props.translate('transferAmountPage.instant'),
                description: this.props.translate('transferAmountPage.instantSummary'),
                icon: Bolt,
            },
            {
                key: CONST.WALLET.PAYMENT_TYPE.ACH,
                title: this.props.translate('transferAmountPage.ach'),
                description: this.props.translate('transferAmountPage.achSummary'),
                icon: Bank,
            },
        ];

        this.transferBalance = this.transferBalance.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (lodashGet(prevProps, 'route.params.account', '') !== lodashGet(this.props, 'route.params.account', '')) {
            console.debug(lodashGet(this.props, 'route.params.account'));
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                selectedBankAccount: lodashGet(this.props, 'route.params.account'),
            });
        }
    }

    /**
     * Transfer Wallet balance
     *
     */
    transferBalance() {
        this.setState({loading: true});
        transferWalletBalance().then(() => this.setState({loading: false}));
    }

    render() {
        const transferAmount = (this.props.userWallet.availableBalance - Fee).toFixed(2);
        const canTransfer = transferAmount > Fee;
        return (
            <ScreenWrapper>
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate('transferAmountPage.transferBalance')}
                        onCloseButtonPress={() => Navigation.goBack()}
                    />
                    <View style={[styles.flex1, styles.flexBasisAuto, styles.justifyContentCenter]}>
                        <CurrentWalletBalance balanceStyles={[styles.text7XLarge]} />
                    </View>
                    <ScrollView style={styles.flexGrow0} contentContainerStyle={styles.p5}>
                        {_.map(this.paymentTypes, type => (
                            <MenuItem
                                key={type.key}
                                title={type.title}
                                description={type.description}
                                iconWidth={variables.iconSizeXLarge}
                                iconHeight={variables.iconSizeXLarge}
                                icon={type.icon}
                                success={this.state.selectedPaymentType === type.key}
                                wrapperStyle={{
                                    ...styles.mt3,
                                    ...styles.pv4,
                                    ...styles.transferBalancePayment,
                                    ...(this.state.selectedPaymentType === type.key
                                        && styles.transferBalanceSelectedPayment),
                                }}
                                // eslint-disable-next-line react/no-unused-state
                                onPress={() => this.setState({selectedPaymentType: type.key})}
                            />
                        ))}
                        <Text
                            style={[styles.pv5, styles.textStrong, styles.textLabel, styles.justifyContentStart]}
                        >
                            {this.props.translate('transferAmountPage.whichAccount')}
                        </Text>
                        <MenuItem
                            title="asdsdsd"
                            description="dasdasdas"
                            shouldShowRightIcon
                            iconWidth={variables.iconSizeXLarge}
                            iconHeight={variables.iconSizeXLarge}
                            icon={Bolt}
                            wrapperStyle={{
                                ...styles.mrn5,
                                ...styles.ph0,
                            }}
                            onPress={() => Navigation.navigate(ROUTES.SETTINGS_PAYMENTS_CHOOSE_TRANSFER_ACCOUNT)}
                        />
                        <Text
                            style={[styles.mt5, styles.mb3, styles.textStrong, styles.textLabel, styles.justifyContentStart]}
                        >
                            {this.props.translate('transferAmountPage.fee')}
                        </Text>
                        <Text
                            style={[styles.textLabel, styles.justifyContentStart]}
                        >
                            {`$${Fee.toFixed(2)}`}
                        </Text>
                    </ScrollView>
                    <FixedFooter style={[styles.flexGrow0]}>
                        <Button
                            success
                            pressOnEnter
                            isLoading={this.state.loading}
                            isDisabled={!canTransfer}
                            onPress={this.transferBalance}
                            text={this.props.translate(
                                'transferAmountPage.transfer',
                                {amount: canTransfer ? `$${transferAmount}` : ''},
                            )}
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

TransferBalancePage.propTypes = propTypes;
TransferBalancePage.defaultProps = defaultProps;
TransferBalancePage.displayName = 'TransferBalancePage';

export default compose(
    withLocalize,
    withOnyx({
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(TransferBalancePage);
