import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLoadingBarVisibility from '@hooks/useLoadingBarVisibility';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThrottledButtonState from '@hooks/useThrottledButtonState';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {deleteTrackExpense, initSplitExpense, markRejectViolationAsResolved} from '@libs/actions/IOU';
import {duplicateExpenseTransaction as duplicateTransactionAction} from '@libs/actions/IOU/Duplicate';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import {setNameValuePair} from '@libs/actions/User';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getTransactionThreadPrimaryAction, isMarkAsResolvedAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryTransactionThreadActions} from '@libs/ReportSecondaryActionUtils';
import {
    changeMoneyRequestHoldStatus,
    generateReportID,
    getPolicyExpenseChat,
    isCurrentUserSubmitter,
    isDM,
    isSelfDM,
    navigateToDetailsPage,
    rejectMoneyRequestReason,
} from '@libs/ReportUtils';
import {getReviewNavigationRoute} from '@libs/TransactionPreviewUtils';
import {
    getOriginalTransactionWithSplitInfo,
    hasPendingRTERViolation as hasPendingRTERViolationTransactionUtils,
    isDuplicate as isDuplicateTransactionUtils,
    isExpensifyCardTransaction,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isScanning,
    removeSettledAndApprovedTransactions,
    shouldShowBrokenConnectionViolation as shouldShowBrokenConnectionViolationTransactionUtils,
} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import {dismissRejectUseExplanation} from '@userActions/IOU';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, ReportAction, Transaction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import BrokenConnectionDescription from './BrokenConnectionDescription';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import ConfirmModal from './ConfirmModal';
import DecisionModal from './DecisionModal';
import {DelegateNoAccessContext} from './DelegateNoAccessModalProvider';
import HeaderWithBackButton from './HeaderWithBackButton';
import HoldOrRejectEducationalModal from './HoldOrRejectEducationalModal';
import HoldSubmitterEducationalModal from './HoldSubmitterEducationalModal';
import Icon from './Icon';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from './Icon/Expensicons';
import LoadingBar from './LoadingBar';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import MoneyRequestReportTransactionsNavigation from './MoneyRequestReportView/MoneyRequestReportTransactionsNavigation';
import {useSearchContext} from './Search/SearchContext';
import {WideRHPContext} from './WideRHPContextProvider';

type MoneyRequestHeaderProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policy which the report is tied to */
    policy: OnyxEntry<Policy>;

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: OnyxEntry<ReportAction>;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: (prioritizeBackTo?: boolean) => void;
};

function MoneyRequestHeader({report, parentReportAction, policy, onBackButtonPress}: MoneyRequestHeaderProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isInNarrowPaneModal} = useResponsiveLayout();
    const route = useRoute<
        PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT> | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
    >();
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {
        canBeMissing: false,
    });
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowSplit', 'ArrowCollapse']);
    const [transaction] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${
            isMoneyRequestAction(parentReportAction) ? (getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID
        }`,
        {canBeMissing: true},
    );
    const [originalTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transaction?.comment?.originalTransactionID)}`, {canBeMissing: true});
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(transactionReport?.policyID)}`, {canBeMissing: true});
    const [allPolicyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {canBeMissing: false});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const [policyRecentlyUsedCurrencies] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES, {canBeMissing: true});
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transaction?.transactionID ? [transaction.transactionID] : []);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [downloadErrorModalVisible, setDownloadErrorModalVisible] = useState(false);
    const [isHoldEducationalModalVisible, setIsHoldEducationalModalVisible] = useState(false);
    const [rejectModalAction, setRejectModalAction] = useState<ValueOf<
        typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    > | null>(null);
    const [isDuplicateActive, temporarilyDisableDuplicateAction] = useThrottledButtonState();
    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION, {canBeMissing: true});
    const [dismissedHoldUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {canBeMissing: true});
    const shouldShowLoadingBar = useLoadingBarVisibility();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, localeCompare} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCardHourglass', 'ReceiptScan']);
    const {login: currentUserLogin, email, accountID} = useCurrentUserPersonalDetails();
    const defaultExpensePolicy = useDefaultExpensePolicy();
    const activePolicyExpenseChat = getPolicyExpenseChat(accountID, defaultExpensePolicy?.id);
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isDuplicate = isDuplicateTransactionUtils(transaction, email ?? '', accountID, report, policy, transactionViolations);
    const reportID = report?.reportID;
    const {removeTransaction, currentSearchHash} = useSearchContext();
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const {deleteTransactions} = useDeleteTransactions({report: parentReport, reportActions: parentReportAction ? [parentReportAction] : [], policy});
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});

    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const isReportInRHP = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT;
    const isFromReviewDuplicates = !!route.params.backTo?.replaceAll(/\?.*/g, '').endsWith('/duplicates/review');
    const shouldDisplayTransactionNavigation = !!(reportID && isReportInRHP);
    const isParentReportArchived = useReportIsArchived(report?.parentReportID);
    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(parentReportAction);

    const hasPendingRTERViolation = hasPendingRTERViolationTransactionUtils(transactionViolations);

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationTransactionUtils(parentReport, policy, transactionViolations);
    const isReportSubmitter = isCurrentUserSubmitter(chatIOUReport);
    const isParentChatReportDM = isDM(chatIOUReport);

    // If the parent report is a selfDM, it should always be opened in the Inbox tab
    const shouldOpenParentReportInCurrentTab = !isSelfDM(parentReport);

    const {wideRHPRouteKeys} = useContext(WideRHPContext);
    const [network] = useOnyx(ONYXKEYS.NETWORK, {canBeMissing: true});
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE, {canBeMissing: true});

    const markAsCash = useCallback(() => {
        markAsCashAction(transaction?.transactionID, reportID, transactionViolations);
    }, [reportID, transaction?.transactionID, transactionViolations]);

    const duplicateTransaction = useCallback(
        (transactions: Transaction[]) => {
            if (!transactions.length) {
                return;
            }

            const optimisticChatReportID = generateReportID();
            const optimisticIOUReportID = generateReportID();

            const activePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${defaultExpensePolicy?.id}`] ?? {};

            for (const item of transactions) {
                duplicateTransactionAction({
                    transaction: item,
                    optimisticChatReportID,
                    optimisticIOUReportID,
                    isASAPSubmitBetaEnabled,
                    introSelected,
                    activePolicyID,
                    quickAction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    targetPolicy: defaultExpensePolicy ?? undefined,
                    targetPolicyCategories: activePolicyCategories,
                    targetReport: activePolicyExpenseChat,
                });
            }
        },
        [activePolicyExpenseChat, allPolicyCategories, defaultExpensePolicy, isASAPSubmitBetaEnabled, introSelected, activePolicyID, quickAction, policyRecentlyUsedCurrencies],
    );

    const getStatusIcon: (src: IconAsset) => ReactNode = (src) => (
        <Icon
            src={src}
            height={variables.iconSizeSmall}
            width={variables.iconSizeSmall}
            fill={theme.icon}
        />
    );

    const getStatusBarProps: () => MoneyRequestHeaderStatusBarProps | undefined = () => {
        if (isOnHold) {
            return {icon: getStatusIcon(Expensicons.Stopwatch), description: translate('iou.expenseOnHold')};
        }
        if (isMarkAsResolvedAction(parentReport, transactionViolations, policy)) {
            return {icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.reject.rejectedStatus')};
        }

        if (isDuplicate) {
            return {icon: getStatusIcon(Expensicons.Flag), description: translate('iou.expenseDuplicate')};
        }

        if (isExpensifyCardTransaction(transaction) && isPending(transaction)) {
            return {icon: getStatusIcon(icons.CreditCardHourglass), description: translate('iou.transactionPendingDescription')};
        }
        if (!!transaction?.transactionID && !!transactionViolations.length && shouldShowBrokenConnectionViolation) {
            return {
                icon: getStatusIcon(Expensicons.Hourglass),
                description: (
                    <BrokenConnectionDescription
                        transactionID={transaction?.transactionID}
                        report={parentReport}
                        policy={policy}
                    />
                ),
            };
        }
        if (hasPendingRTERViolation) {
            return {icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.pendingMatchWithCreditCardDescription')};
        }
        if (isScanning(transaction)) {
            return {icon: getStatusIcon(icons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription')};
        }
    };

    const statusBarProps = getStatusBarProps();

    const primaryAction = useMemo(() => {
        if (!report || !parentReport || !transaction) {
            return '';
        }
        return getTransactionThreadPrimaryAction(currentUserLogin ?? '', accountID, report, parentReport, transaction, transactionViolations, policy, isFromReviewDuplicates);
    }, [parentReport, policy, report, transaction, transactionViolations, isFromReviewDuplicates, currentUserLogin, accountID]);

    const primaryActionImplementation = {
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD]: (
            <Button
                success
                text={translate('iou.unhold')}
                onPress={() => {
                    if (isDelegateAccessRestricted) {
                        showDelegateNoAccessModal();
                        return;
                    }

                    changeMoneyRequestHoldStatus(parentReportAction);
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
                            policyCategories,
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

    const secondaryActions = useMemo(() => {
        if (!transaction || !parentReportAction || !parentReport) {
            return [];
        }
        return getSecondaryTransactionThreadActions(currentUserLogin ?? '', accountID, parentReport, transaction, parentReportAction, originalTransaction, policy, report);
    }, [parentReport, transaction, parentReportAction, currentUserLogin, policy, report, originalTransaction, accountID]);

    const dismissModalAndUpdateUseHold = () => {
        setIsHoldEducationalModalVisible(false);
        setNameValuePair(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, true, false, !network?.shouldFailAllRequests);
        if (parentReportAction) {
            changeMoneyRequestHoldStatus(parentReportAction);
        }
    };

    const dismissRejectModalBasedOnAction = () => {
        if (rejectModalAction === CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD) {
            dismissRejectUseExplanation();
            if (parentReportAction) {
                changeMoneyRequestHoldStatus(parentReportAction);
            }
        } else {
            dismissRejectUseExplanation();
            if (parentReportAction) {
                rejectMoneyRequestReason(parentReportAction);
            }
        }
        setRejectModalAction(null);
    };

    const secondaryActionsImplementation: Partial<
        Record<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>, DropdownOption<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>>>
    > = {
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD]: {
            text: translate('iou.hold'),
            icon: Expensicons.Stopwatch,
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
                    changeMoneyRequestHoldStatus(parentReportAction);
                } else if (isReportSubmitter) {
                    setIsHoldEducationalModalVisible(true);
                } else {
                    setRejectModalAction(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD);
                }
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REMOVE_HOLD]: {
            text: translate('iou.unhold'),
            icon: Expensicons.Stopwatch,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REMOVE_HOLD,
            onSelected: () => {
                if (!parentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                changeMoneyRequestHoldStatus(parentReportAction);
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT]: {
            text: isExpenseSplit ? translate('iou.editSplits') : translate('iou.split'),
            icon: expensifyIcons.ArrowSplit,
            value: CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
            onSelected: () => {
                initSplitExpense(allTransactions, allReports, transaction);
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
            text: isDuplicateActive ? translate('common.duplicate') : translate('common.duplicated'),
            icon: isDuplicateActive ? Expensicons.ReceiptMultiple : Expensicons.CheckmarkCircle,
            value: CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE,
            onSelected: () => {
                if (!isDuplicateActive || !transaction) {
                    return;
                }

                temporarilyDisableDuplicateAction();

                duplicateTransaction([transaction]);
            },
            shouldCloseModalOnSelect: false,
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS]: {
            value: CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
            text: translate('iou.viewDetails'),
            icon: Expensicons.Info,
            onSelected: () => {
                navigateToDetailsPage(report, Navigation.getActiveRoute());
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.DELETE]: {
            text: translate('common.delete'),
            icon: Expensicons.Trashcan,
            value: CONST.REPORT.SECONDARY_ACTIONS.DELETE,
            onSelected: () => {
                setIsDeleteModalVisible(true);
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT]: {
            text: translate('common.reject'),
            icon: Expensicons.ThumbsDown,
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
    };

    const applicableSecondaryActions = secondaryActions.map((action) => secondaryActionsImplementation[action]).filter((action): action is NonNullable<typeof action> => !!action);
    const shouldDisplayNarrowMoreButton = !shouldUseNarrowLayout || (wideRHPRouteKeys.length > 0 && !isSmallScreenWidth);

    return (
        <View style={[styles.pl0, styles.borderBottom]}>
            <HeaderWithBackButton
                shouldShowBorderBottom={false}
                shouldShowReportAvatarWithDisplay
                shouldShowPinButton={false}
                report={
                    reportID
                        ? {
                              ...report,
                              reportID,
                              ownerAccountID: parentReport?.ownerAccountID,
                          }
                        : undefined
                }
                shouldShowBackButton={shouldUseNarrowLayout}
                shouldDisplaySearchRouter={!isReportInRHP}
                shouldDisplayHelpButton={!isReportInRHP}
                onBackButtonPress={() => onBackButtonPress(isFromReviewDuplicates)}
                shouldEnableDetailPageNavigation
                openParentReportInCurrentTab={shouldOpenParentReportInCurrentTab}
            >
                {shouldDisplayNarrowMoreButton && (
                    <View style={[styles.flexRow, styles.gap2, shouldDisplayTransactionNavigation && styles.mr3]}>
                        {!!primaryAction && primaryActionImplementation[primaryAction]}
                        {!!applicableSecondaryActions.length && (
                            <ButtonWithDropdownMenu
                                success={false}
                                onPress={() => {}}
                                shouldAlwaysShowDropdownMenu
                                customText={translate('common.more')}
                                options={applicableSecondaryActions}
                                isSplitButton={false}
                            />
                        )}
                    </View>
                )}
                {shouldDisplayTransactionNavigation && !!transaction && (
                    <MoneyRequestReportTransactionsNavigation
                        currentTransactionID={transaction.transactionID}
                        isFromReviewDuplicates={isFromReviewDuplicates}
                    />
                )}
            </HeaderWithBackButton>
            {!shouldDisplayNarrowMoreButton && (
                <View style={[styles.flexRow, styles.gap2, styles.pb3, styles.ph5, styles.w100, styles.alignItemsCenter, styles.justifyContentCenter]}>
                    {!!primaryAction && <View style={[styles.flexGrow4]}>{primaryActionImplementation[primaryAction]}</View>}
                    {!!applicableSecondaryActions.length && (
                        <ButtonWithDropdownMenu
                            success={false}
                            onPress={() => {}}
                            shouldAlwaysShowDropdownMenu
                            customText={translate('common.more')}
                            options={applicableSecondaryActions}
                            isSplitButton={false}
                            wrapperStyle={[!primaryAction && styles.flexGrow4]}
                        />
                    )}
                </View>
            )}
            {!!statusBarProps && (
                <View style={[styles.ph5, styles.pb3]}>
                    <MoneyRequestHeaderStatusBar
                        icon={statusBarProps.icon}
                        description={statusBarProps.description}
                    />
                </View>
            )}
            <LoadingBar shouldShow={shouldShowLoadingBar && shouldUseNarrowLayout} />
            <DecisionModal
                title={translate('common.downloadFailedTitle')}
                prompt={translate('common.downloadFailedDescription')}
                onSecondOptionSubmit={() => setDownloadErrorModalVisible(false)}
                secondOptionText={translate('common.buttonConfirm')}
                isVisible={downloadErrorModalVisible}
                onClose={() => setDownloadErrorModalVisible(false)}
            />
            <ConfirmModal
                title={translate('iou.deleteExpense', {count: 1})}
                isVisible={isDeleteModalVisible}
                onConfirm={() => {
                    setIsDeleteModalVisible(false);
                    if (!parentReportAction || !transaction) {
                        throw new Error('Data missing');
                    }
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
                }}
                onCancel={() => setIsDeleteModalVisible(false)}
                prompt={translate('iou.deleteConfirmation', {count: 1})}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
                shouldEnableNewFocusManagement
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
        </View>
    );
}

export default MoneyRequestHeader;
