import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import * as Expensicons from './Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import withWindowDimensions from './withWindowDimensions';
import Permissions from '../libs/Permissions';
import PopoverMenu from './PopoverMenu';
import refPropTypes from './refPropTypes';

const propTypes = {
    /** Should the component be visible? */
    isVisible: PropTypes.bool.isRequired,

    /** Callback to execute when the component closes. */
    onClose: PropTypes.func.isRequired,

    /** Anchor position for the AddPaymentMenu. */
    anchorPosition: PropTypes.shape({
        horizontal: PropTypes.number,
        vertical: PropTypes.number,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Popover anchor ref */
    anchorRef: refPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    anchorPosition: {},
    betas: [],
    anchorRef: () => {},
};

function AddPaymentMethodMenu(props) {
    return (
        <PopoverMenu
            isVisible={props.isVisible}
            onClose={props.onClose}
            anchorPosition={props.anchorPosition}
            anchorRef={props.anchorRef}
            onItemSelected={props.onClose}
            menuItems={[
                {
                    text: props.translate('common.bankAccount'),
                    icon: Expensicons.Bank,
                    onSelected: () => {
                        props.onItemSelected(CONST.PAYMENT_METHODS.BANK_ACCOUNT);
                    },
                },
                ...(Permissions.canUseWallet(props.betas)
                    ? [
                          {
                              text: props.translate('common.debitCard'),
                              icon: Expensicons.CreditCard,
                              onSelected: () => props.onItemSelected(CONST.PAYMENT_METHODS.DEBIT_CARD),
                          },
                      ]
                    : []),
            ]}
            withoutOverlay
        />
    );
}

AddPaymentMethodMenu.propTypes = propTypes;
AddPaymentMethodMenu.defaultProps = defaultProps;
AddPaymentMethodMenu.displayName = 'AddPaymentMethodMenu';

export default compose(
    withWindowDimensions,
    withLocalize,
    withOnyx({
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(AddPaymentMethodMenu);
