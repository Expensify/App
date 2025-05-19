import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {getOutstandingReportsForUser} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import StepScreenWrapper from './StepScreenWrapper';

type ReportListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

/**
 * This function narrows down the data from Onyx to just the properties that we want to trigger a re-render of the component.
 * This helps minimize re-rendering and makes the entire component more performant.
 */
const reportSelector = (report: OnyxEntry<Report>): OnyxEntry<Report> =>
    report && {
        ownerAccountID: report.ownerAccountID,
        reportID: report.reportID,
        policyID: report.policyID,
        reportName: report.reportName,
        stateNum: report.stateNum,
        statusNum: report.statusNum,
        type: report.type,
    };

type Props = {
    backTo: Route | undefined;
    transactionReport: OnyxEntry<Report>;
    selectReport: (item: ReportListItem) => void;
};

function IOURequestEditReportCommon({backTo, transactionReport, selectReport}: Props) {
    const {translate} = useLocalize();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: (reports) => mapOnyxCollectionItems(reports, reportSelector), canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const expenseReports = getOutstandingReportsForUser(transactionReport?.policyID, transactionReport?.ownerAccountID ?? currentUserPersonalDetails.accountID, allReports ?? {});
    const reportOptions: ReportListItem[] = useMemo(() => {
        if (!allReports) {
            return [];
        }

        const isTransactionReportCorrect = expenseReports.some((report) => report?.reportID === transactionReport?.reportID);
        return expenseReports
            .sort((a, b) => a?.reportName?.localeCompare(b?.reportName?.toLowerCase() ?? '') ?? 0)
            .filter((report) => !debouncedSearchValue || report?.reportName?.toLowerCase().includes(debouncedSearchValue.toLowerCase()))
            .filter((report): report is NonNullable<typeof report> => report !== undefined)
            .map((report) => ({
                text: report.reportName,
                value: report.reportID,
                keyForList: report.reportID,
                isSelected: isTransactionReportCorrect ? report.reportID === transactionReport?.reportID : expenseReports.at(0)?.reportID === report.reportID,
            }));
    }, [allReports, debouncedSearchValue, expenseReports, transactionReport?.reportID]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const headerMessage = useMemo(() => (searchValue && !reportOptions.length ? translate('common.noResultsFound') : ''), [searchValue, reportOptions, translate]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.report')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestEditReportCommon"
            includeSafeAreaPaddingBottom
            shouldShowNotFoundPage={expenseReports.length === 0}
        >
            <SelectionList
                sections={[{data: reportOptions}]}
                onSelectRow={selectReport}
                textInputValue={searchValue}
                onChangeText={setSearchValue}
                textInputLabel={expenseReports.length >= CONST.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined}
                shouldSingleExecuteRowSelect
                headerMessage={headerMessage}
                initiallyFocusedOptionKey={transactionReport?.reportID}
                ListItem={UserListItem}
            />
        </StepScreenWrapper>
    );
}

export default IOURequestEditReportCommon;
