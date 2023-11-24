import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import useLocalize from '@hooks/useLocalize';
import * as ReportUtils from '@libs/ReportUtils';
import iouReportPropTypes from '@pages/iouReportPropTypes';
import CONST from '@src/CONST';
import * as Expensicons from './Icon/Expensicons';
import PopoverMenu from './PopoverMenu';
import refPropTypes from './refPropTypes';
import withWindowDimensions from './withWindowDimensions';

const propTypes = {
    /** Should the component be visible? */
    isVisible: PropTypes.bool.isRequired,

    /** Callback to execute when the component closes. */
    onClose: PropTypes.func.isRequired,

    /** Callback to execute when the payment method is selected. */
    onItemSelected: PropTypes.func.isRequired,

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

    /** Popover anchor ref */
    anchorRef: refPropTypes,
};

const defaultProps = {
    iouReport: {},
    anchorPosition: {},
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    anchorRef: () => {},
};

function AddPaymentMethodMenu({isVisible, onClose, anchorPosition, anchorAlignment, anchorRef, iouReport, onItemSelected}) {
    const {translate} = useLocalize();

    return (
        <PopoverMenu
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            anchorAlignment={anchorAlignment}
            anchorRef={anchorRef}
            onItemSelected={onClose}
            menuItems={[
                ...(ReportUtils.isIOUReport(iouReport)
                    ? [
                          {
                              text: translate('common.personalBankAccount'),
                              icon: Expensicons.Bank,
                              onSelected: () => onItemSelected(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT),
                          },
                      ]
                    : []),
                ...(ReportUtils.isExpenseReport(iouReport)
                    ? [
                          {
                              text: translate('common.businessBankAccount'),
                              icon: Expensicons.Building,
                              onSelected: () => onItemSelected(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT),
                          },
                      ]
                    : []),
                ...[
                    {
                        text: translate('common.debitCard'),
                        icon: Expensicons.CreditCard,
                        onSelected: () => onItemSelected(CONST.PAYMENT_METHODS.DEBIT_CARD),
                    },
                ],
            ]}
            withoutOverlay
        />
    );
}

AddPaymentMethodMenu.propTypes = propTypes;
AddPaymentMethodMenu.defaultProps = defaultProps;
AddPaymentMethodMenu.displayName = 'AddPaymentMethodMenu';

export default withWindowDimensions(AddPaymentMethodMenu);
