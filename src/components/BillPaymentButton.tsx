/** Pays bills and received invoices without depending on a parent room. */

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {payBill} from '@libs/actions/BillPay';
import {isBillReport} from '@libs/BillPayUtils';
import Navigation from '@libs/Navigation/Navigation';
import {formatPaymentMethods} from '@libs/PaymentUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList, Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

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

/**
 * ReimburseReport debits the payer's account by ACH in USD, so only open USD accounts that allow debits can pay. The
 * Expensify Card settlement account only settles card spend.
 */
function payableBankAccountsSelector(bankAccounts: OnyxEntry<BankAccountList>): BankAccountList {
    return Object.fromEntries(
        Object.entries(bankAccounts ?? {}).filter(
            ([, bank]) =>
                bank.accountData?.allowDebit &&
                bank.accountData.state === CONST.BANK_ACCOUNT.STATE.OPEN &&
                bank.bankCurrency === CONST.CURRENCY.USD &&
                !bank.isExpensifyCardSettlementAccount &&
                !bank.accountData?.isExpensifyCardSettlementAccount &&
                !!bank.methodID,
        ),
    );
}

function BillPaymentButton({report, isDisabled = false, searchHash}: BillPaymentButtonProps) {
    const {currentSearchKey} = useSearchQueryContext();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Bank', 'CheckCircle']);
    const {convertToDisplayString} = useCurrencyListActions();
    const [payableBankAccounts] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: payableBankAccountsSelector});
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
    const bankAccounts = formatPaymentMethods(payableBankAccounts ?? {}, {}, styles, translate);

    // Each business bank account pays by ACH, shown like the business bank accounts on expense reports. Without one, the
    // payer starts adding a business bank account.
    const businessBankAccountOptions =
        bankAccounts.length > 0
            ? bankAccounts.map((bank) => ({
                  text: bank.title ?? '',
                  description: bank.description,
                  icon: typeof bank.icon === 'number' ? icons.Bank : bank.icon,
                  additionalIconStyles: typeof bank.icon === 'number' ? undefined : bank.iconStyles,
                  iconWidth: typeof bank.icon === 'number' ? undefined : bank.iconSize,
                  iconHeight: typeof bank.icon === 'number' ? undefined : bank.iconSize,
                  shouldIgnoreCompactStyle: true,
                  value: `${bank.methodID}`,
                  onSelected: () => pay(CONST.IOU.PAYMENT_TYPE.EXPENSIFY, bank.methodID),
              }))
            : [
                  {
                      text: translate('iou.settleBusiness'),
                      value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                      icon: icons.Bank,
                      onSelected: () =>
                          Navigation.navigate(
                              isBillReport(report) && report?.policyID
                                  ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: report.policyID})
                                  : ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(),
                          ),
                  },
              ];

    return (
        <OfflineWithFeedback
            errors={report?.errorFields?.reimbursed}
            pendingAction={report?.pendingFields?.reimbursed}
        >
            <ButtonWithDropdownMenu
                customText={translate('iou.settlePayment', convertToDisplayString(Math.abs(report?.total ?? 0), report?.currency))}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                isSplitButton={false}
                shouldAlwaysShowDropdownMenu
                isDisabled={isDisabled || !!report?.pendingFields?.reimbursed}
                isLoading={!!report?.pendingFields?.reimbursed}
                // shouldAlwaysShowDropdownMenu opens the menu on every press, so the button has no action of its own
                onPress={() => {}}
                options={[
                    // ReimburseReport pays bills by ACH only in USD, so bills in other currencies can only be marked as paid
                    ...(report?.currency === CONST.CURRENCY.USD ? businessBankAccountOptions : []),
                    {
                        text: translate('billPay.markAsPaid'),
                        value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        icon: icons.CheckCircle,
                        onSelected: () => pay(CONST.IOU.PAYMENT_TYPE.ELSEWHERE),
                    },
                ]}
            />
        </OfflineWithFeedback>
    );
}

export default BillPaymentButton;
