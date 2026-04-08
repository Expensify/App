import {isUserValidatedSelector} from '@selectors/Account';
import React, {useContext, useRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type {ValueOf} from 'type-fest';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {RejectModalAction} from '@components/MoneyReportHeaderEducationalModals';
import MoneyReportHeaderKYCDropdown from '@components/MoneyReportHeaderKYCDropdown';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useExportActions from '@hooks/useExportActions';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLifecycleActions from '@hooks/useLifecycleActions';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaymentOptions from '@hooks/usePaymentOptions';
import usePermissions from '@hooks/usePermissions';
import useSelectedTransactionsActions from '@hooks/useSelectedTransactionsActions';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import useTransactionThreadReport from '@hooks/useTransactionThreadReport';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import type {KYCFlowEvent, TriggerKYCFlow} from '@libs/PaymentUtils';
import {handleUnvalidatedAccount, selectPaymentType} from '@libs/PaymentUtils';
import {getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import shouldPopoverUseScrollView from '@libs/shouldPopoverUseScrollView';
import {isTransactionPendingDelete} from '@libs/TransactionUtils';
import {canIOUBePaid as canIOUBePaidAction, payMoneyRequest} from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

const PAYMENT_ICONS = ['Send', 'ThumbsUp', 'Cash', 'ArrowRight'] as const;

type MoneyReportHeaderSelectionDropdownProps = {
    reportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '';
    onHoldMenuOpen: (requestType: string, paymentType?: PaymentMethodType, methodID?: number) => void;
    onRejectModalOpen: (action: RejectModalAction) => void;
    startApprovedAnimation: () => void;
    startSubmittingAnimation: () => void;
    wrapperStyle?: StyleProp<ViewStyle>;
};

function MoneyReportHeaderSelectionDropdown({
    reportID,
    primaryAction,
    onHoldMenuOpen,
    onRejectModalOpen,
    startApprovedAnimation,
    startSubmittingAnimation,
    wrapperStyle,
}: MoneyReportHeaderSelectionDropdownProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {isProduction} = useEnvironment();
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const {selectedTransactionIDs} = useSearchStateContext();
    const {clearSelectedTransactions} = useSearchActionsContext();

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
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

    const {transactionThreadReportID, reportActions} = useTransactionThreadReport(reportID);

    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);

    const allTransactionValues = Object.values(reportTransactions);
    const transactions = allTransactionValues;
    const nonPendingDeleteTransactions = allTransactionValues.filter((t) => !isTransactionPendingDelete(t));

    const {accountID, email, login: currentUserLogin} = useCurrentUserPersonalDetails();

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();

    const kycWallRef = useContext(KYCWallContext);

    const {showConfirmModal} = useConfirmModal();

    const isSelectionModePaymentRef = useRef(false);

    const expensifyIcons = useMemoizedLazyExpensifyIcons(PAYMENT_ICONS);

    const {beginExportWithTemplate, showOfflineModal, showDownloadErrorModal} = useExportActions({
        reportID,
        onPDFModalOpen: () => {},
    });

    const {confirmApproval, handleSubmitReport, shouldBlockSubmit, isBlockSubmitDueToPreventSelfApproval} = useLifecycleActions({
        reportID,
        startApprovedAnimation,
        startSubmittingAnimation,
        onHoldMenuOpen,
    });

    const {
        options: originalSelectedTransactionsOptions,
        handleDeleteTransactions,
        handleDeleteTransactionsWithNavigation,
    } = useSelectedTransactionsActions({
        report: moneyRequestReport,
        reportActions,
        allTransactionsLength: transactions.length,
        session,
        onExportFailed: showDownloadErrorModal,
        onExportOffline: showOfflineModal,
        policy,
        beginExportWithTemplate,
        isOnSearch: false,
    });

    const computedSecondaryActions = moneyRequestReport
        ? getSecondaryReportActions({
              currentUserLogin: currentUserLogin ?? '',
              currentUserAccountID: accountID,
              report: moneyRequestReport,
              chatReport,
              reportTransactions: nonPendingDeleteTransactions,
              originalTransaction: undefined,
              violations,
              bankAccountList,
              policy,
              reportNameValuePairs,
              reportActions,
              reportMetadata,
              policies: allPolicies,
              outstandingReportsByPolicyID,
              isChatReportArchived: false,
          })
        : [];

    const hasSubmitAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.SUBMIT || computedSecondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT);
    const hasApproveAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.APPROVE || computedSecondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE);
    const hasPayAction = primaryAction === CONST.REPORT.PRIMARY_ACTIONS.PAY || computedSecondaryActions.includes(CONST.REPORT.SECONDARY_ACTIONS.PAY);

    const checkForNecessaryAction = () => {
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return true;
        }
        if (isAccountLocked) {
            showLockedAccountModal();
            return true;
        }
        if (!isUserValidated) {
            handleUnvalidatedAccount(moneyRequestReport);
            return true;
        }
        return false;
    };

    const canAllowSettlement = !!moneyRequestReport;

    const totalAmount = getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, CONST.REPORT.PRIMARY_ACTIONS.PAY, nonPendingDeleteTransactions);

    const canIOUBePaid = canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, undefined, false, undefined, invoiceReceiverPolicy);

    const shouldShowPayButton = hasPayAction && canIOUBePaid;

    const confirmPayment = ({paymentType: type, methodID}: PaymentActionParams) => {
        if (!type || !chatReport) {
            return;
        }
        isSelectionModePaymentRef.current = true;
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        payMoneyRequest({
            paymentType: type,
            chatReport,
            iouReport: moneyRequestReport,
            introSelected,
            iouReportCurrentNextStepDeprecated: nextStep,
            currentUserAccountID: accountID,
            activePolicy: undefined,
            policy,
            betas,
            isSelfTourViewed: undefined,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            methodID: type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
            onPaid: () => {},
        });
        clearSelectedTransactions(true);
    };

    const paymentButtonOptions = usePaymentOptions({
        currency: moneyRequestReport?.currency,
        iouReport: moneyRequestReport,
        chatReportID: chatReport?.reportID,
        formattedAmount: totalAmount,
        policyID: moneyRequestReport?.policyID,
        onPress: ({paymentType: type, methodID}: PaymentActionParams) => {
            if (!type || !chatReport) {
                return;
            }
            isSelectionModePaymentRef.current = true;
            if (isDelegateAccessRestricted) {
                showDelegateNoAccessModal();
            } else {
                onHoldMenuOpen(CONST.IOU.REPORT_ACTION_TYPE.PAY, type, type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined);
            }
        },
        shouldHidePaymentOptions: !shouldShowPayButton,
        shouldShowApproveButton: false,
        shouldDisableApproveButton: false,
        onlyShowPayElsewhere: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const buildPaymentSubMenuItems = (_onWorkspaceSelected: () => void) => {
        return Object.values(paymentButtonOptions);
    };

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
                const backToRoute = chatReport?.reportID ? ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID) : undefined;
                handleDeleteTransactionsWithNavigation(backToRoute);
            } else {
                handleDeleteTransactions();
            }
        });
    };

    const allExpensesSelected = selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === nonPendingDeleteTransactions.length;

    // Ref writes below are inside onSelected callbacks that only fire on user interaction, never during render.
    /* eslint-disable react-hooks/refs */
    const selectionModeReportLevelActions = (() => {
        if (isProduction) {
            return [];
        }
        const actions: Array<DropdownOption<string> & Pick<PopoverMenuItem, 'backButtonText' | 'rightIcon'>> = [];
        if (hasSubmitAction && !shouldBlockSubmit) {
            actions.push({
                text: translate('common.submit'),
                icon: expensifyIcons.Send,
                value: CONST.REPORT.PRIMARY_ACTIONS.SUBMIT,
                onSelected: () => handleSubmitReport(true),
            });
        }
        if (hasApproveAction && !isBlockSubmitDueToPreventSelfApproval) {
            actions.push({
                text: translate('iou.approve'),
                icon: expensifyIcons.ThumbsUp,
                value: CONST.REPORT.PRIMARY_ACTIONS.APPROVE,
                onSelected: () => {
                    isSelectionModePaymentRef.current = true;
                    confirmApproval(true);
                },
            });
        }
        if (hasPayAction && !(isOffline && !canAllowSettlement)) {
            actions.push({
                text: translate('iou.settlePayment', totalAmount),
                icon: expensifyIcons.Cash,
                value: CONST.REPORT.PRIMARY_ACTIONS.PAY,
                rightIcon: expensifyIcons.ArrowRight,
                backButtonText: translate('iou.settlePayment', totalAmount),
                subMenuItems: buildPaymentSubMenuItems(() => {
                    isSelectionModePaymentRef.current = true;
                    if (checkForNecessaryAction()) {
                        return;
                    }
                    kycWallRef.current?.continueAction?.({});
                }),
                onSelected: () => {
                    isSelectionModePaymentRef.current = true;
                },
            });
        }
        return actions;
    })();
    /* eslint-enable react-hooks/refs */

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
                        onRejectModalOpen(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK);
                    }
                },
            };
        }
        return option;
    });

    const selectedTransactionsOptions = allExpensesSelected && selectionModeReportLevelActions.length ? [...selectionModeReportLevelActions, ...mappedOptions] : mappedOptions;

    const popoverUseScrollView = shouldPopoverUseScrollView(selectedTransactionsOptions);

    const hasPayInSelectionMode = allExpensesSelected && hasPayAction;

    const onSelectionModePaymentSelect = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => {
        isSelectionModePaymentRef.current = true;
        if (checkForNecessaryAction()) {
            return;
        }
        selectPaymentType({
            event,
            iouPaymentType,
            triggerKYCFlow,
            policy,
            onPress: confirmPayment,
            currentAccountID: accountID,
            currentEmail: email ?? '',
            hasViolations: false,
            isASAPSubmitBetaEnabled,
            isUserValidated,
            confirmApproval: () => confirmApproval(),
            iouReport: moneyRequestReport,
            iouReportNextStep: nextStep,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
        });
    };

    const selectionModeKYCSuccess = (type?: PaymentMethodType) => {
        isSelectionModePaymentRef.current = true;
        confirmPayment({paymentType: type});
    };

    if (!selectedTransactionsOptions.length || transactionThreadReportID) {
        return null;
    }

    if (hasPayInSelectionMode) {
        return (
            <MoneyReportHeaderKYCDropdown
                chatReportID={chatReport?.reportID}
                iouReport={moneyRequestReport}
                onPaymentSelect={onSelectionModePaymentSelect}
                onSuccessfulKYC={selectionModeKYCSuccess}
                primaryAction={primaryAction}
                applicableSecondaryActions={selectedTransactionsOptions}
                customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
                shouldShowSuccessStyle
                ref={kycWallRef}
            />
        );
    }

    return (
        <ButtonWithDropdownMenu
            onPress={() => null}
            options={selectedTransactionsOptions}
            customText={translate('workspace.common.selected', {count: selectedTransactionIDs.length})}
            isSplitButton={false}
            shouldAlwaysShowDropdownMenu
            shouldPopoverUseScrollView={popoverUseScrollView}
            wrapperStyle={wrapperStyle}
        />
    );
}

export default MoneyReportHeaderSelectionDropdown;
export type {MoneyReportHeaderSelectionDropdownProps};
