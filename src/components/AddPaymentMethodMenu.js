import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import compose from '@libs/compose';
import Permissions from '@libs/Permissions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as Expensicons from './Icon/Expensicons';
import PopoverMenu from './PopoverMenu';
import refPropTypes from './refPropTypes';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import withWindowDimensions from './withWindowDimensions';

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

    /** Where the popover should be positioned relative to the anchor points. */
    anchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Popover anchor ref */
    anchorRef: refPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    anchorPosition: {},
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    betas: [],
    anchorRef: () => {},
};

function AddPaymentMethodMenu(props) {
    return (
        <PopoverMenu
            isVisible={props.isVisible}
            onClose={props.onClose}
            anchorPosition={props.anchorPosition}
            anchorAlignment={props.anchorAlignment}
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
