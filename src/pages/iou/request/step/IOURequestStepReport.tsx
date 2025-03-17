import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {isExpenseReport} from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
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
    const {translate} = useLocalize();
    const {transactionID, backTo} = route.params;
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    const selectedWorkspace = useMemo(() => transaction?.participants?.find((participant) => participant.isSender), [transaction]);

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

        return (
            expenseReports
                .sort((a, b) => a?.reportName?.localeCompare(b?.reportName?.toLowerCase() ?? '') ?? 0)
                .map(
                    (report) =>
                        report && {
                            text: report.reportName,
                            value: report.reportID,
                            keyForList: report.reportID,
                        },
                ) ?? []
        );
    }, [allReports]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const selectReport = (item: ReportListItem) => {
        const newParticipants = (transaction?.participants ?? []).filter((participant) => participant.accountID);

        newParticipants.push({
            policyID: item.value,
            isSender: true,
            selected: false,
        });

        IOU.setMoneyRequestParticipants(transactionID, newParticipants);
        navigateBack();
    };

    return (
        <StepScreenWrapper
            headerTitle={translate('workspace.invoices.sendFrom')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepReport.displayName}
            includeSafeAreaPaddingBottom
        >
            <SelectionList
                sections={[{data: reportOptions, title: translate('common.report')}]}
                onSelectRow={selectReport}
                shouldSingleExecuteRowSelect
                ListItem={UserListItem}
                initiallyFocusedOptionKey={selectedWorkspace?.policyID}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepReport.displayName = 'IOURequestStepReport';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepReport));
