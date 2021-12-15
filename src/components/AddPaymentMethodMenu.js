import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import Popover from './Popover';
import MenuItem from './MenuItem';
import * as Expensicons from './Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import styles from '../styles/styles';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as StyleUtils from '../styles/StyleUtils';
import getClickedElementLocation from '../libs/getClickedElementLocation';
import ROUTES from '../ROUTES';
import Navigation from '../libs/Navigation/Navigation';


const propTypes = {
    /** Username for PayPal.Me */
    payPalMeUsername: PropTypes.string,

    /** Type to filter the payment Method list */
    filterType: PropTypes.oneOf([CONST.PAYMENT_METHODS.DEBIT_CARD, CONST.PAYMENT_METHODS.BANK_ACCOUNT, '']),

    /** Are we loading payments from the server? */
    isLoadingPayments: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    payPalMeUsername: '',
    filterType: '',
    isLoadingPayments: false,
};

class AddPaymentMethodMenu extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isAddPaymentMenuActive: false,
            anchorPosition: {
                top: 0,
                left: 0,
            },
        };
        this.addPaymentMethodPressed = this.addPaymentMethodPressed.bind(this);
        this.addPaymentMethodTypePressed = this.addPaymentMethodTypePressed.bind(this);
        this.hideAddPaymentMenu = this.hideAddPaymentMenu.bind(this);
    }

    /**
     * Get the AddPaymentMethod Button title
     * @returns {String}
     */
    getAddPaymentMethodButtonTitle() {
        switch (this.props.filterType) {
            case CONST.PAYMENT_METHODS.BANK_ACCOUNT:
                return this.props.translate('paymentMethodList.addBankAccount');
            case CONST.PAYMENT_METHODS.DEBIT_CARD:
                return this.props.translate('paymentMethodList.addDebitCard');
            default: break;
        }
        return this.props.translate('paymentMethodList.addPaymentMethod');
    }

    /**
     * Display the add payment method menu
     * @param {Object} nativeEvent
     */
    addPaymentMethodPressed(nativeEvent) {
        const position = getClickedElementLocation(nativeEvent);
        this.setState({
            isAddPaymentMenuActive: true,
            anchorPosition: {
                top: position.bottom,

                // We want the position to be 20px to the right of the left border
                left: position.left + 20,
            },
        });
    }

    /**
     * Navigate to the appropriate payment type addition screen
     * @param {String} paymentType
     */
    addPaymentMethodTypePressed(paymentType) {
        if (!this.props.filterType) {
            this.hideAddPaymentMenu();
        }

        if (paymentType === CONST.PAYMENT_METHODS.PAYPAL) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_PAYPAL_ME);
            return;
        }

        if (paymentType === CONST.PAYMENT_METHODS.DEBIT_CARD) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_DEBIT_CARD);
            return;
        }

        if (paymentType === CONST.PAYMENT_METHODS.BANK_ACCOUNT) {
            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT);
            return;
        }

        throw new Error('Invalid payment method type selected');
    }

    /**
     * Hide the add payment modal
     */
    hideAddPaymentMenu() {
        this.setState({isAddPaymentMenuActive: false});
    }

    render() {
        const addPaymentMethodButtonTitle = this.getAddPaymentMethodButtonTitle();

        return (
            <>
                <MenuItem
                    onPress={e => (this.props.filterType
                        ? this.addPaymentMethodTypePressed(this.props.filterType)
                        : this.addPaymentMethodPressed(e)
                    )}
                    title={addPaymentMethodButtonTitle}
                    icon={Expensicons.Plus}
                    disabled={this.props.isLoadingPayments}
                    iconFill={this.state.isAddPaymentMenuActive
                        ? StyleUtils.getIconFillColor(CONST.BUTTON_STATES.PRESSED)
                        : undefined}
                    wrapperStyle={this.state.isAddPaymentMenuActive
                        ? [StyleUtils.getButtonBackgroundColorStyle(CONST.BUTTON_STATES.PRESSED)]
                        : []}

                />
                {!this.props.filterType && (
                    <Popover
                        isVisible={this.state.isAddPaymentMenuActive}
                        onClose={this.hideAddPaymentMenu}
                        anchorPosition={this.state.anchorPosition}
                    >
                        <MenuItem
                            title={this.props.translate('common.bankAccount')}
                            icon={Expensicons.Bank}
                            onPress={() => this.addPaymentMethodTypePressed(CONST.PAYMENT_METHODS.BANK_ACCOUNT)}
                            wrapperStyle={styles.pr15}
                        />
                        <MenuItem
                            title={this.props.translate('common.debitCard')}
                            icon={Expensicons.CreditCard}
                            onPress={() => this.addPaymentMethodTypePressed(CONST.PAYMENT_METHODS.DEBIT_CARD)}
                            wrapperStyle={styles.pr15}
                        />
                        {!this.props.payPalMeUsername && (
                            <MenuItem
                                title={this.props.translate('common.payPalMe')}
                                icon={Expensicons.PayPal}
                                onPress={() => this.addPaymentMethodTypePressed(CONST.PAYMENT_METHODS.PAYPAL)}
                                wrapperStyle={styles.pr15}
                            />
                        )}
                    </Popover>
                )}
            </>
        );
    }
}

AddPaymentMethodMenu.propTypes = propTypes;
AddPaymentMethodMenu.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        payPalMeUsername: {
            key: ONYXKEYS.NVP_PAYPAL_ME_ADDRESS,
        },
    }),
)(AddPaymentMethodMenu);
