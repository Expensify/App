import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import MoneyReportHeaderKYCDropdown from '@components/MoneyReportHeaderKYCDropdown';
import {useMoneyReportHeaderModals} from '@components/MoneyReportHeaderModalsContext';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import BulkDuplicateHandler from '@components/Search/BulkDuplicateHandler';
import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';

import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useExportActions from '@hooks/useExportActions';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLifecycleActions from '@hooks/useLifecycleActions';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useSelectionModePayment from '@hooks/useSelectionModePayment';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import {getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {hasUpdatedTotal, shouldShowMarkAsDone} from '@libs/ReportUtils';
import shouldPopoverUseScrollView from '@libs/shouldPopoverUseScrollView';
import {isTransactionPendingDelete} from '@libs/TransactionUtils';

import {canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU/ReportWorkflow';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';

import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';

import {useRoute} from '@react-navigation/native';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React from 'react';

const PAYMENT_ICONS = ['Send', 'ThumbsUp', 'Cash', 'ArrowRight'] as const;

type MoneyReportHeaderSelectionDropdownProps = {
    reportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '';
    isReportInSearch?: boolean;
    wrapperStyle?: StyleProp<ViewStyle>;
};

function MoneyReportHeaderSelectionDropdown({reportID, primaryAction, isReportInSearch, wrapperStyle}: MoneyReportHeaderSelectionDropdownProps) {
    const route = useRoute();
    const {startAnimation, startApprovedAnimation, startSubmittingAnimation} = usePaymentAnimationsContext();
    const {openHoldMenu: openHoldMenuAsync, openRejectModal} = useMoneyReportHeaderModals();
    const openHoldMenu = (params: Parameters<typeof openHoldMenuAsync>[0]) => {
        openHoldMenuAsync(params);
    };
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    const {selectedTransactionIDs} = useSearchSelectionContext();
    const {clearSelectedTransactions} = useSearchSelectionActions();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [submitterLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(moneyRequestReport?.ownerAccountID)}, [moneyRequestReport?.ownerAccountID]);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(moneyRequestReport?.reportID)}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${getNonEmptyStringOnyxID(moneyRequestReport?.reportID)}`);
    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
    );
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});

    const {accountID, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const {convertToDisplayString} = useCurrencyListActions();

    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();

    const {showConfirmModal} = useConfirmModal();
    const {isProduction} = useEnvironment();

    const expensifyIcons = useMemoizedLazyExpensifyIcons(PAYMENT_ICONS);

    const {beginExportWithTemplate, showOfflineModal, showDownloadErrorModal, exportDownloadStatusModal} = useExportActions({
        reportID,
        policy,
    });

    const {transactionThreadReportID, reportActions} = useTransactionThreadReport(reportID);
    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const allTransactionValues = Object.values(reportTransactions);
    const transactions = allTransactionValues;
    const nonPendingDeleteTransactions = allTransactionValues.filter((t) => !isTransactionPendingDelete(t));
    const singleTransaction = nonPendingDeleteTransactions.length === 1 ? nonPendingDeleteTransactions.at(0) : undefined;
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(singleTransaction?.comment?.originalTransactionID)}`);

    // Submit/approve via shared lifecycle actions
    const {confirmApproval, handleSubmitReport, shouldBlockSubmit, isBlockSubmitDueToPreventSelfApproval} = useLifecycleActions({
        reportID,
        startApprovedAnimation,
        startAnimation,
        startSubmittingAnimation,
        onHoldMenuOpen: (requestType, onConfirm, paymentType) =>
            openHoldMenu({
                requestType,
                onConfirm: () => {
                    onConfirm?.();
                    clearSelectedTransactions(true);
                },
                paymentType,
            }),
    });

    const {
        options: originalSelectedTransactionsOptions,
        handleDeleteTransactions,
        handleDeleteTransactionsWithNavigation,
        isDuplicateOptionVisible,
        setDuplicateHandler,
        allTransactions: allTransactionsForDuplicate,
        allReports: allReportsForDuplicate,
    } = useSelectedTransactionsActions({
        report: moneyRequestReport,
        reportActions,
        allTransactionsLength: transactions.length,
        session,
        onExportFailed: showDownloadErrorModal,
        onExportOffline: showOfflineModal,
        policy,
        beginExportWithTemplate,
        isOnSearch: !!isReportInSearch,
    });

    const computedSecondaryActions = moneyRequestReport
        ? getSecondaryReportActions({
              currentUserLogin: currentUserLogin ?? '',
              currentUserAccountID: accountID,
              submitterLogin,
              report: moneyRequestReport,
              chatReport,
              reportTransactions: nonPendingDeleteTransactions,
              originalTransaction,
              violations,
              bankAccountList,
              policy,
              reportNameValuePairs,
              reportActions,
              reportMetadata,
              policies: allPolicies,
              outstandingReportsByPolicyID,
              isChatReportArchived,
              isProduction,
          })
        : [];

    const hasSubmitAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT || computedSecondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT);
    const hasApproveAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.APPROVE || computedSecondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE);
    const hasPayAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.PAY || computedSecondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.PAY);

    const canAllowSettlement = hasUpdatedTotal(moneyRequestReport, policy);
    const canIOUBePaid = canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', accountID, undefined, false, undefined, invoiceReceiverPolicy);
    const onlyShowPayElsewhere =
        !canIOUBePaid && canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, currentUserLogin ?? '', accountID, undefined, true, undefined, invoiceReceiverPolicy);
    const isPayable = hasPayAction && canIOUBePaid;

    const totalAmount = getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, CONST.REPORT.PRIMARY_ACTIONS.PAY, nonPendingDeleteTransactions, convertToDisplayString);
    const allExpensesSelected = selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === nonPendingDeleteTransactions.length;

    // Shared payment hook
    const {shouldBlockAction, onSelectionModePaymentSelect, selectionModeKYCSuccess, paymentSubMenuItems, hasPayInSelectionMode, kycWallRef} = useSelectionModePayment({
        reportID,
        transactions,
        formattedAmount: totalAmount,
        shouldHidePaymentOptions: !isPayable,
        onlyShowPayElsewhere,
        hasPayAction,
        allExpensesSelected,
        onHoldMenuOpen: ({requestType, paymentType, methodID}) => {
            openHoldMenu({
                requestType,
                paymentType,
                methodID,
                onConfirm: () => clearSelectedTransactions(true),
            });
        },
        onPaymentComplete: () => {
            clearSelectedTransactions(true);
        },
        onPaid: () => {
            startAnimation();
        },
        confirmApproval: () => confirmApproval(),
    });

    const showDeleteModal = () => {
        showConfirmModal({
            title: translate('iou.deleteExpense', {count: selectedTransactionIDs.length}),
            prompt: translate('iou.deleteConfirmation', {count: selectedTransactionIDs.length}),
            confirmText: translate('common.delete'),
            cancelText: translate('common.cancel'),
            danger: true,
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }
            const nonPendingCount = transactions.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length;
            if (nonPendingCount === selectedTransactionIDs.length) {
                const backToRoute = ((route.params as {backTo?: Route} | undefined)?.backTo ?? (chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined)) as
                    | Route
                    | undefined;
                handleDeleteTransactionsWithNavigation(backToRoute);
            } else {
                handleDeleteTransactions();
            }
        });
    };

    const shouldUseMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report: moneyRequestReport,
        isTrackIntentUser,
    });
    const submitButtonText = shouldUseMarkAsDoneCopy ? translate('common.markAsDone') : translate('common.submit');
    const approveButtonText = shouldUseMarkAsDoneCopy ? translate('common.markAsDone') : translate('iou.approve');

    const selectionModeReportLevelActions: Array<DropdownOption<string> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>> = [
        ...(hasSubmitAction && !shouldBlockSubmit
            ? [
                  {
                      text: submitButtonText,
                      icon: expensifyIcons.Send,
                      value: CONST.REPORT.PRIMARY_ACTIONS.SUBMIT,
                      onSelected: () => handleSubmitReport(true),
                  },
              ]
            : []),
        ...(hasApproveAction && !isBlockSubmitDueToPreventSelfApproval
            ? [
                  {
                      text: approveButtonText,
                      icon: expensifyIcons.ThumbsUp,
                      value: CONST.REPORT.PRIMARY_ACTIONS.APPROVE,
                      onSelected: () => confirmApproval(true),
                  },
              ]
            : []),
        ...(hasPayAction && !(isOffline && !canAllowSettlement)
            ? [
                  {
                      text: translate('iou.settlePayment', totalAmount),
                      icon: expensifyIcons.Cash,
                      value: CONST.REPORT.PRIMARY_ACTIONS.PAY as string,
                      rightIcon: expensifyIcons.ArrowRight,
                      backButtonText: translate('iou.settlePayment', totalAmount),
                      subMenuItems: paymentSubMenuItems,
                  },
              ]
            : []),
    ];

    const mappedOptions = originalSelectedTransactionsOptions.map((option) => {
        if (option.value === CONST.REPORT.SECONDARY_ACTIONS.DELETE) {
            if (option.shouldSkipDeleteModal) {
                return option;
            }
            return {...option, onSelected: showDeleteModal};
        }
        if (option.value === CONST.REPORT.SECONDARY_ACTIONS.REJECT) {
            return {
                ...option,
                onSelected: () => {
                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }
                    if (dismissedRejectUseExplanation) {
                        option.onSelected?.();
                    } else {
                        openRejectModal(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK);
                    }
                },
            };
        }
        return option;
    });

    const selectedTransactionsOptions = allExpensesSelected && selectionModeReportLevelActions.length ? [...selectionModeReportLevelActions, ...mappedOptions] : mappedOptions;

    const popoverUseScrollView = shouldPopoverUseScrollView(selectedTransactionsOptions);

    if (!selectedTransactionsOptions.length || transactionThreadReportID) {
        return null;
    }

    const bulkDuplicateHandler = isDuplicateOptionVisible ? (
        <BulkDuplicateHandler
            selectedTransactionsKeys={selectedTransactionIDs}
            allTransactions={allTransactionsForDuplicate}
            allReports={allReportsForDuplicate}
            searchData={undefined}
            onHandlerReady={setDuplicateHandler}
            onAfterDuplicate={() => clearSelectedTransactions(true)}
        />
    ) : null;

    if (hasPayInSelectionMode) {
        return (
            <>
                {bulkDuplicateHandler}
                {exportDownloadStatusModal}
                <MoneyReportHeaderKYCDropdown
                    chatReportID={chatReport?.reportID}
                    iouReport={moneyRequestReport}
                    onPaymentSelect={onSelectionModePaymentSelect}
                    onWorkspacePolicySelect={(selectedPolicy, triggerKYCFlow) => {
                        if (shouldBlockAction(undefined, true)) {
                            return;
                        }
                        triggerKYCFlow({policy: selectedPolicy});
                    }}
                    onSuccessfulKYC={selectionModeKYCSuccess}
                    primaryAction={primaryAction}
                    applicableSecondaryActions={selectedTransactionsOptions}
                    customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                    shouldShowSuccessStyle
                    ref={kycWallRef}
                />
            </>
        );
    }

    return (
        <>
            {bulkDuplicateHandler}
            {exportDownloadStatusModal}
            <ButtonWithDropdownMenu
                onPress={() => null}
                options={selectedTransactionsOptions}
                customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                isSplitButton={false}
                shouldAlwaysShowDropdownMenu
                shouldPopoverUseScrollView={popoverUseScrollView}
                wrapperStyle={wrapperStyle}
            />
        </>
    );
}

export default MoneyReportHeaderSelectionDropdown;
