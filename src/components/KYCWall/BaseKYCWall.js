import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {Dimensions} from 'react-native';
import lodashGet from 'lodash/get';
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
import * as ReportUtils from '../../libs/ReportUtils';

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
            anchorPositionVertical: 0,
            anchorPositionHorizontal: 0,
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
                anchorPositionVertical: domRect.top + (domRect.height - 2),
                anchorPositionHorizontal: domRect.left + 20,
            };
        }

        return {
            anchorPositionVertical: domRect.top - 8,
            anchorPositionHorizontal: domRect.left,
        };
    }

    /**
     * Set position of the transfer payment menu
     *
     * @param {Object} position
     */
    setPositionAddPaymentMenu(position) {
        this.setState({
            anchorPositionVertical: position.anchorPositionVertical,
            anchorPositionHorizontal: position.anchorPositionHorizontal,
        });
    }

    /**
     * Take the position of the button that calls this method and show the Add Payment method menu when the user has no valid payment method.
     * If they do have a valid payment method they are navigated to the "enable payments" route to complete KYC checks.
     * If they are already KYC'd we will continue whatever action is gated behind the KYC wall.
     *
     * @param {Event} event
     * @param {String} iouPaymentType
     */
    continue(event, iouPaymentType) {
        this.setState({transferBalanceButton: event.nativeEvent.target});
        const isExpenseReport = ReportUtils.isExpenseReport(this.props.iouReport);
        const paymentCardList = this.props.fundList || this.props.cardList || {};

        // Check to see if user has a valid payment method on file and display the add payment popover if they don't
        if (
            (isExpenseReport && lodashGet(this.props.reimbursementAccount, 'achData.state', '') !== CONST.BANK_ACCOUNT.STATE.OPEN) ||
            (!isExpenseReport && !PaymentUtils.hasExpensifyPaymentMethod(paymentCardList, this.props.bankAccountList))
        ) {
            Log.info('[KYC Wallet] User does not have valid payment method');
            const clickedElementLocation = getClickedTargetLocation(event.nativeEvent.target);
            const position = this.getAnchorPosition(clickedElementLocation);
            this.setPositionAddPaymentMenu(position);
            this.setState({
                shouldShowAddPaymentMenu: true,
            });
            return;
        }

        if (!isExpenseReport) {
            // Ask the user to upgrade to a gold wallet as this means they have not yet gone through our Know Your Customer (KYC) checks
            const hasGoldWallet = this.props.userWallet.tierName && this.props.userWallet.tierName === CONST.WALLET.TIER_NAME.GOLD;
            if (!hasGoldWallet) {
                Log.info('[KYC Wallet] User does not have gold wallet');
                Navigation.navigate(this.props.enablePaymentsRoute);
                return;
            }
        }

        Log.info('[KYC Wallet] User has valid payment method and passed KYC checks or did not need them');
        this.props.onSuccessfulKYC(iouPaymentType);
    }

    render() {
        return (
            <>
                <AddPaymentMethodMenu
                    isVisible={this.state.shouldShowAddPaymentMenu}
                    onClose={() => this.setState({shouldShowAddPaymentMenu: false})}
                    anchorPosition={{
                        vertical: this.state.anchorPositionVertical,
                        horizontal: this.state.anchorPositionHorizontal,
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
    fundList: {
        key: ONYXKEYS.FUND_LIST,
    },
    bankAccountList: {
        key: ONYXKEYS.BANK_ACCOUNT_LIST,
    },
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    chatReport: {
        key: ({chatReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
    },
})(KYCWall);
