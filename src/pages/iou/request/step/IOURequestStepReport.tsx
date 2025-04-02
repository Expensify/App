import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {isExpenseReport} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type ReportListItem = ListItem & {
    value: string;
};

type IOURequestStepReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM>;

function IOURequestStepReport({route, transaction}: IOURequestStepReportProps) {
    // TODO: hasForwardedAction
    const {translate} = useLocalize();
    const {backTo} = route.params;
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const reportOptions: ReportListItem[] = useMemo(() => {
        if (!allReports) {
            return [];
        }

        const expenseReports = Object.values(allReports).filter(
            (report) =>
                isExpenseReport(report) &&
                report?.stateNum &&
                report?.statusNum &&
                report?.stateNum <= CONST.REPORT.STATE_NUM.SUBMITTED &&
                report?.statusNum <= CONST.REPORT.STATUS_NUM.SUBMITTED,
        );

        return expenseReports
            .sort((a, b) => a?.reportName?.localeCompare(b?.reportName?.toLowerCase() ?? '') ?? 0)
            .filter((item) => item !== undefined)
            .filter((report) => !debouncedSearchValue || report?.reportName?.toLowerCase().includes(debouncedSearchValue.toLowerCase()))
            .map((report) => ({
                text: report.reportName,
                value: report.reportID,
                keyForList: report.reportID,
            }));
    }, [allReports, debouncedSearchValue]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const selectReport = (item: ReportListItem) => {
        if (!transaction) {
            return;
        }

        // Get the IOU report action for this transaction
        const iouAction = getIOUActionForReportID(transaction.reportID, transaction.transactionID);
        if (!iouAction || !iouAction.childReportID) {
            return;
        }

        // Create the mapping of transaction ID to report action and thread data
        const transactionIDToReportActionAndThreadData = {
            [transaction.transactionID]: iouAction.childReportID,
        };

        changeTransactionsReport([transaction.transactionID], item.value, transactionIDToReportActionAndThreadData);
        Navigation.goBack(backTo);
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('common.report')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepReport.displayName}
            includeSafeAreaPaddingBottom
        >
            <SelectionList
                sections={[{data: reportOptions}]}
                onSelectRow={selectReport}
                textInputValue={searchValue}
                onChangeText={setSearchValue}
                textInputLabel={reportOptions.length > 8 ? translate('common.search') : undefined}
                shouldSingleExecuteRowSelect
                ListItem={UserListItem}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepReport.displayName = 'IOURequestStepReport';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepReport));
