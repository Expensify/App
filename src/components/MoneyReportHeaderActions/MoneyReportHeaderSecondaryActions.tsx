import {delegateEmailSelector, isUserValidatedSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import truncate from 'lodash/truncate';
import React, {useContext, useEffect} from 'react';
import {InteractionManager, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import type {ButtonWithDropdownMenuRef} from '@components/ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import MoneyReportHeaderKYCDropdown from '@components/MoneyReportHeaderKYCDropdown';
import {useMoneyReportHeaderModals} from '@components/MoneyReportHeaderModalsContext';
import NavigationDeferredMount from '@components/NavigationDeferredMount';
import {usePaymentAnimationsContext} from '@components/PaymentAnimationsContext';
import type {PopoverMenuItem} from '@components/PopoverMenu';
import {useSearchStateContext} from '@components/Search/SearchContext';
import type {PaymentActionParams} from '@components/SettlementButton/types';
import useActiveAdminPolicies from '@hooks/useActiveAdminPolicies';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useExpenseActions from '@hooks/useExpenseActions';
import useExportActions from '@hooks/useExportActions';
import useHoldRejectActions from '@hooks/useHoldRejectActions';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLifecycleActions from '@hooks/useLifecycleActions';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import usePaymentOptions from '@hooks/usePaymentOptions';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchShouldCalculateTotals from '@hooks/useSearchShouldCalculateTotals';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {search} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import getPlatform from '@libs/getPlatform';
import {getTotalAmountForIOUReportPreviewButton} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {KYCFlowEvent, TriggerKYCFlow, WorkspacePolicyPaymentOption} from '@libs/PaymentUtils';
import {selectPaymentType} from '@libs/PaymentUtils';
import {sortPoliciesByName} from '@libs/PolicyUtils';
import {getFilteredReportActionsForReportView, hasRequestFromCurrentAccount} from '@libs/ReportActionsUtils';
import {getSecondaryReportActions} from '@libs/ReportSecondaryActionUtils';
import {
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasViolations as hasViolationsReportUtils,
    isAllowedToApproveExpenseReport,
    isInvoiceReport as isInvoiceReportUtil,
    isIOUReport as isIOUReportUtil,
    navigateToDetailsPage,
} from '@libs/ReportUtils';
import {isExpensifyCardTransaction, isPending} from '@libs/TransactionUtils';
import {payInvoice, payMoneyRequest} from '@userActions/IOU/PayMoneyRequest';
import {canApproveIOU, canIOUBePaid as canIOUBePaidAction} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';

type MoneyReportHeaderSecondaryActionsProps = {
    reportID: string | undefined;
    primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | '';
    isReportInSearch?: boolean;
    backTo?: Route;
    dropdownMenuRef?: React.RefObject<ButtonWithDropdownMenuRef>;
};

function MoneyReportHeaderSecondaryActionsInner({reportID, primaryAction, isReportInSearch, backTo, dropdownMenuRef}: MoneyReportHeaderSecondaryActionsProps) {
    const {isPaidAnimationRunning, isApprovedAnimationRunning, startAnimation, startApprovedAnimation, startSubmittingAnimation} = usePaymentAnimationsContext();
    const {openHoldMenu, openPDFDownload, openHoldEducational, openRejectModal} = useMoneyReportHeaderModals();

    const {translate, localeCompare} = useLocalize();
    const kycWallRef = useContext(KYCWallContext);

    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(moneyRequestReport?.policyID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(moneyRequestReport?.chatReportID)}`);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [nextStep] = useOnyx(`${ONYXKEYS.COLLECTION.NEXT_STEP}${moneyRequestReport?.reportID}`);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${moneyRequestReport?.reportID}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${moneyRequestReport?.reportID}`);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [invoiceReceiverPolicy] = useOnyx(
        `${ONYXKEYS.COLLECTION.POLICY}${chatReport?.invoiceReceiver && 'policyID' in chatReport.invoiceReceiver ? chatReport.invoiceReceiver.policyID : undefined}`,
        {},
    );

    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {login: currentUserLogin, accountID, email} = currentUserPersonalDetails;

    const {isOffline} = useNetwork();
    const activePolicy = usePolicy(activePolicyID);

    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const {transactions: reportTransactions, violations} = useTransactionsAndViolationsForReport(moneyRequestReport?.reportID);
    const nonPendingDeleteTransactions = Object.values(reportTransactions).filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const allTransactions = Object.values(reportTransactions);
    const singleTransaction = nonPendingDeleteTransactions.length === 1 ? nonPendingDeleteTransactions.at(0) : undefined;
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(singleTransaction?.comment?.originalTransactionID)}`);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(moneyRequestReport?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const isChatReportArchived = useReportIsArchived(chatReport?.reportID);

    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {currentSearchQueryJSON, currentSearchKey, currentSearchResults} = useSearchStateContext();
    const shouldCalculateTotals = useSearchShouldCalculateTotals(currentSearchKey, currentSearchQueryJSON?.hash, true);

    const isInvoiceReport = isInvoiceReportUtil(moneyRequestReport);
    const isAnyTransactionOnHold = hasHeldExpensesReportUtils(moneyRequestReport?.reportID);
    const existingB2BInvoiceReport = useParticipantsInvoiceReport(activePolicyID, CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS, chatReport?.policyID);

    const confirmPayment = ({paymentType: type, payAsBusiness, methodID, paymentMethod}: PaymentActionParams) => {
        if (!type || !chatReport) {
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
        } else if (isAnyTransactionOnHold) {
            const holdMenuParams = {
                requestType: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: type,
                methodID: type === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
                onConfirm: () => startAnimation(),
            };
            if (getPlatform() === CONST.PLATFORM.IOS) {
                // InteractionManager delays modal until current interaction completes, preventing visual glitches on iOS
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                InteractionManager.runAfterInteractions(() => openHoldMenu(holdMenuParams));
            } else {
                openHoldMenu(holdMenuParams);
            }
        } else if (isInvoiceReport) {
            startAnimation();
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
            startAnimation();
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
    };

    // Payment button derivations
    const canIOUBePaid = canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, undefined, false, undefined, invoiceReceiverPolicy);
    const onlyShowPayElsewhere = !canIOUBePaid && canIOUBePaidAction(moneyRequestReport, chatReport, policy, bankAccountList, undefined, true, undefined, invoiceReceiverPolicy);
    const shouldShowPayButton = isPaidAnimationRunning || canIOUBePaid || onlyShowPayElsewhere;
    const hasOnlyPendingTransactions = allTransactions.length > 0 && allTransactions.every((t) => isExpensifyCardTransaction(t) && isPending(t));
    const shouldShowApproveButton = (canApproveIOU(moneyRequestReport, policy, reportMetadata, allTransactions) && !hasOnlyPendingTransactions) || isApprovedAnimationRunning;
    const isApproveDisabled = shouldShowApproveButton && !isAllowedToApproveExpenseReport(moneyRequestReport);

    const totalAmount = getTotalAmountForIOUReportPreviewButton(moneyRequestReport, policy, CONST.REPORT.PRIMARY_ACTIONS.PAY, nonPendingDeleteTransactions);

    const paymentButtonOptions = usePaymentOptions({
        currency: moneyRequestReport?.currency,
        iouReport: moneyRequestReport,
        chatReportID: chatReport?.reportID,
        formattedAmount: totalAmount,
        policyID: moneyRequestReport?.policyID,
        onPress: confirmPayment,
        shouldHidePaymentOptions: !shouldShowPayButton,
        shouldShowApproveButton,
        shouldDisableApproveButton: isApproveDisabled,
        onlyShowPayElsewhere,
    });

    const activeAdminPolicies = useActiveAdminPolicies();

    const hasPersonalPaymentOption = paymentButtonOptions.some((opt) => opt.value === CONST.IOU.PAYMENT_TYPE.EXPENSIFY);
    const canUseBusinessBankAccount = !!moneyRequestReport?.reportID && !hasRequestFromCurrentAccount(moneyRequestReport, accountID ?? CONST.DEFAULT_NUMBER_ID);
    const workspacePolicyOptions =
        isIOUReportUtil(moneyRequestReport) && hasPersonalPaymentOption && activeAdminPolicies.length && canUseBusinessBankAccount
            ? sortPoliciesByName(activeAdminPolicies, localeCompare)
            : [];

    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Info', 'Cash', 'ArrowRight', 'Building']);

    // Build PAY action sub-items. Workspace-policy entries carry the policy as data and have no onSelected;
    // MoneyReportHeaderKYCDropdown picks them up via onSubItemSelected where triggerKYCFlow is in scope.
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

    // Domain hooks
    const lifecycleActions = useLifecycleActions({
        reportID,
        startApprovedAnimation,
        startSubmittingAnimation,
        onHoldMenuOpen: (requestType, onConfirm) => {
            openHoldMenu({requestType, onConfirm: onConfirm ?? (() => startApprovedAnimation())});
        },
    });

    const {
        actions: expenseActions,
        handleOptionsMenuHide,
        isDuplicateReportActive,
        wasDuplicateReportTriggeredRef,
    } = useExpenseActions({
        reportID,
        isReportInSearch,
        backTo,
        onDuplicateReset: () => dropdownMenuRef?.current?.setIsMenuVisible(false),
    });

    useEffect(() => {
        if (!isDuplicateReportActive || !wasDuplicateReportTriggeredRef.current) {
            return;
        }
        wasDuplicateReportTriggeredRef.current = false;
        dropdownMenuRef?.current?.setIsMenuVisible(false);
    }, [isDuplicateReportActive, wasDuplicateReportTriggeredRef, dropdownMenuRef]);

    const holdRejectActions = useHoldRejectActions({
        reportID,
        onHoldEducationalOpen: openHoldEducational,
        onRejectModalOpen: openRejectModal,
    });

    const {exportActionEntries} = useExportActions({
        reportID,
        policy,
        onPDFModalOpen: openPDFDownload,
    });

    // Compute list of applicable secondary action keys
    const secondaryActions = moneyRequestReport
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
              policies,
              outstandingReportsByPolicyID,
              isChatReportArchived,
          })
        : [];

    // Merge all action implementations
    const secondaryActionsImplementation: Record<string, (typeof lifecycleActions.actions)[string]> = {
        [CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
            text: translate('iou.viewDetails'),
            icon: expensifyIcons.Info,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.VIEW_DETAILS,
            onSelected: () => {
                navigateToDetailsPage(moneyRequestReport, Navigation.getReportRHPActiveRoute());
            },
        },
        ...exportActionEntries,
        ...lifecycleActions.actions,
        ...expenseActions,
        ...holdRejectActions,
        [CONST.REPORT.SECONDARY_ACTIONS.PAY]: {
            text: translate('iou.settlePayment', totalAmount),
            icon: expensifyIcons.Cash,
            rightIcon: expensifyIcons.ArrowRight,
            value: CONST.REPORT.SECONDARY_ACTIONS.PAY,
            backButtonText: translate('iou.settlePayment', totalAmount),
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.PAY,
            subMenuItems: paymentSubMenuItems,
        },
    };

    const applicableSecondaryActions = secondaryActions
        .map((action) => secondaryActionsImplementation[action])
        .filter((action) => action?.shouldShow !== false && action?.value !== primaryAction);

    const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, accountID, email ?? '');

    const onPaymentSelect = (event: KYCFlowEvent, iouPaymentType: PaymentMethodType, triggerKYCFlow: TriggerKYCFlow) => {
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
            confirmApproval: () => lifecycleActions.confirmApproval(),
            iouReport: moneyRequestReport,
            iouReportNextStep: nextStep,
            betas,
            userBillingGracePeriodEnds,
            amountOwed,
            ownerBillingGracePeriodEnd,
            delegateEmail,
        });
    };

    if (!applicableSecondaryActions.length) {
        return null;
    }

    return (
        <MoneyReportHeaderKYCDropdown
            chatReportID={chatReport?.reportID}
            iouReport={moneyRequestReport}
            onPaymentSelect={onPaymentSelect}
            onSuccessfulKYC={(type) => confirmPayment({paymentType: type})}
            primaryAction={primaryAction}
            applicableSecondaryActions={applicableSecondaryActions}
            dropdownMenuRef={dropdownMenuRef}
            onOptionsMenuHide={handleOptionsMenuHide}
            ref={kycWallRef}
        />
    );
}

function MoneyReportHeaderSecondaryActionsPlaceholder({primaryAction}: {primaryAction: ValueOf<typeof CONST.REPORT.PRIMARY_ACTIONS> | ''}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const shouldDisplayNarrowVersion = shouldUseNarrowLayout || isMediumScreenWidth;
    const wrapperStyle = shouldDisplayNarrowVersion && !primaryAction ? styles.flex1 : undefined;
    // Match the inner styles the real ButtonWithDropdownMenu applies when isSplitButton=false so text placement stays put on swap.
    const innerStyles = [StyleUtils.getDropDownButtonHeight(CONST.DROPDOWN_BUTTON_SIZE.MEDIUM), styles.dropDownButtonCartIconView];
    return (
        <View style={wrapperStyle}>
            <Button
                text={translate('common.more')}
                iconRight={icons.DownArrow}
                shouldShowRightIcon
                innerStyles={innerStyles}
                onPress={() => {}}
            />
        </View>
    );
}

function MoneyReportHeaderSecondaryActions({reportID, primaryAction, isReportInSearch, backTo, dropdownMenuRef}: MoneyReportHeaderSecondaryActionsProps) {
    return (
        <NavigationDeferredMount placeholder={<MoneyReportHeaderSecondaryActionsPlaceholder primaryAction={primaryAction} />}>
            <MoneyReportHeaderSecondaryActionsInner
                reportID={reportID}
                primaryAction={primaryAction}
                isReportInSearch={isReportInSearch}
                backTo={backTo}
                dropdownMenuRef={dropdownMenuRef}
            />
        </NavigationDeferredMount>
    );
}

export default MoneyReportHeaderSecondaryActions;
export type {MoneyReportHeaderSecondaryActionsProps};
