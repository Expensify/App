import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {getOutstandingReportsForUser, getPolicyName, isIOUReport, sortOutstandingReportsBySelected} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import StepScreenWrapper from './StepScreenWrapper';

type TransactionGroupListItem = ListItem & {
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
    transactionsReports: Report[];
    policyID?: string;
    selectReport: (item: TransactionGroupListItem) => void;
    removeFromReport?: () => void;
    isEditing?: boolean;
    isUnreported?: boolean;
    isUpdating?: boolean;
};

function IOURequestEditReportCommon({backTo, transactionsReports, selectReport, policyID: policyIDFromProps, removeFromReport, isEditing = false, isUnreported, isUpdating = false}: Props) {
    const {translate} = useLocalize();
    const {options} = useOptionsList();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: (reports) => mapOnyxCollectionItems(reports, reportSelector), canBeMissing: true});
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});
    const [allPoliciesID] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (policies) => mapOnyxCollectionItems(policies, (policy) => policy?.id), canBeMissing: false});

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const onlyReport = transactionsReports.length === 1 ? transactionsReports.at(0) : undefined;
    const isOwner = onlyReport ? onlyReport.ownerAccountID === currentUserPersonalDetails.accountID : false;
    const isReportIOU = onlyReport ? isIOUReport(onlyReport) : false;
    const shouldShowRemoveFromReport = isEditing && isOwner && !isReportIOU && !isUnreported && !isUpdating;

    const expenseReports = useMemo(
        () =>
            Object.values(allPoliciesID ?? {}).flatMap((policyID) => {
                if (!policyID || (policyIDFromProps && policyID !== policyIDFromProps)) {
                    return [];
                }
                const reports = getOutstandingReportsForUser(
                    policyID,
                    transactionsReports.at(0)?.ownerAccountID ?? currentUserPersonalDetails.accountID,
                    allReports ?? {},
                    reportNameValuePairs,
                );
                return reports;
            }),
        [allReports, currentUserPersonalDetails.accountID, transactionsReports, allPoliciesID, reportNameValuePairs, policyIDFromProps],
    );

    const reportOptions: TransactionGroupListItem[] = useMemo(() => {
        if (!allReports) {
            return [];
        }

        return expenseReports
            .sort((report1, report2) => sortOutstandingReportsBySelected(report1, report2, onlyReport?.reportID))
            .filter((report) => !debouncedSearchValue || report?.reportName?.toLowerCase().includes(debouncedSearchValue.toLowerCase()))
            .filter((report): report is NonNullable<typeof report> => report !== undefined)
            .map((report) => {
                const matchingOption = options.reports.find((option) => option.reportID === report.reportID);
                return {
                    ...matchingOption,
                    // We are shallow copying properties from matchingOption, so if it has a brickRoadIndicator, it will display RBR.
                    // We set it to null here to prevent showing RBR for reports https://github.com/Expensify/App/issues/65960.
                    brickRoadIndicator: null,
                    alternateText: getPolicyName({report}) ?? matchingOption?.alternateText,
                    value: report.reportID,
                    isSelected: onlyReport && report.reportID === onlyReport?.reportID,
                };
            });
    }, [allReports, debouncedSearchValue, expenseReports, onlyReport, options.reports]);

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
                initiallyFocusedOptionKey={transactionsReports.length === 1 ? transactionsReports.at(0)?.reportID : undefined}
                ListItem={InviteMemberListItem}
                listFooterContent={
                    shouldShowRemoveFromReport ? (
                        <MenuItem
                            onPress={removeFromReport}
                            title={translate('iou.removeFromReport')}
                            description={translate('iou.moveToPersonalSpace')}
                            icon={Expensicons.Close}
                        />
                    ) : undefined
                }
            />
        </StepScreenWrapper>
    );
}

export default IOURequestEditReportCommon;
