import React, {useMemo} from 'react';
import {InteractionManager} from 'react-native';
import {useSession} from '@components/OnyxListItemProvider';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem} from '@components/SelectionList/types';
import useOnyx from '@hooks/useOnyx';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import IOURequestEditReportCommon from '@pages/iou/request/step/IOURequestEditReportCommon';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

function SearchTransactionsChangeReport() {
    const {selectedTransactions, clearSelectedTransactions} = useSearchContext();
    const selectedTransactionsKeys = useMemo(() => Object.keys(selectedTransactions), [selectedTransactions]);

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const transactionsReports = useMemo(() => {
        const reports = Object.values(selectedTransactions).reduce((acc, transaction) => {
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`];
            if (report) {
                acc.add(report);
            }
            return acc;
        }, new Set<Report>());
        return [...reports];
    }, [allReports, selectedTransactions]);
    const [allBetas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const isASAPSubmitBetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, allBetas);
    const session = useSession();

    const selectReport = (item: TransactionGroupListItem) => {
        if (selectedTransactionsKeys.length === 0) {
            return;
        }

        const reportNextStep = allReportNextSteps?.[`${ONYXKEYS.COLLECTION.NEXT_STEP}${item.value}`];
        changeTransactionsReport(
            selectedTransactionsKeys,
            item.value,
            isASAPSubmitBetaEnabled,
            session?.accountID ?? CONST.DEFAULT_NUMBER_ID,
            session?.email ?? '',
            allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${item.policyID}`],
            reportNextStep,
        );
        InteractionManager.runAfterInteractions(() => {
            clearSelectedTransactions();
        });

        Navigation.goBack();
    };

    const removeFromReport = () => {
        if (!transactionsReports || selectedTransactionsKeys.length === 0) {
            return;
        }
        changeTransactionsReport(selectedTransactionsKeys, CONST.REPORT.UNREPORTED_REPORT_ID, isASAPSubmitBetaEnabled, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
        clearSelectedTransactions();
        Navigation.goBack();
    };

    return (
        <IOURequestEditReportCommon
            backTo={undefined}
            transactionsReports={transactionsReports}
            transactionIds={selectedTransactionsKeys}
            selectReport={selectReport}
            removeFromReport={removeFromReport}
            isEditing
        />
    );
}

SearchTransactionsChangeReport.displayName = 'SearchTransactionsChangeReport';

export default SearchTransactionsChangeReport;
