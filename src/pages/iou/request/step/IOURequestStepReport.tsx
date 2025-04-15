import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import {changeTransactionsReport, setTransactionReport} from '@libs/actions/Transaction';
import Navigation from '@libs/Navigation/Navigation';
import {getOutstandingReports} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type ReportListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type IOURequestStepReportProps = WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_REPORT> & WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_REPORT>;

/**
 * This function narrows down the data from Onyx to just the properties that we want to trigger a re-render of the component.
 * This helps minimize re-rendering and makes the entire component more performant.
 */
const reportSelector = (report: OnyxEntry<Report>): OnyxEntry<Report> =>
    report && {
        reportID: report.reportID,
        policyID: report.policyID,
        reportName: report.reportName,
        stateNum: report.stateNum,
        statusNum: report.statusNum,
        type: report.type,
    };

function IOURequestStepReport({route, transaction}: IOURequestStepReportProps) {
    const {translate} = useLocalize();
    const {backTo, action} = route.params;
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: (c) => mapOnyxCollectionItems(c, reportSelector)});
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const isEditing = action === CONST.IOU.ACTION.EDIT;
    // We need to get the policyID because it's not defined in the transaction object before we select a report manually.
    const policyID = Object.values(allReports ?? {}).find(
        (report) => report?.reportID === transaction?.reportID || report?.reportID === transaction?.participants?.at(0)?.reportID,
    )?.policyID;
    const expenseReports = getOutstandingReports(policyID, allReports ?? {});

    const reportOptions: ReportListItem[] = useMemo(() => {
        if (!allReports) {
            return [];
        }

        const isTransactionReportCorrect = expenseReports.some((report) => report?.reportID === transaction?.reportID);
        return expenseReports
            .sort((a, b) => a?.reportName?.localeCompare(b?.reportName?.toLowerCase() ?? '') ?? 0)
            .filter((report) => !debouncedSearchValue || report?.reportName?.toLowerCase().includes(debouncedSearchValue.toLowerCase()))
            .filter((report): report is NonNullable<typeof report> => report !== undefined)
            .map((report) => ({
                text: report.reportName,
                value: report.reportID,
                keyForList: report.reportID,
                isSelected: isTransactionReportCorrect ? report.reportID === transaction?.reportID : expenseReports.at(0)?.reportID === report.reportID,
            }));
    }, [allReports, debouncedSearchValue, expenseReports, transaction?.reportID]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const selectReport = (item: ReportListItem) => {
        if (!transaction) {
            return;
        }
        if (item.value !== transaction.reportID) {
            setTransactionReport(transaction.transactionID, item.value, !isEditing);
            if (isEditing) {
                changeTransactionsReport([transaction.transactionID], item.value);
            }
        }
        Navigation.goBack(backTo);
    };

    const headerMessage = useMemo(() => (searchValue && !reportOptions.length ? translate('common.noResultsFound') : ''), [searchValue, reportOptions, translate]);

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
                textInputLabel={expenseReports.length >= CONST.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined}
                shouldSingleExecuteRowSelect
                headerMessage={headerMessage}
                initiallyFocusedOptionKey={transaction?.reportID}
                ListItem={UserListItem}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepReport.displayName = 'IOURequestStepReport';

export default withWritableReportOrNotFound(withFullTransactionOrNotFound(IOURequestStepReport));
