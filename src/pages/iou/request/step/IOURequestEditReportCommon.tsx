import {createPoliciesSelector} from '@selectors/Policy';
import React, {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import type {ListItem} from '@components/SelectionList/types';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportTransactions from '@hooks/useReportTransactions';
import Navigation from '@libs/Navigation/Navigation';
import {canSubmitPerDiemExpenseFromWorkspace, getPersonalPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {
    canAddTransaction,
    getOutstandingReportsForUser,
    getPolicyName,
    getReportName,
    isIOUReport,
    isOpenReport,
    isReportOwner,
    isSelfDM,
    sortOutstandingReportsBySelected,
} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Policy, Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
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
    targetOwnerAccountID?: number;
    selectReport: (item: TransactionGroupListItem, report?: OnyxEntry<Report>) => void;
    removeFromReport?: () => void;
    isEditing?: boolean;
    isUnreported?: boolean;
    shouldShowNotFoundPage?: boolean;
    createReport?: () => void;
    isPerDiemRequest?: boolean;
};

const policyIdSelector = (policy: OnyxEntry<Policy>) => policy?.id;

const policiesSelector = (policies: OnyxCollection<Policy>) => createPoliciesSelector(policies, policyIdSelector);

function IOURequestEditReportCommon({
    backTo,
    transactionIDs,
    selectReport,
    selectedReportID,
    selectedPolicyID,
    targetOwnerAccountID,
    removeFromReport,
    isEditing = false,
    isUnreported,
    shouldShowNotFoundPage: shouldShowNotFoundPageFromProps,
    createReport,
    isPerDiemRequest,
}: Props) {
    const icons = useMemoizedLazyExpensifyIcons(['Document'] as const);
    const {translate, localeCompare} = useLocalize();
    const {options} = useOptionsList();
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`, {canBeMissing: true});
    const resolvedReportOwnerAccountID = useMemo(() => {
        if (targetOwnerAccountID !== undefined) {
            return targetOwnerAccountID;
        }

        if (selectedReport?.ownerAccountID !== undefined) {
            return selectedReport.ownerAccountID;
        }

        return currentUserPersonalDetails.accountID;
    }, [targetOwnerAccountID, selectedReport?.ownerAccountID, currentUserPersonalDetails.accountID]);
    const reportPolicy = usePolicy(selectedReport?.policyID);
    const {policyForMovingExpenses} = usePolicyForMovingExpenses(isPerDiemRequest);

    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});

    const [allPoliciesID] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector, canBeMissing: false});

    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const isSelectedReportUnreported = useMemo(() => !!(isUnreported ?? selectedReportID === CONST.REPORT.UNREPORTED_REPORT_ID), [isUnreported, selectedReportID]);
    const isOwner = useMemo(
        () => resolvedReportOwnerAccountID === currentUserPersonalDetails.accountID || isSelectedReportUnreported,
        [resolvedReportOwnerAccountID, currentUserPersonalDetails.accountID, isSelectedReportUnreported],
    );
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

    const shouldShowRemoveFromReport =
        !!(selectedReportID && selectedReportID !== CONST.REPORT.UNREPORTED_REPORT_ID && selectedReport) && isEditing && isOwner && !isReportIOU && !isCardTransaction;

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
                        resolvedReportOwnerAccountID,
                        outstandingReportsByPolicyID?.[policyID ?? CONST.DEFAULT_NUMBER_ID] ?? {},
                        reportNameValuePairs,
                        isEditing,
                    );

                    return reports;
                });
        }
        return getOutstandingReportsForUser(
            selectedPolicyID,
            resolvedReportOwnerAccountID,
            outstandingReportsByPolicyID?.[selectedPolicyID ?? CONST.DEFAULT_NUMBER_ID] ?? {},
            reportNameValuePairs,
            isEditing,
        );
    }, [outstandingReportsByPolicyID, resolvedReportOwnerAccountID, allPoliciesID, reportNameValuePairs, selectedReport, selectedPolicyID, isEditing]);

    const reportOptions: TransactionGroupListItem[] = useMemo(() => {
        if (!outstandingReportsByPolicyID || isEmptyObject(outstandingReportsByPolicyID)) {
            return [];
        }

        return expenseReports
            .sort((report1, report2) => sortOutstandingReportsBySelected(report1, report2, selectedReportID, localeCompare))
            .filter((report) => !debouncedSearchValue || report?.reportName?.toLowerCase().includes(debouncedSearchValue.toLowerCase()))
            .filter((report): report is NonNullable<typeof report> => report !== undefined)
            .filter((report) => {
                if (isPerDiemRequest && report?.policyID && selectedReportID !== report?.reportID) {
                    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
                    return canSubmitPerDiemExpenseFromWorkspace(policy);
                }
                return true;
            })
            .filter((report) => {
                if (canAddTransaction(report)) {
                    return true;
                }

                const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
                const isReportPolicyAdmin = isPolicyAdmin(policy);
                const isReportManager = report.managerID === currentUserPersonalDetails.accountID;
                return isReportPolicyAdmin || isReportManager;
            })
            .map((report) => {
                const matchingOption = options.reports.find((option) => option.reportID === report.reportID);
                return {
                    ...(matchingOption ?? report),
                    // We are shallow copying properties from matchingOption, so if it has a brickRoadIndicator, it will display RBR.
                    // We set it to null here to prevent showing RBR for reports https://github.com/Expensify/App/issues/65960.
                    brickRoadIndicator: null,
                    alternateText: getPolicyName({report}) ?? matchingOption?.alternateText,
                    text: getReportName(report),
                    value: report.reportID,
                    keyForList: report.reportID,
                    isSelected: report.reportID === selectedReportID,
                    policyID: matchingOption?.policyID ?? report.policyID,
                };
            });
    }, [
        outstandingReportsByPolicyID,
        debouncedSearchValue,
        expenseReports,
        selectedReportID,
        options.reports,
        localeCompare,
        allPolicies,
        isPerDiemRequest,
        currentUserPersonalDetails.accountID,
    ]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const headerMessage = useMemo(() => (searchValue && !reportOptions.length ? translate('common.noResultsFound') : ''), [searchValue, reportOptions.length, translate]);

    const createReportOption = useMemo(() => {
        if (!createReport || (isEditing && !isOwner)) {
            return undefined;
        }

        return (
            <MenuItem
                onPress={createReport}
                title={translate('report.newReport.createReport')}
                description={policyForMovingExpenses?.name}
                icon={icons.Document}
            />
        );
    }, [icons.Document, createReport, isEditing, isOwner, translate, policyForMovingExpenses?.name]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo(() => {
        if (createReportOption) {
            return false;
        }

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
    }, [createReportOption, expenseReports.length, shouldShowNotFoundPageFromProps, selectedReport, reportPolicy]);

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
                data={reportOptions}
                onSelectRow={selectReport}
                shouldShowTextInput={expenseReports.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
                textInputOptions={{
                    value: searchValue,
                    label: translate('common.search'),
                    headerMessage,
                    onChangeText: setSearchValue,
                }}
                shouldSingleExecuteRowSelect
                initiallyFocusedItemKey={selectedReportID}
                ListItem={InviteMemberListItem}
                listFooterContent={
                    <>
                        {shouldShowRemoveFromReport && (
                            <MenuItem
                                onPress={removeFromReport}
                                title={translate('iou.removeFromReport')}
                                description={translate('iou.moveToPersonalSpace')}
                                icon={Expensicons.Close}
                            />
                        )}
                        {createReportOption}
                    </>
                }
                listEmptyContent={createReportOption}
            />
        </StepScreenWrapper>
    );
}

export default IOURequestEditReportCommon;
