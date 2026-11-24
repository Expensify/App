/**
 * Keeps the bank account option on a single report's Pay button when nothing on the report is owed,
 * and explains why picking it can't pay the report instead of hiding the option.
 */
import {isBankPayBlockedBySpend} from '@libs/ReportUtils';

import type {BankAccountList, Policy, Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useBankPaySkippedModal from './useBankPaySkippedModal';

type UseReportBankPaySkippedModalParams = {
    /** The user's bank accounts, so the alert can name the one picked */
    bankAccountList: OnyxEntry<BankAccountList>;

    /** The report the Pay button pays */
    report: OnyxEntry<Report>;

    /** The report's workspace, which decides whether it pays through a bank account and names its account in the alert */
    policy: OnyxEntry<Policy>;

    /** Whether the report can only be marked as paid */
    onlyShowPayElsewhere?: boolean;
};

function useReportBankPaySkippedModal({bankAccountList, report, policy, onlyShowPayElsewhere = false}: UseReportBankPaySkippedModalParams) {
    const {showBankPaySkippedModal} = useBankPaySkippedModal({bankAccountList});
    const isBankPayBlocked = onlyShowPayElsewhere && isBankPayBlockedBySpend(report, policy);

    const showReportBankPaySkippedModal = ({bankAccountID, isABAPayment}: {bankAccountID?: number; isABAPayment?: boolean} = {}) =>
        showBankPaySkippedModal({bankAccountID, policy, isSingleReport: true, isABAPayment});

    return {isBankPayBlocked, showReportBankPaySkippedModal};
}

export default useReportBankPaySkippedModal;
