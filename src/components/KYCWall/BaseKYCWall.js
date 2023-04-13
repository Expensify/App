import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {Dimensions} from 'react-native';
import CONST from '../../CONST';
import Navigation from '../../libs/Navigation/Navigation';
import AddPaymentMethodMenu from '../AddPaymentMethodMenu';
import getClickedTargetLocation from '../../libs/getClickedTargetLocation';
import * as PaymentUtils from '../../libs/PaymentUtils';
import * as PaymentMethods from '../../libs/actions/PaymentMethods';
import ONYXKEYS from '../../ONYXKEYS';
import Log from '../../libs/Log';
import {propTypes, defaultProps} from './kycWallPropTypes';
import * as Wallet from '../../libs/actions/Wallet';

// This component allows us to block various actions by forcing the user to first add a default payment method and successfully make it through our Know Your Customer flow
// before continuing to take whatever action they originally intended to take. It requires a button as a child and a native event so we can get the coordinates and use it
// to render the AddPaymentMethodMenu in the correct location.
class KYCWall extends React.Component {
    constructor(props) {
        super(props);

        this.continue = this.continue.bind(this);
        this.setMenuPosition = this.setMenuPosition.bind(this);

        this.state = {
            shouldShowAddPaymentMenu: false,
            anchorPositionTop: 0,
            anchorPositionLeft: 0,
            transferBalanceButton: null,
        };
    }

    componentDidMount() {
        PaymentMethods.kycWallRef.current = this;
        if (this.props.shouldListenForResize) {
            this.dimensionsSubscription = Dimensions.addEventListener('change', this.setMenuPosition);
        }
        Wallet.setKYCWallSourceChatReportID(this.props.chatReportID);
    }

    componentWillUnmount() {
        if (this.props.shouldListenForResize && this.dimensionsSubscription) {
            this.dimensionsSubscription.remove();
        }
        PaymentMethods.kycWallRef.current = null;
    }

    setMenuPosition() {
        if (!this.state.transferBalanceButton) {
            return;
        }
        const buttonPosition = getClickedTargetLocation(this.state.transferBalanceButton);
        const position = this.getAnchorPosition(buttonPosition);
        this.setPositionAddPaymentMenu(position);
    }

    /**
     * @param {DOMRect} domRect
     * @returns {Object}
     */
    getAnchorPosition(domRect) {
        if (this.props.popoverPlacement === 'bottom') {
            return {
                anchorPositionTop: domRect.top + (domRect.height - 2),
                anchorPositionLeft: domRect.left + 20,
            };
        }

        return {
            anchorPositionTop: domRect.top - 150,
            anchorPositionLeft: domRect.left,
        };
    }

    /**
     * Set position of the transfer payment menu
     *
     * @param {Object} position
     */
    setPositionAddPaymentMenu(position) {
        this.setState({
            anchorPositionTop: position.anchorPositionTop,
            anchorPositionLeft: position.anchorPositionLeft,
        });
    }

    /**
     * Take the position of the button that calls this method and show the Add Payment method menu when the user has no valid payment method.
     * If they do have a valid payment method they are navigated to the "enable payments" route to complete KYC checks.
     * If they are already KYC'd we will continue whatever action is gated behind the KYC wall.
     *
     * @param {Event} event
     */
    continue(event) {
        this.setState({
            transferBalanceButton: event.nativeEvent.target,
        });

        // Check to see if user has a valid payment method on file and display the add payment popover if they don't
        if (!PaymentUtils.hasExpensifyPaymentMethod(this.props.cardList, this.props.bankAccountList)) {
            Log.info('[KYC Wallet] User does not have valid payment method');
            const clickedElementLocation = getClickedTargetLocation(event.nativeEvent.target);
            const position = this.getAnchorPosition(clickedElementLocation);
            this.setPositionAddPaymentMenu(position);
            this.setState({
                shouldShowAddPaymentMenu: true,
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
                {this.props.children(this.continue)}
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
