import React, {useCallback, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
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
import useOutstandingReports from '@hooks/useOutstandingReports';
import usePolicy from '@hooks/usePolicy';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportTransactions from '@hooks/useReportTransactions';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {canAddTransaction, getPolicyName, getReportName, isIOUReport, isOpenReport, isReportOwner, sortOutstandingReportsBySelected} from '@libs/ReportUtils';
import {isPerDiemRequest as isPerDiemRequestUtil} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';
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
    isPerDiemRequest: boolean;
};

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
    const icons = useMemoizedLazyExpensifyIcons(['Close', 'Document'] as const);
    const {translate, localeCompare} = useLocalize();
    const {options} = useOptionsList();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: true});
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

    const [perDiemWarningModalVisible, setPerDiemWarningModalVisible] = useState(false);

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
            .filter((reportTransaction) => transactionIDs.includes(reportTransaction.transactionID))
            .some((reportTransaction) => reportTransaction?.comment?.liabilityType === CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT);
    }, [transactionIDs, selectedReport, reportTransactions]);

    const shouldShowRemoveFromReport =
        !!(selectedReportID && selectedReportID !== CONST.REPORT.UNREPORTED_REPORT_ID && selectedReport) && isEditing && isOwner && !isReportIOU && !isCardTransaction;

    const outstandingReports = useOutstandingReports(selectedReportID, selectedPolicyID, resolvedReportOwnerAccountID, isEditing);

    const reportOptions: TransactionGroupListItem[] = useMemo(() => {
        if (outstandingReports.length === 0) {
            return [];
        }

        return outstandingReports
            .sort((report1, report2) => sortOutstandingReportsBySelected(report1, report2, selectedReportID, localeCompare))
            .filter((report) => !debouncedSearchValue || report?.reportName?.toLowerCase().includes(debouncedSearchValue.toLowerCase()))
            .filter((report): report is NonNullable<typeof report> => report !== undefined)
            .filter((report) => {
                if (canAddTransaction(report, undefined, true)) {
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
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    text: getReportName(report),
                    value: report.reportID,
                    keyForList: report.reportID,
                    isSelected: report.reportID === selectedReportID,
                    policyID: matchingOption?.policyID ?? report.policyID,
                };
            });
    }, [debouncedSearchValue, outstandingReports, selectedReportID, options.reports, localeCompare, allPolicies, currentUserPersonalDetails.accountID]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const checkIfPerDiemTransactionsCanBeMoved = useCallback(
        (selectedReportPolicyID: string | undefined) => {
            const transactionDetails = transactionIDs?.map((transactionID) => {
                const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
                return {
                    transaction,
                    isPerDiem: transaction ? isPerDiemRequestUtil(transaction) : false,
                    customUnitID: transaction?.comment?.customUnit?.customUnitID,
                };
            });

            const destinationPolicy = selectedReportPolicyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${selectedReportPolicyID}`] : undefined;

            if (!destinationPolicy?.arePerDiemRatesEnabled || !destinationPolicy?.customUnits || isEmptyObject(destinationPolicy.customUnits)) {
                return false;
            }

            const invalidPerDiemTransaction = transactionDetails?.find((detail) => {
                if (!detail.isPerDiem) {
                    return false;
                }
                const customUnitID = detail.customUnitID;
                return !customUnitID || !destinationPolicy?.customUnits?.[customUnitID];
            });

            return !invalidPerDiemTransaction;
        },
        [transactionIDs, allPolicies, allTransactions],
    );

    const validatePerDiemMove = useCallback(
        (policyID: string | undefined): boolean => {
            if (transactionIDs?.length === 0) {
                return false;
            }
            if (isPerDiemRequest) {
                if (checkIfPerDiemTransactionsCanBeMoved(policyID)) {
                    return true;
                }
                setPerDiemWarningModalVisible(true);
                return false;
            }
            return true;
        },
        [transactionIDs?.length, isPerDiemRequest, checkIfPerDiemTransactionsCanBeMoved],
    );

    const handleSelectReport = (item: TransactionGroupListItem) => {
        if (item.value === selectedReportID) {
            navigateBack();
            return;
        }
        if (!validatePerDiemMove(item.policyID)) {
            return;
        }
        selectReport(item);
    };

    const handleCreateReport = useCallback(() => {
        if (!validatePerDiemMove(policyForMovingExpenses?.id)) {
            return;
        }
        createReport?.();
    }, [validatePerDiemMove, policyForMovingExpenses?.id, createReport]);

    const headerMessage = useMemo(() => (searchValue && !reportOptions.length ? translate('common.noResultsFound') : ''), [searchValue, reportOptions.length, translate]);

    const createReportOption = useMemo(() => {
        if (!createReport) {
            return undefined;
        }

        return (
            <MenuItem
                onPress={handleCreateReport}
                title={translate('report.newReport.createReport')}
                description={policyForMovingExpenses?.name}
                icon={icons.Document}
            />
        );
    }, [icons.Document, createReport, translate, policyForMovingExpenses?.name, handleCreateReport]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundPage = useMemo(() => {
        if (createReportOption) {
            return false;
        }

        if (outstandingReports.length === 0 || shouldShowNotFoundPageFromProps) {
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
    }, [createReportOption, outstandingReports.length, shouldShowNotFoundPageFromProps, selectedReport, reportPolicy]);

    const hidePerDiemWarningModal = () => setPerDiemWarningModalVisible(false);

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
                onSelectRow={handleSelectReport}
                isRowMultilineSupported
                shouldShowTextInput={outstandingReports.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
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
                                icon={icons.Close}
                            />
                        )}
                        {createReportOption}
                    </>
                }
                listEmptyContent={createReportOption}
            />
            <ConfirmModal
                isVisible={perDiemWarningModalVisible}
                onConfirm={hidePerDiemWarningModal}
                onCancel={hidePerDiemWarningModal}
                title={translate('iou.moveExpenses', {count: transactionIDs?.length ?? 1})}
                prompt={translate('iou.moveExpensesError')}
                confirmText={translate('common.buttonConfirm')}
                shouldShowCancelButton={false}
            />
        </StepScreenWrapper>
    );
}

export default IOURequestEditReportCommon;
