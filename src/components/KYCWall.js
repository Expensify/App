import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {ActivityIndicator} from 'react-native';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';
import Navigation from '../libs/Navigation/Navigation';
import AddPaymentMethodMenu from './AddPaymentMethodMenu';
import getClickedElementLocation from '../libs/getClickedElementLocation';
import * as PaymentUtils from '../libs/PaymentUtils';
import * as PaymentMethods from '../libs/actions/PaymentMethods';
import ONYXKEYS from '../ONYXKEYS';
import userWalletPropTypes from '../pages/EnablePayments/userWalletPropTypes';
import Log from '../libs/Log';

const propTypes = {
    /** Route for the Add Bank Account screen for a given navigation stack */
    addBankAccountRoute: PropTypes.string.isRequired,

    /** Route for the Add Debit Card screen for a given navigation stack */
    addDebitCardRoute: PropTypes.string.isRequired,

    /** Route for the KYC enable payments screen for a given navigation stack */
    enablePaymentsRoute: PropTypes.string.isRequired,

    ...userWalletPropTypes,
};

const defaultProps = {
    // eslint-disable-next-line react/default-props-match-prop-types
    userWallet: {},
};

// This component allows us to block various actions by forcing the user to first add a default payment method and successfully make it through our Know Your Customer flow
// before continuing to take whatever action they originally intended to take. It requires a button as a child and a native event so we can get the coordinates and use it
// to render the AddPaymentMethodMenu in the correct location.
class KYCWall extends React.Component {
    constructor(props) {
        super(props);

        this.continue = this.continue.bind(this);

        this.state = {
            shouldShowAddPaymentMenu: false,
            anchorPositionTop: 0,
            anchorPositionLeft: 0,
        };
    }

    componentDidMount() {
        PaymentMethods.getPaymentMethods();
        PaymentMethods.kycWallRef.current = this;
    }

    componentWillUnmount() {
        PaymentMethods.kycWallRef.current = null;
    }

    /**
     * Take the position of the button that calls this method and show the Add Payment method menu when the user has no valid payment method.
     * If they do have a valid payment method they are navigated to the "enable payments" route to complete KYC checks.
     * If they are already KYC'd we will continue whatever action is gated behind the KYC wall.
     *
     * @param {Event} event
     */
    continue(event) {
        // Check to see if user has a valid payment method on file and display the add payment popover if they don't
        if (!PaymentUtils.hasExpensifyPaymentMethod(this.props.cardList, this.props.bankAccountList)) {
            Log.info('[KYC Wallet] User does not have valid payment method');
            const clickedElementLocation = getClickedElementLocation(event.nativeEvent);
            this.setState({
                shouldShowAddPaymentMenu: true,
                anchorPositionTop: clickedElementLocation.bottom - CONST.ADD_PAYMENT_MENU_POSITION_Y,
                anchorPositionLeft: clickedElementLocation.right - CONST.ADD_PAYMENT_MENU_POSITION_X,
            });
            return;
        }

        // Ask the user to upgrade to a gold wallet as this means they have not yet went through our Know Your Customer (KYC) checks
        const hasGoldWallet = this.props.userWallet.tierName && this.props.userWallet.tierName === CONST.WALLET.TIER_NAME.GOLD;
        if (!hasGoldWallet) {
            Log.info('[KYC Wallet] User does not have gold wallet');
            Navigation.navigate(this.props.enablePaymentsRoute);
            return;
        }

        Log.info('[KYC Wallet] User has valid payment method and passed KYC checks');
        this.props.onSuccessfulKYC();
    }

    render() {
        return (
            <>
                <AddPaymentMethodMenu
                    isVisible={this.state.shouldShowAddPaymentMenu}
                    onClose={() => this.setState({shouldShowAddPaymentMenu: false})}
                    anchorPosition={{
                        top: this.state.anchorPositionTop,
                        left: this.state.anchorPositionLeft,
                    }}
                    shouldShowPaypal={false}
                    onItemSelected={(item) => {
                        this.setState({shouldShowAddPaymentMenu: false});
                        if (item === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
                            Navigation.navigate(this.props.addBankAccountRoute);
                        } else if (item === CONST.PAYMENT_METHODS.DEBIT_CARD) {
                            Navigation.navigate(this.props.addDebitCardRoute);
                        }
                    }}
                />
                {this.props.isLoadingPaymentMethods
                    ? (<ActivityIndicator color={themeColors.spinner} size="large" />)
                    : this.props.children(this.continue)}
            </>
        );
    }
}

KYCWall.propTypes = propTypes;
KYCWall.defaultProps = defaultProps;

export default withOnyx({
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
    cardList: {
        key: ONYXKEYS.CARD_LIST,
    },
    bankAccountList: {
        key: ONYXKEYS.BANK_ACCOUNT_LIST,
    },
    isLoadingPaymentMethods: {
        key: ONYXKEYS.IS_LOADING_PAYMENT_METHODS,
        initWithStoredValues: false,
    },
})(KYCWall);
