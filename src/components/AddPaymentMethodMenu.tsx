import type {RefObject} from 'react';
import React, {useEffect, useState} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import {completePaymentOnboarding} from '@libs/actions/IOU';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnchorPosition} from '@src/styles';
import type {Report, Session} from '@src/types/onyx';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import * as Expensicons from './Icon/Expensicons';
import type {PaymentMethod} from './KYCWall/types';
import type BaseModalProps from './Modal/types';
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
    iouReport?: OnyxEntry<Report>;

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
    const [restoreFocusType, setRestoreFocusType] = useState<BaseModalProps['restoreFocusType']>();

    // Users can choose to pay with business bank account in case of Expense reports or in case of P2P IOU report
    // which then starts a bottom up flow and creates a Collect workspace where the payer is an admin and payee is an employee.
    const isIOUReport = ReportUtils.isIOUReport(iouReport);
    const canUseBusinessBankAccount =
        ReportUtils.isExpenseReport(iouReport) || (isIOUReport && !ReportActionsUtils.hasRequestFromCurrentAccount(iouReport?.reportID ?? '-1', session?.accountID ?? -1));

    const canUsePersonalBankAccount = shouldShowPersonalBankAccountOption || isIOUReport;

    const isPersonalOnlyOption = canUsePersonalBankAccount && !canUseBusinessBankAccount;

    // We temporarily disabled P2P debit cards so we will automatically select the personal bank account option if there is no other option to select.
    useEffect(() => {
        if (!isVisible || !isPersonalOnlyOption) {
            return;
        }

        completePaymentOnboarding(CONST.PAYMENT_SELECTED.PBA);
        onItemSelected(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
    }, [isPersonalOnlyOption, isVisible, onItemSelected]);

    if (isPersonalOnlyOption) {
        return null;
    }

    return (
        <PopoverMenu
            isVisible={isVisible}
            onClose={() => {
                setRestoreFocusType(undefined);
                onClose();
            }}
            anchorPosition={anchorPosition}
            anchorAlignment={anchorAlignment}
            anchorRef={anchorRef}
            onItemSelected={() => {
                setRestoreFocusType(CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE);
                onClose();
            }}
            menuItems={[
                ...(canUsePersonalBankAccount
                    ? [
                          {
                              text: translate('common.personalBankAccount'),
                              icon: Expensicons.Bank,
                              onSelected: () => {
                                  completePaymentOnboarding(CONST.PAYMENT_SELECTED.PBA);
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
                              onSelected: () => {
                                  completePaymentOnboarding(CONST.PAYMENT_SELECTED.BBA);
                                  onItemSelected(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT);
                              },
                          },
                      ]
                    : []),
                // Adding a debit card for P2P payments is temporarily disabled
                // ...[
                //     {
                //         text: translate('common.debitCard'),
                //         icon: Expensicons.CreditCard,
                //         onSelected: () => onItemSelected(CONST.PAYMENT_METHODS.DEBIT_CARD),
                //     },
                // ],
            ]}
            withoutOverlay
            shouldEnableNewFocusManagement
            restoreFocusType={restoreFocusType}
        />
    );
}

AddPaymentMethodMenu.displayName = 'AddPaymentMethodMenu';

export default withOnyx<AddPaymentMethodMenuProps, AddPaymentMethodMenuOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(AddPaymentMethodMenu);
