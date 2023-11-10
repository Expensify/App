import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import compose from '@libs/compose';
import Permissions from '@libs/Permissions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as ReportActionsUtils from '../libs/ReportActionsUtils';
import * as ReportUtils from '../libs/ReportUtils';
import iouReportPropTypes from '../pages/iouReportPropTypes';
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

    /** The IOU/Expense report we are paying */
    iouReport: iouReportPropTypes,

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

    /** Session info for the currently logged in user. */
    session: PropTypes.shape({
        /** Currently logged in user accountID */
        accountID: PropTypes.number,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    iouReport: {},
    anchorPosition: {},
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    betas: [],
    anchorRef: () => {},
    session: {
        accountID: 0,
    },
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
                ...(ReportUtils.isIOUReport(props.iouReport)
                    ? [
                          {
                              text: props.translate('common.personalBankAccount'),
                              icon: Expensicons.Bank,
                              onSelected: () => {
                                  props.onItemSelected(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
                              },
                          },
                      ]
                    : []),
                ...(!ReportActionsUtils.hasRequestFromCurrentAccount(lodashGet(props.iouReport, 'reportID', 0), props.session.accountID)
                    ? [
                          {
                              text: props.translate('common.businessBankAccount'),
                              icon: Expensicons.Building,
                              onSelected: () => props.onItemSelected(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT),
                          },
                      ]
                    : []),
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
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(AddPaymentMethodMenu);
