import React from 'react';
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

const propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number,
    }),

    /** Username for PayPal.Me */
    payPalMeUsername: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    anchorPosition: {},
    payPalMeUsername: '',
};

const AddPaymentMethodMenu = props => (
    <Popover
        isVisible={props.isVisible}
        onClose={props.onClose}
        anchorPosition={props.anchorPosition}
    >
        <MenuItem
            title={props.translate('common.bankAccount')}
            icon={Expensicons.Bank}
            onPress={() => props.onItemSelected(CONST.PAYMENT_METHODS.BANK_ACCOUNT)}
            wrapperStyle={styles.pr15}
        />
        <MenuItem
            title={props.translate('common.debitCard')}
            icon={Expensicons.CreditCard}
            onPress={() => props.onItemSelected(CONST.PAYMENT_METHODS.DEBIT_CARD)}
            wrapperStyle={styles.pr15}
        />
        {!props.payPalMeUsername && (
            <MenuItem
                title={props.translate('common.payPalMe')}
                icon={Expensicons.PayPal}
                onPress={() => props.onItemSelected(CONST.PAYMENT_METHODS.PAYPAL)}
                wrapperStyle={styles.pr15}
            />
        )}
    </Popover>
);

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
