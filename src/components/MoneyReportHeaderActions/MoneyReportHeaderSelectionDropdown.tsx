import {useRoute} from '@react-navigation/native';
import {delegateEmailSelector, isUserValidatedSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import truncate from 'lodash/truncate';
import React, {useContext} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import MoneyReportHeaderKYCDropdown from '@components/MoneyReportHeaderKYCDropdown';
import {useMoneyReportHeaderModals} from '@components/MoneyReportHeaderModalsContext';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import BulkDuplicateHandler from '@components/Search/BulkDuplicateHandler';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import useActiveAdminPolicies from '@hooks/useActiveAdminPolicies';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useExportActions from '@hooks/useExportActions';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLifecycleActions from '@hooks/useLifecycleActions';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePaymentOptions from '@hooks/usePaymentOptions';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';
import {search} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import type {KYCFlowEvent, TriggerKYCFlow, WorkspacePolicyPaymentOption} from '@libs/PaymentUtils';
import {handleUnvalidatedAccount, selectPaymentType} from '@libs/PaymentUtils';
import {sortPoliciesByName} from '@libs/PolicyUtils';
import {hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {hasHeldExpenses, hasUpdatedTotal, hasViolations as hasViolationsReportUtils, isInvoiceReport as isInvoiceReportUtil, isIOUReport as isIOUReportUtil} from '@libs/ReportUtils';
import shouldPopoverUseScrollView from '@libs/shouldPopoverUseScrollView';
import {isTransactionPendingDelete} from '@libs/TransactionUtils';
import {payInvoice, payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';
import {canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

const PAYMENT_ICONS = ['Send', 'ThumbsUp', 'Cash', 'ArrowRight', 'Building'] as const;

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
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const isBulkSubmitApprovePayBetaEnabled = isBetaEnabled(CONST.BETAS.BULK_SUBMIT_APPROVE_PAY);
    const activeAdminPolicies = useActiveAdminPolicies();

    const {selectedTransactionIDs, currentSearchQueryJSON, currentSearchKey, currentSearchResults} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${getNonEmptyStringOnyxID(moneyRequestReport?.reportID)}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${getNonEmptyStringOnyxID(moneyRequestReport?.reportID)}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${getNonEmptyStringOnyxID(moneyRequestReport?.reportID)}`);
    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
    );

    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const activePolicy = usePolicy(activePolicyID);
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);
    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);

    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);
    const isAnyTransactionOnHold = hasHeldExpenses(moneyRequestReport?.reportID);

    const {transactionThreadReportID, reportActions} = useTransactionThreadReport(reportID);

    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const allTransactionValues = Object.values(reportTransactions);
    const transactions = allTransactionValues;
    const nonPendingDeleteTransactions = allTransactionValues.filter((t) => !isTransactionPendingDelete(t));
    const singleTransaction = nonPendingDeleteTransactions.length === 1 ? nonPendingDeleteTransactions.at(0) : undefined;
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(singleTransaction?.comment?.originalTransactionID)}`);

    const {accountID, email, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, accountID, email ?? '');

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const kycWallRef = useContext(KYCWallContext);

    const {showConfirmModal} = useConfirmModal();

    const expensifyIcons = useMemoizedLazyExpensifyIcons(PAYMENT_ICONS);

    const {beginExportWithTemplate, showOfflineModal, showDownloadErrorModal} = useExportActions({
        reportID,
        policy,
    });

    const {confirmApproval, handleSubmitReport, shouldBlockSubmit, isBlockSubmitDueToPreventSelfApproval} = useLifecycleActions({
        reportID,
        startApprovedAnimation,
        startSubmittingAnimation,
        onHoldMenuOpen: (requestType) => openHoldMenu({requestType, onConfirm: () => clearSelectedTransactions(true)}),
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
          })
        : [];

    const hasSubmitAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT || computedSecondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT);
    const hasApproveAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.APPROVE || computedSecondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE);
    const hasPayAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.PAY || computedSecondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.PAY);

    const checkForNecessaryAction = (paymentMethodType?: PaymentMethodType) => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return true;
        }
        if (isAccountLocked) {
            showLockedAccountModal();
            return true;
        }
        if (!isUserValidated && paymentMethodType !== CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            handleUnvalidatedAccount(moneyRequestReport);
            return true;
        }
        return false;
    };

    const canAllowSettlement = hasUpdatedTotal(moneyRequestReport, policy);
    const totalAmount = getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, CONST.REPORT.PRIMARY_ACTIONS.PAY, nonPendingDeleteTransactions);
    const canIOUBePaid = canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, undefined, false, undefined, invoiceReceiverPolicy);
    const onlyShowPayElsewhere = !canIOUBePaid && canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, undefined, true, undefined, invoiceReceiverPolicy);
    const isPayable = hasPayAction && canIOUBePaid;

    const confirmPayment = ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
        if (!type || !chatReport) {
            return;
        }

        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }

        if (isAnyTransactionOnHold) {
            openHoldMenu({
                requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: type,
                methodID: type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
                onConfirm: () => clearSelectedTransactions(true),
            });
            return;
        }

        if (isInvoiceReport) {
            payInvoice({
                paymentMethodType: type,
                chatReport,
                invoiceReport: moneyRequestReport,
                invoiceReportCurrentNextStepDeprecated: nextStep,
                introSelected,
                currentUserAccountIDParam: accountID,
                currentUserEmailParam: email ?? '',
                payAsBusiness,
                existingB2BInvoiceReport,
                methodID,
                paymentMethod,
                activePolicy,
                betas,
                isSelfTourViewed,
            });
        } else {
            payMoneyRequest({
                paymentType: type,
                chatReport,
                iouReport: moneyRequestReport,
                introSelected,
                iouReportCurrentNextStepDeprecated: nextStep,
                currentUserAccountID: accountID,
                activePolicy,
                policy,
                betas,
                isSelfTourViewed,
                userBillingGracePeriodEnds,
                amountOwed,
                ownerBillingGracePeriodEnd,
                methodID: type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
                onPaid: () => {
                    startAnimation();
                },
            });
            if (currentSearchQueryJSON && !isOffline) {
                search({
                    searchKey: currentSearchKey,
                    shouldCalculateTotals,
                    offset: 0,
                    queryJSON: currentSearchQueryJSON,
                    isOffline,
                    isLoading: !!currentSearchResults?.search?.isLoading,
                });
            }
        }

        clearSelectedTransactions(true);
    };

    const paymentButtonOptions = usePaymentOptions({
        currency: moneyRequestReport?.currency,
        iouReport: moneyRequestReport,
        chatReportID: chatReport?.reportID,
        formattedAmount: totalAmount,
        policyID: moneyRequestReport?.policyID,
        onPress: confirmPayment,
        shouldHidePaymentOptions: !isPayable,
        shouldShowApproveButton: false,
        shouldDisableApproveButton: false,
        onlyShowPayElsewhere,
    });

    const hasPersonalPaymentOption = paymentButtonOptions.some((opt) => opt.value === CONST.IOU.PAYMENT_TYPE.EXPENSIFY);
    const canUseBusinessBankAccount = !!moneyRequestReport?.reportID && !hasRequestFromCurrentAccount(moneyRequestReport, accountID ?? CONST.DEFAULT_NUMBER_ID);
    const workspacePolicyOptions =
        isIOUReportUtil(moneyRequestReport) && hasPersonalPaymentOption && activeAdminPolicies.length && canUseBusinessBankAccount
            ? sortPoliciesByName(activeAdminPolicies, localeCompare)
            : [];

    // Workspace-policy entries carry the policy as data with no onSelected.
    // MoneyReportHeaderKYCDropdown picks them up via onSubItemSelected where triggerKYCFlow is in scope
    const paymentSubMenuItems: PopoverMenuItem[] = [];
    if (!workspacePolicyOptions.length) {
        paymentSubMenuItems.push(...Object.values(paymentButtonOptions));
    } else {
        for (const opt of Object.values(paymentButtonOptions)) {
            paymentSubMenuItems.push(opt);
            if (opt.value === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                for (const wp of workspacePolicyOptions) {
                    const workspacePolicyItem: WorkspacePolicyPaymentOption = {
                        text: translate('iou.payWithPolicy', truncate(wp.name, {length: CONST.ADDITIONAL_ALLOWED_CHARACTERS}), ''),
                        icon: expensifyIcons.Building,
                        workspacePolicy: wp,
                    };
                    paymentSubMenuItems.push(workspacePolicyItem);
                }
            }
        }
    }

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
                // eslint-disable-next-line no-restricted-syntax -- backTo is a legacy route param, preserving existing behavior
                const backToRoute = ((route.params as {backTo?: Route} | undefined)?.backTo ?? (chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined)) as
                    | Route
                    | undefined;
                handleDeleteTransactionsWithNavigation(backToRoute);
            } else {
                handleDeleteTransactions();
            }
        });
    };

    const allExpensesSelected = selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === nonPendingDeleteTransactions.length;

    // Ref writes below are inside onSelected callbacks that only fire on user interaction, never during render.
    /* eslint-disable react-hooks/refs */
    const selectionModeReportLevelActions: Array<DropdownOption<string> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>> = !isBulkSubmitApprovePayBetaEnabled
        ? []
        : [
              ...(hasSubmitAction && !shouldBlockSubmit
                  ? [
                        {
                            text: translate('common.submit'),
                            icon: expensifyIcons.Send,
                            value: CONST.REPORT.PRIMARY_ACTIONS.SUBMIT,
                            onSelected: () => handleSubmitReport(true),
                        },
                    ]
                  : []),
              ...(hasApproveAction && !isBlockSubmitDueToPreventSelfApproval
                  ? [
                        {
                            text: translate('iou.approve'),
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

    const hasActualPaymentOptions = paymentButtonOptions.some((opt) => Object.values(CONST.IOU.PAYMENT_TYPE).some((type) => type === opt.value));
    const hasPayInSelectionMode = allExpensesSelected && hasPayAction && hasActualPaymentOptions;

    const onSelectionModePaymentSelect = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => {
        if (checkForNecessaryAction(iouPaymentType)) {
            return;
        }
        selectPaymentType({
            event,
            iouPaymentType,
            triggerKYCFlow,
            expenseReportPolicy: policy,
            policy,
            onPress: confirmPayment,
            currentAccountID: accountID,
            currentEmail: email ?? '',
            hasViolations,
            isASAPSubmitBetaEnabled,
            isUserValidated,
            confirmApproval: () => confirmApproval(),
            iouReport: moneyRequestReport,
            iouReportNextStep: nextStep,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            delegateEmail,
        });
    };

    const selectionModeKYCSuccess = (type?: PaymentMethodType) => confirmPayment({paymentType: type});

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
                <MoneyReportHeaderKYCDropdown
                    chatReportID={chatReport?.reportID}
                    iouReport={moneyRequestReport}
                    onPaymentSelect={onSelectionModePaymentSelect}
                    onWorkspacePolicySelect={(selectedPolicy, triggerKYCFlow) => {
                        if (checkForNecessaryAction()) {
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
export type {MoneyReportHeaderSelectionDropdownProps};
