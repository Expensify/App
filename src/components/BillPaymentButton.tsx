/** Pays a bill from its report header. A bill has no parent chat, so it can't use SettlementButton. */
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearBillPaymentError, payBill} from '@libs/actions/BillPay';
import Navigation from '@libs/Navigation/Navigation';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {formatPaymentMethods} from '@libs/PaymentUtils';
import {getReimbursableTotal} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BankAccountList, Report} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import type {DropdownOption} from './ButtonWithDropdownMenu/types';

import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import {useLockedAccountActions, useLockedAccountState} from './LockedAccountModalProvider';
import OfflineWithFeedback from './OfflineWithFeedback';

type BillPaymentButtonProps = {
    /** The bill to pay */
    report: OnyxEntry<Report>;

    isDisabled?: boolean;
};

/**
 * An ACH payment debits the payer's account in USD, so only open USD accounts that allow debits can pay. The
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

function BillPaymentButton({report, isDisabled = false}: BillPaymentButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Bank', 'CheckCircle']);
    const {convertToDisplayString, getCurrencyDecimals} = useCurrencyListActions();
    const delegateAccountID = useDelegateAccountID();
    const [payableBankAccounts] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: payableBankAccountsSelector});
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const pay = async (paymentMethod: PaymentMethodType, bankAccountID?: number) => {
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        const [introSelected, rules] = await Onyx.multiGet([ONYXKEYS.NVP_INTRO_SELECTED, ONYXKEYS.COLLECTION.RULE]);
        payBill({
            report,
            paymentMethodType: paymentMethod,
            bankAccountID,
            accountNumber: bankAccountID ? payableBankAccounts?.[bankAccountID]?.accountData?.accountNumber : undefined,
            getCurrencyDecimals,
            delegateAccountID,
            isTrackIntentUser: isTrackOnboardingChoice(introSelected?.choice),
            rules,
        });
    };

    const markAsPaidOption: DropdownOption<string> = {
        text: translate('billPay.markAsPaid'),
        value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        icon: icons.CheckCircle,
        onSelected: () => pay(CONST.IOU.PAYMENT_TYPE.ELSEWHERE),
    };

    // ACH payments are only in USD, so bills in other currencies can only be marked as paid.
    let options: Array<DropdownOption<string>> = [markAsPaidOption];
    if (report?.currency === CONST.CURRENCY.USD) {
        const bankAccounts = formatPaymentMethods(payableBankAccounts ?? {}, {}, styles, translate);

        // Each business bank account pays by ACH, shown like the business bank accounts on expense reports. Without one,
        // the payer starts adding a business bank account to the bill's policy.
        const businessBankAccountOptions: Array<DropdownOption<string>> =
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
                      onSelected: () => pay(CONST.IOU.PAYMENT_TYPE.VBBA, bank.methodID),
                  }))
                : [
                      {
                          text: translate('iou.settleBusiness'),
                          value: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                          icon: icons.Bank,
                          onSelected: () =>
                              Navigation.navigate(
                                  report?.policyID ? ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute({policyID: report.policyID}) : ROUTES.SETTINGS_ADD_BANK_ACCOUNT.getRoute(),
                              ),
                      },
                  ];
        options = [...businessBankAccountOptions, markAsPaidOption];
    }

    return (
        <OfflineWithFeedback
            errors={report?.errorFields?.reimbursed}
            pendingAction={report?.pendingFields?.reimbursed}
            onClose={() => {
                if (!report?.reportID) {
                    return;
                }
                clearBillPaymentError(report.reportID);
            }}
        >
            <ButtonWithDropdownMenu
                customText={translate('iou.settlePayment', convertToDisplayString(Math.abs(getReimbursableTotal(report)), report?.currency))}
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                isSplitButton={false}
                shouldAlwaysShowDropdownMenu
                isDisabled={isDisabled || !!report?.pendingFields?.reimbursed}
                isLoading={!!report?.pendingFields?.reimbursed}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.PAY_BILL_BUTTON}
                // shouldAlwaysShowDropdownMenu opens the menu on every press, so the button has no action of its own
                onPress={() => {}}
                options={options}
            />
        </OfflineWithFeedback>
    );
}

export default BillPaymentButton;
