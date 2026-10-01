/** Pays bills and received invoices without depending on a parent room. */

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {payBill} from '@libs/actions/BillPay';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import {useLockedAccountActions, useLockedAccountState} from './LockedAccountModalProvider';
import OfflineWithFeedback from './OfflineWithFeedback';
import {useSearchQueryContext} from './Search/SearchContext';

type BillPaymentButtonProps = {
    report: OnyxEntry<Report>;
    isDisabled?: boolean;
    searchHash?: number;
};

function BillPaymentButton({report, isDisabled = false, searchHash}: BillPaymentButtonProps) {
    const {currentSearchKey} = useSearchQueryContext();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bank', 'Cash']);
    const [bankAccounts] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const pay = (paymentMethod: PaymentMethodType, bankAccountID?: number) => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        payBill(report, paymentMethod, bankAccountID, searchHash, currentSearchKey);
    };
    const bankOptions = Object.values(bankAccounts ?? {})
        .filter(
            (bank) =>
                bank.accountData?.allowDebit &&
                bank.accountData.state === CONST.BANK_ACCOUNT.STATE.OPEN &&
                bank.bankCurrency === CONST.CURRENCY.USD &&
                !bank.isExpensifyCardSettlementAccount,
        )
        .map((bank) => ({
            text: bank.title ?? bank.description ?? '',
            description: bank.description,
            icon: icons.Bank,
            onSelected: () => pay(CONST.IOU.PAYMENT_TYPE.EXPENSIFY, bank.accountData?.bankAccountID ?? bank.methodID),
        }));

    return (
        <OfflineWithFeedback
            errors={report?.errorFields?.reimbursed}
            pendingAction={report?.pendingFields?.reimbursed}
        >
            <ButtonWithDropdownMenu
                customText={translate('iou.pay')}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                isSplitButton={false}
                shouldAlwaysShowDropdownMenu
                isDisabled={isDisabled || !!report?.pendingFields?.reimbursed}
                isLoading={!!report?.pendingFields?.reimbursed}
                onPress={() => {}}
                options={[
                    {
                        text: translate('billPay.payByACH'),
                        value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                        icon: icons.Bank,
                        disabled: report?.currency !== CONST.CURRENCY.USD,
                        subMenuItems: [
                            ...bankOptions,
                            {
                                text: translate('bankAccount.addBankAccount'),
                                icon: icons.Bank,
                                onSelected: () =>
                                    Navigation.navigate(
                                        report?.type === CONST.REPORT.TYPE.BILL && report.policyID
                                            ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: report.policyID})
                                            : ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(),
                                    ),
                            },
                        ],
                    },
                    {
                        text: translate('billPay.markAsPaid'),
                        value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        icon: icons.Cash,
                        onSelected: () => pay(CONST.IOU.PAYMENT_TYPE.ELSEWHERE),
                    },
                ]}
            />
        </OfflineWithFeedback>
    );
}

export default BillPaymentButton;
