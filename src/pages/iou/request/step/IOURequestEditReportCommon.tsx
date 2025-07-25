import React, {useMemo} from 'react';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {getOutstandingReportsForUser, getPolicyName, reportsByPolicyIDSelector, sortOutstandingReportsBySelected} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import StepScreenWrapper from './StepScreenWrapper';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type Props = {
    backTo: Route | undefined;
    transactionsReports: Report[];
    policyID?: string;
    selectReport: (item: TransactionGroupListItem) => void;
};

function IOURequestEditReportCommon({backTo, transactionsReports, selectReport, policyID: policyIDFromProps}: Props) {
    const {translate} = useLocalize();
    const {options} = useOptionsList();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [reportsByPolicyID] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {
        selector: (reports) => reportsByPolicyIDSelector(reports, currentUserPersonalDetails.accountID),
        canBeMissing: true,
    });

    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});
    const [allPoliciesID] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (policies) => mapOnyxCollectionItems(policies, (policy) => policy?.id), canBeMissing: false});

    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const expenseReports = useMemo(() => {
        // Early return if no reports are available to prevent useless loop
        if (!reportsByPolicyID || isEmptyObject(reportsByPolicyID)) {
            return [];
        }

        return Object.values(allPoliciesID ?? {}).flatMap((policyID) => {
            if (!policyID || (policyIDFromProps && policyID !== policyIDFromProps)) {
                return [];
            }
            const reports = getOutstandingReportsForUser(
                policyID,
                transactionsReports.at(0)?.ownerAccountID ?? currentUserPersonalDetails.accountID,
                reportsByPolicyID?.[policyID ?? CONST.DEFAULT_NUMBER_ID] ?? {},
                reportNameValuePairs,
            );

            return reports;
        });
    }, [reportsByPolicyID, currentUserPersonalDetails.accountID, transactionsReports, allPoliciesID, reportNameValuePairs, policyIDFromProps]);

    const reportOptions: TransactionGroupListItem[] = useMemo(() => {
        if (!reportsByPolicyID || isEmptyObject(reportsByPolicyID)) {
            return [];
        }

        const onlyReport = transactionsReports.length === 1 ? transactionsReports.at(0) : undefined;

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
    }, [reportsByPolicyID, debouncedSearchValue, expenseReports, options.reports, transactionsReports]);

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
            />
        </StepScreenWrapper>
    );
}

export default IOURequestEditReportCommon;
