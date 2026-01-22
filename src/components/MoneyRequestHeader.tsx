import {useRoute} from '@react-navigation/native';
import React, {useCallback, useContext, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useConfirmModal, {ConfirmModalActions} from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDeleteTransactions from '@hooks/useDeleteTransactions';
import useDuplicateExpenseAction from '@hooks/useDuplicateExpenseAction';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useGetIOUReportFromReportAction from '@hooks/useGetIOUReportFromReportAction';
import useHoldEducationalModal from '@hooks/useHoldEducationalModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLoadingBarVisibility from '@hooks/useLoadingBarVisibility';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {deleteTrackExpense, initSplitExpense, markRejectViolationAsResolved} from '@libs/actions/IOU';
import {setupMergeTransactionDataAndNavigate} from '@libs/actions/MergeTransaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getTransactionThreadPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryTransactionThreadActions} from '@libs/ReportSecondaryActionUtils';
import {changeMoneyRequestHoldStatus, isCurrentUserSubmitter, isDM, isSelfDM, navigateToDetailsPage, rejectMoneyRequestReason} from '@libs/ReportUtils';
import {getReviewNavigationRoute} from '@libs/TransactionPreviewUtils';
import {getOriginalTransactionWithSplitInfo, removeSettledAndApprovedTransactions} from '@libs/TransactionUtils';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import {DelegateNoAccessContext} from './DelegateNoAccessModalProvider';
import HeaderWithBackButton from './HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from './Icon/Expensicons';
import LoadingBar from './LoadingBar';
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
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: true});
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transaction?.transactionID ? [transaction.transactionID] : []);
    const shouldShowLoadingBar = useLoadingBarVisibility();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {login: currentUserLogin, email, accountID} = useCurrentUserPersonalDetails();
    const reportID = report?.reportID;
    const {removeTransaction, currentSearchHash} = useSearchContext();
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const {deleteTransactions} = useDeleteTransactions({report: parentReport, reportActions: parentReportAction ? [parentReportAction] : [], policy});

    // New hooks
    const {showConfirmModal} = useConfirmModal();
    const {showEducationalModalIfNeeded} = useHoldEducationalModal();
    const {isDuplicateActive, temporarilyDisableDuplicateAction, duplicateTransaction} = useDuplicateExpenseAction(accountID);

    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const isReportInRHP = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT;
    const isFromReviewDuplicates = !!route.params.backTo?.replaceAll(/\?.*/g, '').endsWith('/duplicates/review');
    const shouldDisplayTransactionNavigation = !!(reportID && isReportInRHP);
    const isParentReportArchived = useReportIsArchived(report?.parentReportID);
    const {iouReport, chatReport: chatIOUReport, isChatIOUReportArchived} = useGetIOUReportFromReportAction(parentReportAction);

    const isReportSubmitter = isCurrentUserSubmitter(chatIOUReport);
    const isParentChatReportDM = isDM(chatIOUReport);

    // If the parent report is a selfDM, it should always be opened in the Inbox tab
    const shouldOpenParentReportInCurrentTab = !isSelfDM(parentReport);

    const {wideRHPRouteKeys} = useContext(WideRHPContext);

    const markAsCash = useCallback(() => {
        markAsCashAction(transaction?.transactionID, reportID);
    }, [reportID, transaction?.transactionID]);

    const primaryAction = useMemo(() => {
        if (!report || !parentReport || !transaction) {
            return '';
        }
        return getTransactionThreadPrimaryAction(currentUserLogin ?? '', accountID, report, parentReport, transaction, [], policy, isFromReviewDuplicates);
    }, [parentReport, policy, report, transaction, isFromReviewDuplicates, currentUserLogin, accountID]);

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

    const secondaryActionsImplementation: Partial<
        Record<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>, DropdownOption<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>>>
    > = {
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD]: {
            text: translate('iou.hold'),
            icon: Expensicons.Stopwatch,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD,
            onSelected: async () => {
                if (!parentReportAction) {
                    throw new Error('Parent action does not exist');
                }

                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                // Show educational modal if needed (checks NVP internally)
                await showEducationalModalIfNeeded(isReportSubmitter, isParentChatReportDM);

                // Proceed with action
                changeMoneyRequestHoldStatus(parentReportAction);
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
            onSelected: async () => {
                const result = await showConfirmModal({
                    title: translate('iou.deleteExpense', {count: 1}),
                    prompt: translate('iou.deleteConfirmation', {count: 1}),
                    confirmText: translate('common.delete'),
                    cancelText: translate('common.cancel'),
                    danger: true,
                    shouldEnableNewFocusManagement: true,
                });

                if (result.action === ConfirmModalActions.CONFIRM) {
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
                }
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT]: {
            text: translate('common.reject'),
            icon: Expensicons.ThumbsDown,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT,
            onSelected: async () => {
                if (isDelegateAccessRestricted) {
                    showDelegateNoAccessModal();
                    return;
                }

                // Show educational modal if needed
                await showEducationalModalIfNeeded(false, isParentChatReportDM);

                // Proceed with action
                if (parentReportAction) {
                    rejectMoneyRequestReason(parentReportAction);
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
            <View style={[styles.ph5, styles.pb3]}>
                <MoneyRequestHeaderStatusBar
                    transactionID={transaction?.transactionID}
                    reportID={reportID}
                    policyID={policy?.id}
                    parentReport={parentReport}
                    email={email}
                    accountID={accountID}
                />
            </View>
            <LoadingBar shouldShow={shouldShowLoadingBar && shouldUseNarrowLayout} />
        </View>
    );
}

export default MoneyRequestHeader;
