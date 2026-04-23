import {useRoute} from '@react-navigation/native';
import {shouldFailAllRequestsSelector} from '@selectors/Network';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import React, {useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {ValueOf} from 'type-fest';
import useConfirmModal from '@hooks/useConfirmModal';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useHasMultipleSplitChildren from '@hooks/useHasMultipleSplitChildren';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {duplicateExpenseTransaction as duplicateTransactionAction} from '@libs/actions/IOU/Duplicate';
import {deleteTrackExpense} from '@libs/actions/IOU/TrackExpense';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import initSplitExpense from '@libs/actions/SplitExpenses';
import {setNameValuePair} from '@libs/actions/User';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getExistingTransactionID} from '@libs/IOUUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getTransactionThreadPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryTransactionThreadActions} from '@libs/ReportSecondaryActionUtils';
import {
    changeMoneyRequestHoldStatus,
    generateReportID,
    getPolicyExpenseChat,
    isCurrentUserSubmitter,
    isDM,
    isExpenseReport,
    isOpenReport,
    isSelfDM,
    navigateToDetailsPage,
    rejectMoneyRequestReason,
} from '@libs/ReportUtils';
import {
    getOriginalTransactionWithSplitInfo,
    hasCustomUnitOutOfPolicyViolation as hasCustomUnitOutOfPolicyViolationTransactionUtils,
    isDistanceRequest,
    isPerDiemRequest,
} from '@libs/TransactionUtils';
import {dismissRejectUseExplanation} from '@userActions/IOU/RejectMoneyRequest';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {ButtonWithDropdownMenuRef, DropdownOption} from './ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import HoldOrRejectEducationalModal from './HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from './HoldSubmitterEducationalModal';
import {ModalActions} from './Modal/Global/ModalContext';
import {usePersonalDetails} from './OnyxListItemProvider';
import {useSearchActionsContext, useSearchStateContext} from './Search/SearchContext';
import {useWideRHPState} from './WideRHPContextProvider';

type MoneyRequestHeaderSecondaryActionsProps = {
    /** The report ID for the current transaction thread */
    reportID: string | undefined;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: (prioritizeBackTo?: boolean) => void;
};

function MoneyRequestHeaderSecondaryActions({reportID, onBackButtonPress}: MoneyRequestHeaderSecondaryActionsProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isInNarrowPaneModal, shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
    >();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, localeCompare} = useLocalize();
    const {login: currentUserLogin, accountID} = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();

    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'ArrowCollapse',
        'ArrowSplit',
        'Checkmark',
        'DocumentMerge',
        'ExpenseCopy',
        'Info',
        'Stopwatch',
        'ThumbsDown',
        'Trashcan',
    ] as const);

    const {wideRHPRouteKeys} = useWideRHPState();
    const isNarrow = !shouldUseNarrowLayout || (wideRHPRouteKeys.length > 0 && !isSmallScreenWidth);
    const {isOffline} = useNetwork();

    // Per-key Onyx subscriptions
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`, {canEvict: false});
    const parentReportAction = report?.parentReportActionID ? parentReportActions?.[report.parentReportActionID] : undefined;
    const transactionIDFromAction = isMoneyRequestAction(parentReportAction)
        ? (getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID)
        : CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDFromAction}`, {});
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`);
    const transactionViolations = useTransactionViolations(transaction?.transactionID);

    // Collection Onyx subscriptions (isolated here to prevent parent header re-renders)
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [transactionDrafts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {selector: validTransactionDraftsSelector});

    // NVP subscriptions
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION);
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION);
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [shouldFailAllRequests] = useOnyx(ONYXKEYS.NETWORK, {selector: shouldFailAllRequestsSelector});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    // Custom hooks
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const [defaultPolicyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(defaultExpensePolicy?.id)}`);
    const [defaultPolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(defaultExpensePolicy?.id)}`);
    const {policyForMovingExpenses, shouldSelectPolicy} = usePolicyForMovingExpenses(isPerDiemRequest(transaction));
    const shouldNavigateToUpgradePath = !policyForMovingExpenses && !shouldSelectPolicy;
    const {deleteTransactions} = useDeleteTransactions({report: parentReport, reportActions: parentReportAction ? [parentReportAction] : [], policy});
    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(parentReportAction);
    const isParentReportArchived = useReportIsArchived(report?.parentReportID);
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const {showConfirmModal} = useConfirmModal();
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {currentSearchHash} = useSearchStateContext();
    const {removeTransaction} = useSearchActionsContext();
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transaction?.transactionID ? [transaction.transactionID] : []);
    const isReportInSearch = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT || route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT;
    const {getCurrencyDecimals} = useCurrencyListActions();

    // State
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<ValueOf<
        typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    > | null>(null);
    const dropdownMenuRef = useRef<ButtonWithDropdownMenuRef>(null);

    // Derived computations
    const hasPrimaryAction = !!(
        report &&
        parentReport &&
        transaction &&
        getTransactionThreadPrimaryAction(currentUserLogin ?? '', accountID, report, parentReport, transaction, transactionViolations, policy, false)
    );
    const activePolicyExpenseChat = getPolicyExpenseChat(accountID, defaultExpensePolicy?.id);
    const isPerDiemRequestOnNonDefaultWorkspace = isPerDiemRequest(transaction) && defaultExpensePolicy?.id !== policy?.id;
    const hasCustomUnitOutOfPolicyViolation = hasCustomUnitOutOfPolicyViolationTransactionUtils(transactionViolations);
    const isParentChatReportDM = isDM(chatIOUReport);
    const isDistanceExpenseUnsupportedForDuplicating = !!(
        isDistanceRequest(transaction) &&
        (isParentReportArchived || (activePolicyExpenseChat && (isSelfDM(parentReport) || isParentChatReportDM)))
    );
    const shouldDuplicateCloseModalOnSelect = isDistanceExpenseUnsupportedForDuplicating || hasCustomUnitOutOfPolicyViolation || isPerDiemRequestOnNonDefaultWorkspace;
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
    const hasMultipleSplits = useHasMultipleSplitChildren(transaction?.comment?.originalTransactionID);
    const isReportOpen = isOpenReport(parentReport);
    const shouldShowSplitIndicator = isExpenseSplit && (hasMultipleSplits || isReportOpen);
    const isReportSubmitter = isCurrentUserSubmitter(chatIOUReport);
    const draftTransactionIDs = Object.keys(transactionDrafts ?? {});
    const targetPolicyTags = defaultPolicyTags ?? {};

    // Duplicate action throttle
    const handleDuplicateReset = () => {
        if (shouldDuplicateCloseModalOnSelect) {
            return;
        }
        dropdownMenuRef.current?.setIsMenuVisible(false);
    };
    const [isDuplicateActive, temporarilyDisableDuplicateAction] = useThrottledButtonState(handleDuplicateReset);

    const duplicateTransaction = (transactions: Transaction[]) => {
        if (!transactions.length) {
            return;
        }

        const optimisticChatReportID = generateReportID();
        const optimisticIOUReportID = generateReportID();
        const activePolicyCategoriesMap = defaultPolicyCategories ?? {};

        for (const item of transactions) {
            const existingTransactionID = getExistingTransactionID(item.linkedTrackedExpenseReportAction);
            const existingTransactionDraft = existingTransactionID ? transactionDrafts?.[existingTransactionID] : undefined;

            duplicateTransactionAction({
                transaction: item,
                optimisticChatReportID,
                optimisticIOUReportID,
                isASAPSubmitBetaEnabled,
                introSelected,
                activePolicyID,
                quickAction,
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                isSelfTourViewed,
                customUnitPolicyID: policy?.id,
                targetPolicy: defaultExpensePolicy ?? undefined,
                targetPolicyCategories: activePolicyCategoriesMap,
                targetReport: activePolicyExpenseChat,
                existingTransactionDraft,
                draftTransactionIDs,
                betas,
                personalDetails,
                recentWaypoints,
                targetPolicyTags,
            });
        }
    };

    const dismissModalAndUpdateUseHold = () => {
        setIsHoldEducationalModalVisible(false);
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !shouldFailAllRequests);
        if (parentReportAction) {
            changeMoneyRequestHoldStatus(parentReportAction, transaction, isOffline);
        }
    };

    const dismissRejectModalBasedOnAction = () => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD) {
            dismissRejectUseExplanation();
            if (parentReportAction) {
                changeMoneyRequestHoldStatus(parentReportAction, transaction, isOffline);
            }
        } else {
            dismissRejectUseExplanation();
            if (parentReportAction) {
                rejectMoneyRequestReason(parentReportAction);
            }
        }
        setRejectModalAction(null);
    };

    // Secondary actions
    const secondaryActions = (() => {
        if (!transaction || !parentReportAction || !parentReport) {
            return [];
        }
        return getSecondaryTransactionThreadActions(
            currentUserLogin ?? '',
            accountID,
            parentReport,
            transaction,
            parentReportAction,
            originalTransaction,
            policy,
            report,
            outstandingReportsByPolicyID,
            isChatIOUReportArchived,
        );
    })();

    const secondaryActionsImplementation: Partial<
        Record<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>, DropdownOption<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>>>
    > = {
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD]: {
            text: translate('iou.hold'),
            icon: expensifyIcons.Stopwatch,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD,
            onSelected: () => {
                if (!parentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                const isDismissed = isReportSubmitter ? dismissedHoldUseExplanation : dismissedRejectUseExplanation;
                if (isDismissed || isParentChatReportDM) {
                    changeMoneyRequestHoldStatus(parentReportAction, transaction, isOffline);
                } else if (isReportSubmitter) {
                    setIsHoldEducationalModalVisible(true);
                } else {
                    setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
                }
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REMOVE_HOLD]: {
            text: translate('iou.unhold'),
            icon: expensifyIcons.Stopwatch,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REMOVE_HOLD,
            onSelected: () => {
                if (!parentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                changeMoneyRequestHoldStatus(parentReportAction, transaction, isOffline);
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT]: {
            text: shouldShowSplitIndicator ? translate('iou.editSplits') : translate('iou.split'),
            icon: expensifyIcons.ArrowSplit,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT,
            onSelected: () => {
                initSplitExpense(transaction, policy);
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MERGE]: {
            text: translate('common.merge'),
            icon: expensifyIcons.ArrowCollapse,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MERGE,
            onSelected: () => {
                if (!transaction) {
                    return;
                }
                const isOnSearch = route.name.toLowerCase().startsWith('search');
                setupMergeTransactionDataAndNavigate(transaction.transactionID, [transaction], localeCompare, getCurrencyDecimals, [], false, isOnSearch);
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.DUPLICATE]: {
            text: isDuplicateActive ? translate('common.duplicateExpense') : translate('common.duplicated'),
            icon: isDuplicateActive ? expensifyIcons.ExpenseCopy : expensifyIcons.Checkmark,
            iconFill: isDuplicateActive ? undefined : theme.icon,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.DUPLICATE,
            onSelected: () => {
                if (hasCustomUnitOutOfPolicyViolation) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.correctRateError'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (isDistanceExpenseUnsupportedForDuplicating) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.cannotDuplicateDistanceExpense'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (isPerDiemRequestOnNonDefaultWorkspace) {
                    showConfirmModal({
                        title: translate('common.duplicateExpense'),
                        prompt: translate('iou.duplicateNonDefaultWorkspacePerDiemError'),
                        confirmText: translate('common.buttonConfirm'),
                        shouldShowCancelButton: false,
                    });
                    return;
                }

                if (!isDuplicateActive || !transaction) {
                    return;
                }

                temporarilyDisableDuplicateAction();
                duplicateTransaction([transaction]);
            },
            shouldCloseModalOnSelect: shouldDuplicateCloseModalOnSelect,
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
            text: translate('iou.viewDetails'),
            icon: expensifyIcons.Info,
            onSelected: () => {
                navigateToDetailsPage(report, Navigation.getActiveRoute());
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.DELETE]: {
            text: translate('common.delete'),
            icon: expensifyIcons.Trashcan,
            value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
            onSelected: () => {
                showConfirmModal({
                    title: translate('iou.deleteExpense', {count: 1}),
                    prompt: translate('iou.deleteConfirmation', {count: 1}),
                    confirmText: translate('common.delete'),
                    cancelText: translate('common.cancel'),
                    danger: true,
                    shouldEnableNewFocusManagement: true,
                }).then((result) => {
                    if (result.action !== ModalActions.CONFIRM) {
                        return;
                    }
                    if (!parentReportAction || !transaction) {
                        throw new Error('Data missing');
                    }
                    const backToRoute = route.params?.backTo ?? Navigation.getActiveRoute();
                    setDeleteTransactionNavigateBackUrl(backToRoute);
                    if (isTrackExpenseAction(parentReportAction)) {
                        deleteTrackExpense({
                            chatReportID: report?.parentReportID,
                            chatReport: parentReport,
                            transactionID: transaction.transactionID,
                            reportAction: parentReportAction,
                            iouReport,
                            chatIOUReport,
                            transactions: duplicateTransactions,
                            violations: duplicateTransactionViolations,
                            isSingleTransactionView: true,
                            isChatReportArchived: isParentReportArchived,
                            isChatIOUReportArchived,
                            allTransactionViolationsParam: allTransactionViolations,
                            currentUserAccountID: accountID,
                            currentUserEmail: currentUserLogin ?? '',
                        });
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-deprecated
                        InteractionManager.runAfterInteractions(() => {
                            deleteTransactions([transaction.transactionID], duplicateTransactions, duplicateTransactionViolations, isReportInSearch ? currentSearchHash : undefined, true);
                            removeTransaction(transaction.transactionID);
                        });
                    }
                    if (isInNarrowPaneModal) {
                        Navigation.navigateBackToLastSuperWideRHPScreen();
                        return;
                    }

                    onBackButtonPress();
                });
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT]: {
            text: translate('common.reject'),
            icon: expensifyIcons.ThumbsDown,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT,
            onSelected: () => {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                if (dismissedRejectUseExplanation) {
                    if (parentReportAction) {
                        rejectMoneyRequestReason(parentReportAction);
                    }
                } else {
                    setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
                }
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MOVE_EXPENSE]: {
            text: translate('iou.moveExpenses'),
            icon: expensifyIcons.DocumentMerge,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MOVE_EXPENSE,
            onSelected: () => {
                if (!parentReport || !transaction?.transactionID) {
                    return;
                }
                const iouType = isExpenseReport(parentReport) ? CONST.IOU.TYPE.SUBMIT : CONST.IOU.TYPE.TRACK;
                if (shouldNavigateToUpgradePath && reportID) {
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                            action: CONST.IOU.ACTION.EDIT,
                            iouType,
                            transactionID: transaction.transactionID,
                            reportID,
                            upgradePath: CONST.UPGRADE_PATHS.REPORTS,
                        }),
                    );
                    return;
                }
                Navigation.navigate(
                    ROUTES.MONEY_REQUEST_EDIT_REPORT.getRoute(CONST.IOU.ACTION.EDIT, iouType, parentReport.reportID, true, Navigation.getActiveRoute(), transaction.transactionID),
                );
            },
        },
    };

    const applicableSecondaryActions = secondaryActions.map((action) => secondaryActionsImplementation[action]).filter((action): action is NonNullable<typeof action> => !!action);

    if (!applicableSecondaryActions.length) {
        return null;
    }

    return (
        <>
            <ButtonWithDropdownMenu
                ref={dropdownMenuRef}
                success={false}
                onPress={() => {}}
                shouldAlwaysShowDropdownMenu
                customText={translate('common.more')}
                options={applicableSecondaryActions}
                isSplitButton={false}
                wrapperStyle={!isNarrow && !hasPrimaryAction ? [styles.flexGrow4] : undefined}
            />
            {!!rejectModalAction && (
                <HoldOrRejectEducationalModal
                    onClose={dismissRejectModalBasedOnAction}
                    onConfirm={dismissRejectModalBasedOnAction}
                />
            )}
            {!!isHoldEducationalModalVisible && (
                <HoldSubmitterEducationalModal
                    onClose={dismissModalAndUpdateUseHold}
                    onConfirm={dismissModalAndUpdateUseHold}
                />
            )}
        </>
    );
}

MoneyRequestHeaderSecondaryActions.displayName = 'MoneyRequestHeaderSecondaryActions';

export default MoneyRequestHeaderSecondaryActions;
