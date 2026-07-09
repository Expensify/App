import {usePersonalDetails, useSession} from '@components/OnyxListItemProvider';
import {useSearchQueryContext, useSearchResultsContext, useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import SearchReportsMergeReportsListItem from '@components/Search/SearchList/ListItem/SearchReportsMergeReportsListItem';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useHydrateReportsFromSnapshot from '@hooks/useHydrateSnapshotReport';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalPolicy from '@hooks/usePersonalPolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import {mergeReports} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import {getMoneyRequestSpendBreakdown, getPersonalDetailsForAccountID} from '@libs/ReportUtils';

import StepScreenWrapper from '@pages/iou/request/step/StepScreenWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';

import React, {useMemo, useRef, useState} from 'react';

function SearchReportsMergeReports() {
    const {selectedReports} = useSearchSelectionContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();
    const {currentSearchResults} = useSearchResultsContext();
    const {currentSearchHash, currentSearchQueryJSON} = useSearchQueryContext();

    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [allPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}`);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);

    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const session = useSession();
    const personalDetails = usePersonalDetails();
    const personalPolicy = usePersonalPolicy();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [destinationReportID, setDestinationReportID] = useState<string | undefined>();
    const isMergingRef = useRef(false);

    useHydrateReportsFromSnapshot(currentSearchResults, allReports, allTransactions ?? {}, selectedReports);

    const allReportsTransactions: Record<string, Transaction[]> = useMemo(() => {
        const snapshotData = currentSearchResults?.data;
        if (!snapshotData) {
            return {};
        }
        const selectedReportIDSet = new Set(selectedReports.map((report) => report.reportID));
        const addedTransactionIDSet = new Set<string>();

        const isTransaction = (key: string, value: unknown): value is Transaction =>
            key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) && typeof value === 'object' && value !== null && 'transactionID' in value;
        const result: Record<string, Transaction[]> = {};
        for (const [key, value] of Object.entries(snapshotData)) {
            if (!isTransaction(key, value)) {
                continue;
            }
            const transaction = value;
            if (!transaction?.reportID || !selectedReportIDSet.has(transaction.reportID)) {
                continue;
            }
            addedTransactionIDSet.add(transaction.transactionID);
            result[transaction.reportID] = [...(result[transaction.reportID] ?? []), transaction];
        }

        // We need to iterate through `allTransactions` because expenses created offline are not available in the `snapshot_` data.
        for (const transaction of Object.values(allTransactions ?? {})) {
            if (!transaction?.reportID || !selectedReportIDSet.has(transaction.reportID) || addedTransactionIDSet.has(transaction.transactionID)) {
                continue;
            }
            result[transaction.reportID] = [...(result[transaction.reportID] ?? []), transaction];
        }
        return result;
    }, [currentSearchResults?.data, selectedReports, allTransactions]);

    const reportItems = useMemo(() => {
        if (!selectedReports || currentSearchQueryJSON?.type !== CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT) {
            return [];
        }
        return selectedReports
            .map(({reportID}) => {
                const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                if (!report || !reportID) {
                    return undefined;
                }
                const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(report);
                return {
                    ...report,
                    groupedBy: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                    keyForList: reportID,
                    text: report.reportName ?? '',
                    isSelected: reportID === destinationReportID,
                    policyID: report.policyID,
                    from: getPersonalDetailsForAccountID(report.ownerAccountID, personalDetails) ?? {},
                    to: getPersonalDetailsForAccountID(report.managerID, personalDetails) ?? {},
                    totalDisplaySpend,
                    nonReimbursableSpend,
                    reimbursableSpend,
                };
            })
            .filter((item) => !!item);
    }, [selectedReports, allReports, destinationReportID, personalDetails, currentSearchQueryJSON?.type]);

    const handleConfirm = () => {
        if (!destinationReportID || isMergingRef.current) {
            return;
        }

        const destinationReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${destinationReportID}`];
        const policyID = destinationReport?.policyID;
        const sourceReportIDs = selectedReports.map((r) => r.reportID).filter((id): id is string => !!id && id !== destinationReportID);
        isMergingRef.current = true;

        mergeReports({
            destinationReportID,
            sourceReportIDs,
            isASAPSubmitBetaEnabled,
            accountID: session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            email: session?.email ?? '',
            policy: policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined,
            reportNextStep: allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${destinationReportID}`],
            policyCategories: policyID ? allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`] : undefined,
            policyTagList: policyID ? (allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {}) : {},
            allTransactionViolation: transactionViolations,
            allReports: allReports ?? {},
            allReportsTransactions,
            bankAccountList,
            hash: currentSearchHash,
            personalPolicyOutputCurrency: personalPolicy?.outputCurrency,
        });

        Navigation.goBack(undefined, {
            afterTransition: () => {
                clearSelectedTransactions();
                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: destinationReportID}));
            },
        });
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.confirm'),
        onConfirm: handleConfirm,
        isDisabled: !destinationReportID,
    };

    const onSelection = (item: ListItem) => {
        setDestinationReportID(item.reportID);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('search.mergeReports.title')}
            onBackButtonPress={() => Navigation.goBack()}
            shouldShowWrapper
            testID="SearchReportsMergeReport"
            includeSafeAreaPaddingBottom
        >
            <Text style={[styles.ph5, styles.pb5, styles.textLabelSupporting]}>{translate('search.mergeReports.description')}</Text>
            <SelectionList
                data={reportItems}
                onSelectRow={onSelection}
                ListItem={SearchReportsMergeReportsListItem}
                isRowMultilineSupported
                shouldSingleExecuteRowSelect
                canSelectMultiple={false}
                confirmButtonOptions={confirmButtonOptions}
            />
        </StepScreenWrapper>
    );
}

SearchReportsMergeReports.displayName = 'SearchReportsMergeReports';

export default SearchReportsMergeReports;
