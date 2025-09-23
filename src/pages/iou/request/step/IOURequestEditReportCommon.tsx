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
import useReportTransactions from '@hooks/useReportTransactions';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {getOutstandingReportsForUser, getPolicyName, isIOUReport, isOpenReport, isReportOwner, isSelfDM, sortOutstandingReportsBySelected} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import StepScreenWrapper from './StepScreenWrapper';

type TransactionGroupListItem = ListItem & {
    /** reportID of the report */
    value: string;
};

type Props = {
    backTo: Route | undefined;
    transactionIDs?: string[];
    selectedReportID?: string;
    selectedPolicyID?: string;
    selectReport: (item: TransactionGroupListItem) => void;
    removeFromReport?: () => void;
    isEditing?: boolean;
    isUnreported?: boolean;
    shouldShowNotFoundPage?: boolean;
};

function IOURequestEditReportCommon({
    backTo,
    transactionIDs,
    selectReport,
    selectedReportID,
    selectedPolicyID,
    removeFromReport,
    isEditing = false,
    isUnreported,
    shouldShowNotFoundPage: shouldShowNotFoundPageFromProps,
}: Props) {
    const {translate, localeCompare} = useLocalize();
    const {options} = useOptionsList();
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`, {canBeMissing: true});
    const reportOwnerAccountID = useMemo(() => selectedReport?.ownerAccountID ?? currentUserPersonalDetails.accountID, [selectedReport, currentUserPersonalDetails.accountID]);
    const reportPolicy = usePolicy(selectedReport?.policyID);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});
    const [allPoliciesID] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: (policies) => mapOnyxCollectionItems(policies, (policy) => policy?.id), canBeMissing: false});

    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const isOwner = selectedReport ? selectedReport.ownerAccountID === currentUserPersonalDetails.accountID : false;
    const isReportIOU = selectedReport ? isIOUReport(selectedReport) : false;

    const reportTransactions = useReportTransactions(selectedReportID);
    const isCardTransaction = useMemo(() => {
        if (!transactionIDs || !selectedReport) {
            return false;
        }

        return reportTransactions
            .filter((transaction) => transactionIDs.includes(transaction.transactionID))
            .some((transaction) => transaction?.comment?.liabilityType === CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT);
    }, [transactionIDs, selectedReport, reportTransactions]);

    const shouldShowRemoveFromReport = isEditing && isOwner && !isReportIOU && !isUnreported && !isCardTransaction;

    const expenseReports = useMemo(() => {
        // Early return if no reports are available to prevent useless loop
        if (!outstandingReportsByPolicyID || isEmptyObject(outstandingReportsByPolicyID)) {
            return [];
        }
        const personalPolicyID = getPersonalPolicy()?.id;
        if (!selectedPolicyID || selectedPolicyID === personalPolicyID || isSelfDM(selectedReport)) {
            return Object.values(allPoliciesID ?? {})
                .filter((policyID) => personalPolicyID !== policyID)
                .flatMap((policyID) => {
                    if (!policyID) {
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
        }
        return getOutstandingReportsForUser(
            selectedPolicyID,
            reportOwnerAccountID,
            outstandingReportsByPolicyID?.[selectedPolicyID ?? CONST.DEFAULT_NUMBER_ID] ?? {},
            reportNameValuePairs,
            isEditing,
        );
    }, [outstandingReportsByPolicyID, reportOwnerAccountID, allPoliciesID, reportNameValuePairs, selectedReport, selectedPolicyID, isEditing]);

    const reportOptions: TransactionGroupListItem[] = useMemo(() => {
        if (!outstandingReportsByPolicyID || isEmptyObject(outstandingReportsByPolicyID)) {
            return [];
        }

        return expenseReports
            .sort((report1, report2) => sortOutstandingReportsBySelected(report1, report2, selectedReportID, localeCompare))
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
                    isSelected: report.reportID === selectedReportID,
                    policyID: matchingOption?.policyID ?? report.policyID,
                };
            });
    }, [outstandingReportsByPolicyID, debouncedSearchValue, expenseReports, selectedReportID, options.reports, localeCompare]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const headerMessage = useMemo(() => (searchValue && !reportOptions.length ? translate('common.noResultsFound') : ''), [searchValue, reportOptions, translate]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo(() => {
        if (expenseReports.length === 0 || shouldShowNotFoundPageFromProps) {
            return true;
        }

        if (!selectedReport) {
            return false;
        }

        const isAdmin = isPolicyAdmin(reportPolicy);
        const isOpen = isOpenReport(selectedReport);
        const isSubmitter = isReportOwner(selectedReport);
        // If the report is Open, then only submitters, admins can move expenses
        return isOpen && !isAdmin && !isSubmitter;
    }, [selectedReport, reportPolicy, expenseReports.length, shouldShowNotFoundPageFromProps]);

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
                initiallyFocusedOptionKey={selectedReportID}
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
