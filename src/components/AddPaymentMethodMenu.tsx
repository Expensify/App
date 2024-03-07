import type {RefObject} from 'react';
import React from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Session} from '@src/types/onyx';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import * as Expensicons from './Icon/Expensicons';
import PopoverMenu from './PopoverMenu';

type AddPaymentMethodMenuOnyxProps = {
    session: OnyxEntry<Session>;
};

type AddPaymentMethodMenuProps = AddPaymentMethodMenuOnyxProps & {
    isVisible: boolean;
    onClose: () => void;
    onItemSelected: (paymentMethod: ValueOf<typeof CONST.PAYMENT_METHODS>) => void;
    iouReport?: OnyxEntry<Report>;
    anchorPosition: AnchorPosition;
    anchorAlignment?: AnchorAlignment;
    anchorRef: RefObject<View | HTMLDivElement>;
    shouldShowPersonalBankAccountOption?: boolean;
};

function AddPaymentMethodMenu({
    isVisible,
    onClose,
    anchorPosition,
    anchorAlignment,
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
