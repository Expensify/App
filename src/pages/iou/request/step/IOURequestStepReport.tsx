import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import {changeTransactionsReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import {getAllReportActions} from '@libs/ReportActionsUtils';
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

/**
 * Check if a report has any forwarded actions
 */
function hasForwardedAction(reportID: string): boolean {
    const reportActions = getAllReportActions(reportID);
    return Object.values(reportActions).some((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.FORWARDED);
}

function IOURequestStepReport({route, transaction}: IOURequestStepReportProps) {
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
                report?.statusNum <= CONST.REPORT.STATUS_NUM.SUBMITTED &&
                !hasForwardedAction(report.reportID),
        );

        return expenseReports
            .sort((a, b) => a?.reportName?.localeCompare(b?.reportName?.toLowerCase() ?? '') ?? 0)
            .filter((report) => !debouncedSearchValue || report?.reportName?.toLowerCase().includes(debouncedSearchValue.toLowerCase()))
            .filter((report): report is NonNullable<typeof report> => report !== undefined)
            .map((report) => ({
                text: report.reportName,
                value: report.reportID,
                keyForList: report.reportID,
                isSelected: report.reportID === transaction?.reportID,
            }));
    }, [allReports, debouncedSearchValue, transaction?.reportID]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const selectReport = (item: ReportListItem) => {
        if (!transaction) {
            return;
        }

        changeTransactionsReport([transaction.transactionID], item.value);
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
                textInputLabel={reportOptions.length >= CONST.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined}
                shouldSingleExecuteRowSelect
                ListItem={UserListItem}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepReport.displayName = 'IOURequestStepReport';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepReport));
