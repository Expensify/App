/** Pays bills and received invoices without depending on a parent room. */

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {payBill} from '@libs/actions/BillPay';
import {isBillReport} from '@libs/BillPayUtils';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList, Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import {useLockedAccountActions, useLockedAccountState} from './LockedAccountModalProvider';
import OfflineWithFeedback from './OfflineWithFeedback';
import {useSearchQueryContext} from './Search/SearchContext';

type BillPaymentButtonProps = {
    /** The bill or received invoice to pay */
    report: OnyxEntry<Report>;

    /** Whether the button is disabled */
    isDisabled?: boolean;

    /** Hash of the Search snapshot to update when the user pays from Search. Undefined outside Search. */
    searchHash?: number;
};

type PayableBankAccount = {
    bankAccountID: number | undefined;
    title: string;
    description: string | undefined;
};

/**
 * ReimburseReport debits the payer's account by ACH in USD, so only open USD accounts that allow debits can pay. The
 * Expensify Card settlement account only settles card spend.
 */
function payableBankAccountsSelector(bankAccounts: OnyxEntry<BankAccountList>): PayableBankAccount[] {
    return Object.values(bankAccounts ?? {})
        .filter(
            (bank) =>
                bank.accountData?.allowDebit &&
                bank.accountData.state === CONST.BANK_ACCOUNT.STATE.OPEN &&
                bank.bankCurrency === CONST.CURRENCY.USD &&
                !bank.isExpensifyCardSettlementAccount &&
                !!(bank.accountData?.bankAccountID ?? bank.methodID),
        )
        .map((bank) => ({
            bankAccountID: bank.accountData?.bankAccountID ?? bank.methodID,
            title: bank.title ?? bank.description ?? '',
            description: bank.description,
        }));
}

function BillPaymentButton({report, isDisabled = false, searchHash}: BillPaymentButtonProps) {
    const {currentSearchKey} = useSearchQueryContext();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bank', 'Cash']);
    const [payableBankAccounts = getEmptyArray<PayableBankAccount>()] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: payableBankAccountsSelector});
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
    const bankOptions = payableBankAccounts.map((bank) => ({
        text: bank.title,
        description: bank.description,
        icon: icons.Bank,
        onSelected: () => pay(CONST.IOU.PAYMENT_TYPE.EXPENSIFY, bank.bankAccountID),
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
                // shouldAlwaysShowDropdownMenu opens the menu on every press, so the button has no action of its own
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
                                        isBillReport(report) && report?.policyID
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
