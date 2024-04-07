import type {RefObject} from 'react';
import React from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnchorPosition} from '@src/styles';
import type {Report, Session} from '@src/types/onyx';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import * as Expensicons from './Icon/Expensicons';
import type {PaymentMethod} from './KYCWall/types';
import PopoverMenu from './PopoverMenu';

type AddPaymentMethodMenuOnyxProps = {
    /** Session info for the currently logged-in user. */
    session: OnyxEntry<Session>;
};

type AddPaymentMethodMenuProps = AddPaymentMethodMenuOnyxProps & {
    /** Should the component be visible? */
    isVisible: boolean;

    /** Callback to execute when the component closes. */
    onClose: () => void;

    /** Callback to execute when the payment method is selected. */
    onItemSelected: (paymentMethod: PaymentMethod) => void;

    /** The IOU/Expense report we are paying */
    iouReport?: OnyxEntry<Report> | EmptyObject;

    /** Anchor position for the AddPaymentMenu. */
    anchorPosition: AnchorPosition;

    /** Where the popover should be positioned relative to the anchor points. */
    anchorAlignment?: AnchorAlignment;

    /** Popover anchor ref */
    anchorRef: RefObject<View | HTMLDivElement>;

    /** Whether the personal bank account option should be shown */
    shouldShowPersonalBankAccountOption?: boolean;
};

function AddPaymentMethodMenu({
    isVisible,
    onClose,
    anchorPosition,
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    anchorRef,
    iouReport,
    onItemSelected,
    session,
    shouldShowPersonalBankAccountOption = false,
}: AddPaymentMethodMenuProps) {
    const {translate} = useLocalize();

    // Users can choose to pay with business bank account in case of Expense reports or in case of P2P IOU report
    // which then starts a bottom up flow and creates a Collect workspace where the payer is an admin and payee is an employee.
    const isIOUReport = ReportUtils.isIOUReport(iouReport ?? {});
    const canUseBusinessBankAccount =
        ReportUtils.isExpenseReport(iouReport ?? {}) || (isIOUReport && !ReportActionsUtils.hasRequestFromCurrentAccount(iouReport?.reportID ?? '', session?.accountID ?? 0));

    const canUsePersonalBankAccount = shouldShowPersonalBankAccountOption || isIOUReport;

    return (
        <PopoverMenu
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            anchorAlignment={anchorAlignment}
            anchorRef={anchorRef}
            onItemSelected={onClose}
            menuItems={[
                ...(canUsePersonalBankAccount
                    ? [
                          {
                              text: translate('common.personalBankAccount'),
                              icon: Expensicons.Bank,
                              onSelected: () => {
                                  onItemSelected(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
                              },
                          },
                      ]
                    : []),
                ...(canUseBusinessBankAccount
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

AddPaymentMethodMenu.displayName = 'AddPaymentMethodMenu';

export default withOnyx<AddPaymentMethodMenuProps, AddPaymentMethodMenuOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(AddPaymentMethodMenu);
