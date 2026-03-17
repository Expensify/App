import {useRoute} from '@react-navigation/native';
import {shouldFailAllRequestsSelector} from '@selectors/Network';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {validTransactionDraftsSelector} from '@selectors/TransactionDraft';
import type {ReactNode} from 'react';
import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {deleteTrackExpense, markRejectViolationAsResolved} from '@libs/actions/IOU';
import {duplicateExpenseTransaction as duplicateTransactionAction} from '@libs/actions/IOU/Duplicate';
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
import {getReviewNavigationRoute} from '@libs/TransactionPreviewUtils';
import {
    getOriginalTransactionWithSplitInfo,
    hasCustomUnitOutOfPolicyViolation as hasCustomUnitOutOfPolicyViolationTransactionUtils,
    hasMultipleSplitChildren,
    isDistanceRequest,
    isPerDiemRequest,
    removeSettledAndApprovedTransactions,
} from '@libs/TransactionUtils';
import {dismissRejectUseExplanation} from '@userActions/IOU';
import {setDeleteTransactionNavigateBackUrl} from '@userActions/Report';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Transaction} from '@src/types/onyx';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {ButtonWithDropdownMenuRef, DropdownOption} from './ButtonWithDropdownMenu/types';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from './DelegateNoAccessModalProvider';
import HoldOrRejectEducationalModal from './HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from './HoldSubmitterEducationalModal';
import {ModalActions} from './Modal/Global/ModalContext';
import {usePersonalDetails} from './OnyxListItemProvider';
import {useSearchActionsContext, useSearchStateContext} from './Search/SearchContext';

type MoneyRequestHeaderActionsProps = {
    /** The report ID for the current transaction thread */
    reportID: string | undefined;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: (prioritizeBackTo?: boolean) => void;

    /** Whether the actions render inline in HeaderWithBackButton (narrow) or below it (wide) */
    isNarrow: boolean;
};

function MoneyRequestHeaderActions({reportID, onBackButtonPress, isNarrow}: MoneyRequestHeaderActionsProps) {
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const route = useRoute<
        PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT> | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
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

    // Per-key Onyx subscriptions — derived from reportID
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const parentReportActionID = report?.parentReportActionID;
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`, {canEvict: false});
    const parentReportAction = parentReportActionID ? parentReportActions?.[parentReportActionID] : undefined;
    const transactionIDFromAction = isMoneyRequestAction(parentReportAction)
        ? (getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID)
        : CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDFromAction}`, {});
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`);
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`);
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(transactionReport?.policyID)}`);
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${getNonEmptyStringOnyxID(transactionReport?.policyID)}`);
    const transactionViolations = useTransactionViolations(transaction?.transactionID);

    // Collection Onyx subscriptions (isolated here to prevent parent header re-renders)
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES);
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allPolicyTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS);
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
    const {removeTransaction, setSelectedTransactions} = useSearchActionsContext();
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transaction?.transactionID ? [transaction.transactionID] : []);

    // State
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<ValueOf<
        typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    > | null>(null);
    const dropdownMenuRef = useRef<ButtonWithDropdownMenuRef>(null);

    // Derived computations
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
    const hasMultipleSplits = hasMultipleSplitChildren(allTransactions, allReports, transaction?.comment?.originalTransactionID);
    const isReportOpen = isOpenReport(parentReport);
    const shouldShowSplitIndicator = isExpenseSplit && (hasMultipleSplits || isReportOpen);
    const isReportSubmitter = isCurrentUserSubmitter(chatIOUReport);
    const draftTransactionIDs = Object.keys(transactionDrafts ?? {});
    const isFromReviewDuplicates = !!route.params.backTo?.replaceAll(/\?.*/g, '').endsWith('/duplicates/review');
    const shouldDisplayTransactionNavigation = !!(reportID && route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT);
    const targetPolicyTags = defaultExpensePolicy ? (allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${defaultExpensePolicy.id}`] ?? {}) : {};

    // Duplicate action throttle
    const handleDuplicateReset = () => {
        if (shouldDuplicateCloseModalOnSelect) {
            return;
        }
        dropdownMenuRef.current?.setIsMenuVisible(false);
    };
    const [isDuplicateActive, temporarilyDisableDuplicateAction] = useThrottledButtonState(handleDuplicateReset);

    const markAsCash = () => {
        markAsCashAction(transaction?.transactionID, reportID, transactionViolations);
    };

    const duplicateTransaction = (transactions: Transaction[]) => {
        if (!transactions.length) {
            return;
        }

        const optimisticChatReportID = generateReportID();
        const optimisticIOUReportID = generateReportID();
        const activePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${defaultExpensePolicy?.id}`] ?? {};

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
                targetPolicyCategories: activePolicyCategories,
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
            changeMoneyRequestHoldStatus(parentReportAction, transaction);
        }
    };

    const dismissRejectModalBasedOnAction = () => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD) {
            dismissRejectUseExplanation();
            if (parentReportAction) {
                changeMoneyRequestHoldStatus(parentReportAction, transaction);
            }
        } else {
            dismissRejectUseExplanation();
            if (parentReportAction) {
                rejectMoneyRequestReason(parentReportAction);
            }
        }
        setRejectModalAction(null);
    };

    // Primary action
    const primaryAction = (() => {
        if (!report || !parentReport || !transaction) {
            return '';
        }
        return getTransactionThreadPrimaryAction(currentUserLogin ?? '', accountID, report, parentReport, transaction, transactionViolations, policy, isFromReviewDuplicates);
    })();

    const primaryActionImplementation: Record<string, ReactNode> = {
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD]: (
            <Button
                success
                text={translate('iou.unhold')}
                onPress={() => {
                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }
                    changeMoneyRequestHoldStatus(parentReportAction, transaction);
                }}
            />
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_RESOLVED]: (
            <Button
                success
                onPress={() => {
                    if (!transaction?.transactionID) {
                        return;
                    }
                    markRejectViolationAsResolved(transaction?.transactionID, reportID);
                }}
                text={translate('iou.reject.markAsResolved')}
            />
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REVIEW_DUPLICATES]: (
            <Button
                success
                text={translate('iou.reviewDuplicates')}
                onPress={() => {
                    if (!reportID) {
                        return;
                    }
                    Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(reportID, Navigation.getReportRHPActiveRoute()));
                }}
            />
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.KEEP_THIS_ONE]: (
            <Button
                success
                text={translate('violations.keepThisOne')}
                onPress={() => {
                    if (!reportID) {
                        return;
                    }
                    Navigation.navigate(
                        getReviewNavigationRoute(
                            Navigation.getActiveRoute(),
                            reportID,
                            transaction,
                            removeSettledAndApprovedTransactions(Object.values(duplicateTransactions ?? {}).filter((t) => t?.transactionID !== transaction?.transactionID)),
                            policy,
                            policyCategories,
                            policyTags ?? {},
                            transactionReport,
                        ),
                    );
                }}
            />
        ),
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH]: (
            <Button
                success
                text={translate('iou.markAsCash')}
                onPress={markAsCash}
            />
        ),
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
                    changeMoneyRequestHoldStatus(parentReportAction, transaction);
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

                changeMoneyRequestHoldStatus(parentReportAction, transaction);
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT]: {
            text: shouldShowSplitIndicator ? translate('iou.editSplits') : translate('iou.split'),
            icon: expensifyIcons.ArrowSplit,
            value: CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
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
                setupMergeTransactionDataAndNavigate(transaction.transactionID, [transaction], localeCompare, [], false, isOnSearch);
            },
        },
        [CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE]: {
            text: isDuplicateActive ? translate('common.duplicateExpense') : translate('common.duplicated'),
            icon: isDuplicateActive ? expensifyIcons.ExpenseCopy : expensifyIcons.Checkmark,
            iconFill: isDuplicateActive ? undefined : theme.icon,
            value: CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE,
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
                        });
                    } else {
                        deleteTransactions([transaction.transactionID], duplicateTransactions, duplicateTransactionViolations, currentSearchHash, true);
                        removeTransaction(transaction.transactionID);
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
                setSelectedTransactions([transaction.transactionID]);
                Navigation.navigate(ROUTES.MONEY_REQUEST_EDIT_REPORT.getRoute(CONST.IOU.ACTION.EDIT, iouType, parentReport.reportID, true, Navigation.getActiveRoute()));
            },
        },
    };

    const applicableSecondaryActions = secondaryActions.map((action) => secondaryActionsImplementation[action]).filter((action): action is NonNullable<typeof action> => !!action);

    if (!primaryAction && !applicableSecondaryActions.length) {
        return null;
    }

    return (
        <>
            <View
                style={
                    isNarrow
                        ? [styles.flexRow, styles.gap2, shouldDisplayTransactionNavigation && styles.mr3]
                        : [styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]
                }
            >
                {!!primaryAction && (isNarrow ? primaryActionImplementation[primaryAction] : <View style={[styles.flexGrow4]}>{primaryActionImplementation[primaryAction]}</View>)}
                {!!applicableSecondaryActions.length && (
                    <ButtonWithDropdownMenu
                        ref={dropdownMenuRef}
                        success={false}
                        onPress={() => {}}
                        shouldAlwaysShowDropdownMenu
                        customText={translate('common.more')}
                        options={applicableSecondaryActions}
                        isSplitButton={false}
                        wrapperStyle={!isNarrow ? [!primaryAction && styles.flexGrow4] : undefined}
                    />
                )}
            </View>
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

MoneyRequestHeaderActions.displayName = 'MoneyRequestHeaderActions';

export default MoneyRequestHeaderActions;
