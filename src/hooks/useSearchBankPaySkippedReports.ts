/**
 * Decides which reports selected in Search a bulk bank payment leaves out because nothing on them is owed,
 * and shows the alert telling the user why they weren't paid.
 */
import {getPolicyFromSearchSnapshot, getReportFromSearchSnapshot} from '@libs/actions/Search';
import {getBankPaySkippedReports, isSelectedReportBankPayBlocked} from '@libs/BulkPaySkippedReportsUtils';
import deferModalPresentationAfterPopoverDismiss from '@libs/deferModalPresentationAfterPopoverDismiss';
import {getReportName} from '@libs/ReportNameUtils';
import {getTransactionsByReportID} from '@libs/SearchUIUtils';

import type {BankAccountList, LastPaymentMethod, Policy, Report, ReportAttributesDerivedValue} from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useBankPaySkippedModal from './useBankPaySkippedModal';
import useLocalize from './useLocalize';

type UseSearchBankPaySkippedReportsParams = {
    /** The selected reports a bulk payment pays, or the selected expenses when no report is selected */
    bulkPaySelectedOptions: Array<{reportID?: string}>;

    /** Whether everything matching the search is selected, which the backend pays and skips reports for on its own */
    areAllMatchingItemsSelected: boolean;

    /** The workspace whose bank account the alert names when none was picked */
    policyID: string | undefined;

    searchData: SearchResultDataType | undefined;
    allReports: OnyxCollection<Report>;
    policies: OnyxCollection<Policy>;
    personalPolicyID: OnyxEntry<string>;
    lastPaymentMethods: OnyxEntry<LastPaymentMethod>;
    bankAccountList: OnyxEntry<BankAccountList>;
};

type GetSkippedReportsForPaymentParams = {
    /** The payment method picked. Each report falls back to its workspace's last one when none was picked */
    paymentMethod: PaymentMethodType | undefined;

    /** Whether the payment is an ABA file, a bank payment even though it's sent as paid elsewhere */
    isABAPayment: boolean;

    /** The bank account picked to pay with, which the alert names */
    bankAccountID: number | undefined;
};

function useSearchBankPaySkippedReports({
    bulkPaySelectedOptions,
    areAllMatchingItemsSelected,
    policyID,
    searchData,
    allReports,
    policies,
    personalPolicyID,
    lastPaymentMethods,
    bankAccountList,
}: UseSearchBankPaySkippedReportsParams) {
    const {translate} = useLocalize();
    const {showBankPaySkippedModal} = useBankPaySkippedModal({bankAccountList});

    // A bank payment of this selection would pay none of it, so it explains why before asking for account validation or bank setup.
    // The backend pays a "Select all" selection itself, and only skips the reports with a negative total there.
    const transactionsByReportID = getTransactionsByReportID(searchData ?? {});
    const isBankPayBlockedForSelection =
        !areAllMatchingItemsSelected &&
        bulkPaySelectedOptions.length > 0 &&
        bulkPaySelectedOptions.every((item) =>
            isSelectedReportBankPayBlocked(getReportFromSearchSnapshot(item.reportID, searchData, allReports), searchData, policies, transactionsByReportID),
        );

    const getSkippedReportsForPayment = ({paymentMethod, isABAPayment, bankAccountID}: GetSkippedReportsForPaymentParams) => {
        const skippedReportsByID = getBankPaySkippedReports({
            reportIDs: bulkPaySelectedOptions.map((item) => item.reportID),
            paymentMethod,
            isABAPayment,
            searchData,
            allReports,
            policies,
            personalPolicyID,
            lastPaymentMethods,
        });

        const showModal = (skippedReportNames?: string[]) =>
            // Bulk pay runs while the pay popover is still dismissing, and iOS can't present a modal until it's gone
            deferModalPresentationAfterPopoverDismiss(() => {
                showBankPaySkippedModal({bankAccountID, policy: getPolicyFromSearchSnapshot(policyID, searchData, policies), isABAPayment, skippedReportNames});
            });

        return {
            skippedReportsByID,
            isEveryReportSkipped: skippedReportsByID.size > 0 && bulkPaySelectedOptions.every((item) => !!item.reportID && skippedReportsByID.has(item.reportID)),

            /** Explains why none of the selected reports were paid */
            showAllReportsSkipped: () => showModal(),

            /** Lists the skipped reports after the others were paid, by the names shown everywhere else */
            showSkippedReports: (reportAttributes: OnyxEntry<ReportAttributesDerivedValue>) =>
                showModal([...skippedReportsByID].map(([reportID, report]) => getReportName(report, reportAttributes?.reports?.[reportID]?.reportName) || translate('common.report'))),
        };
    };

    return {isBankPayBlockedForSelection, getSkippedReportsForPayment};
}

export default useSearchBankPaySkippedReports;
