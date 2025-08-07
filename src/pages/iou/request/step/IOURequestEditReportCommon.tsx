import React, {useMemo} from 'react';
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
import usePolicy from '@hooks/usePolicy';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getOutstandingReportsForUser, getPolicyName, isIOUReport, isOpenReport, isReportOwner, sortOutstandingReportsBySelected} from '@libs/ReportUtils';
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
    removeFromReport?: () => void;
    isEditing?: boolean;
    isUnreported?: boolean;
};

function IOURequestEditReportCommon({backTo, transactionsReports, selectReport, policyID: policyIDFromProps, removeFromReport, isEditing = false, isUnreported}: Props) {
    const {translate, localeCompare} = useLocalize();
    const {options} = useOptionsList();
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const reportOwnerAccountID = useMemo(
        () => transactionsReports.at(0)?.ownerAccountID ?? currentUserPersonalDetails.accountID,
        [transactionsReports, currentUserPersonalDetails.accountID],
    );
    const reportPolicy = usePolicy(transactionsReports.at(0)?.policyID);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});
    const [allPoliciesID] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (policies) => mapOnyxCollectionItems(policies, (policy) => policy?.id), canBeMissing: false});

    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const onlyReport = transactionsReports.length === 1 ? transactionsReports.at(0) : undefined;
    const isOwner = onlyReport ? onlyReport.ownerAccountID === currentUserPersonalDetails.accountID : false;
    const isReportIOU = onlyReport ? isIOUReport(onlyReport) : false;
    const shouldShowRemoveFromReport = isEditing && isOwner && !isReportIOU && !isUnreported;

    const expenseReports = useMemo(() => {
        // Early return if no reports are available to prevent useless loop
        if (!outstandingReportsByPolicyID || isEmptyObject(outstandingReportsByPolicyID)) {
            return [];
        }

        return Object.values(allPoliciesID ?? {}).flatMap((policyID) => {
            if (!policyID || (policyIDFromProps && policyID !== policyIDFromProps)) {
                return [];
            }
            const reports = getOutstandingReportsForUser(
                policyID,
                reportOwnerAccountID,
                outstandingReportsByPolicyID?.[policyID ?? CONST.DEFAULT_NUMBER_ID] ?? {},
                reportNameValuePairs,
                isEditing,
            );

            return reports;
        });
    }, [outstandingReportsByPolicyID, reportOwnerAccountID, allPoliciesID, reportNameValuePairs, policyIDFromProps, isEditing]);

    const reportOptions: TransactionGroupListItem[] = useMemo(() => {
        if (!outstandingReportsByPolicyID || isEmptyObject(outstandingReportsByPolicyID)) {
            return [];
        }

        return expenseReports
            .sort((report1, report2) => sortOutstandingReportsBySelected(report1, report2, onlyReport?.reportID, localeCompare))
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
    }, [outstandingReportsByPolicyID, debouncedSearchValue, expenseReports, onlyReport, options.reports, localeCompare]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const headerMessage = useMemo(() => (searchValue && !reportOptions.length ? translate('common.noResultsFound') : ''), [searchValue, reportOptions, translate]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo(() => {
        if (expenseReports.length === 0) {
            return true;
        }

        const transactionReport = transactionsReports.at(0);
        if (!transactionReport) {
            return false;
        }

        const isAdmin = isPolicyAdmin(reportPolicy);
        const isOpen = isOpenReport(transactionReport);
        const isSubmitter = isReportOwner(transactionReport);
        // If the report is Open, then only submitters, admins can move expenses
        return isOpen && !isAdmin && !isSubmitter;
    }, [transactionsReports, reportPolicy, expenseReports.length]);

    return (
        <StepScreenWrapper
            headerTitle={translate('common.report')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID="IOURequestEditReportCommon"
            includeSafeAreaPaddingBottom
            shouldShowNotFoundPage={shouldShowNotFoundPage}
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
