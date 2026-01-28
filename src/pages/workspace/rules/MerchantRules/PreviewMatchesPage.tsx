import {useCallback, useEffect} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {getTransactionsMatchingCodingRule} from '@libs/actions/Policy/Rules';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isOpenExpenseReport} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {MerchantRuleForm} from '@src/types/form';
import type {Report, Transaction} from '@src/types/onyx';

type PreviewMatchesPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_PREVIEW_MATCHES>;

const merchantRuleFormSelector = (form: OnyxEntry<MerchantRuleForm>) => form?.merchantToMatch ?? '';

function PreviewMatchesPage({route}: PreviewMatchesPageProps) {
    const policyID = route.params.policyID;
    const [merchant = ''] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true, selector: merchantRuleFormSelector});

    const matchingReportIDsSelector = useCallback(
        (reports: OnyxCollection<Report>) => {
            return Object.values(reports ?? {}).reduce((matchingReports, report) => {
                if (!report) {
                    return matchingReports;
                }

                const reportPolicyID = report?.policyID;
                const isOpen = isOpenExpenseReport(report);

                if (isOpen && reportPolicyID === policyID) {
                    matchingReports.add(report.reportID);
                }
                return matchingReports;
            }, new Set<string>());
        },
        [policyID],
    );

    const [matchingReportIDs] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true, selector: matchingReportIDsSelector});

    const matchingTransactionsSelector = useCallback(
        (transactions: OnyxCollection<Transaction>) => {
            return Object.values(transactions ?? {}).reduce((matchingTransactions, transaction) => {
                const transactionReportID = transaction?.reportID;

                if (!transactionReportID) {
                    return matchingTransactions;
                }

                if (!matchingReportIDs?.has(transactionReportID)) {
                    return matchingTransactions;
                }

                // This merchant matching logic should match
                // https://github.com/Expensify/Web-Expensify/blob/fcdbe59e80ecaa4a63f0c4a2779b2aa6c9b1d165/lib/ExpenseRule.php#L54-L59
                const transactionMerchant = (transaction?.modifiedMerchant ?? transaction?.merchant ?? '').replaceAll(/\s+/g, ' ');
                const hasMatchingMerchant = new RegExp(merchant, 'i').test(transactionMerchant);

                if (hasMatchingMerchant) {
                    matchingTransactions.add(transaction);
                }

                return matchingTransactions;
            }, new Set<Transaction>());
        },
        [matchingReportIDs, merchant],
    );

    const [matchingTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true, selector: matchingTransactionsSelector});

    useEffect(() => {
        getTransactionsMatchingCodingRule({merchant, policyID});
    }, [merchant, policyID]);

    return <></>;
}

PreviewMatchesPage.displayName = 'PreviewMatchesPage';

export default PreviewMatchesPage;
