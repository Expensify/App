import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDuplicateTransactionsAndViolations from '@hooks/useDuplicateTransactionsAndViolations';
import useLoadingBarVisibility from '@hooks/useLoadingBarVisibility';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import {deleteMoneyRequest, deleteTrackExpense, initSplitExpense, markRejectViolationAsResolved} from '@libs/actions/IOU';
import {setupMergeTransactionData} from '@libs/actions/MergeTransaction';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, SearchReportParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {getTransactionThreadPrimaryAction, isMarkAsResolvedAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryTransactionThreadActions} from '@libs/ReportSecondaryActionUtils';
import {changeMoneyRequestHoldStatus, isSelfDM, navigateToDetailsPage, rejectMoneyRequestReason} from '@libs/ReportUtils';
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
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import BrokenConnectionDescription from './BrokenConnectionDescription';
import Button from './Button';
import ButtonWithDropdownMenu from './ButtonWithDropdownMenu';
import type {DropdownOption} from './ButtonWithDropdownMenu/types';
import ConfirmModal from './ConfirmModal';
import DecisionModal from './DecisionModal';
import {DelegateNoAccessContext} from './DelegateNoAccessModalProvider';
import HeaderWithBackButton from './HeaderWithBackButton';
import HoldOrRejectEducationalModal from './HoldOrRejectEducationalModal';
import Icon from './Icon';
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
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT> | PlatformStackRouteProp<SearchReportParamList, typeof SCREENS.SEARCH.REPORT_RHP>>();
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {
        canBeMissing: false,
    });
    const [transaction] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${
            isMoneyRequestAction(parentReportAction) ? (getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID
        }`,
        {canBeMissing: true},
    );
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transaction?.reportID)}`, {canBeMissing: true});
    const [policyCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${getNonEmptyStringOnyxID(transactionReport?.policyID)}`, {canBeMissing: true});
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const {duplicateTransactions, duplicateTransactionViolations} = useDuplicateTransactionsAndViolations(transaction?.transactionID ? [transaction.transactionID] : []);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [downloadErrorModalVisible, setDownloadErrorModalVisible] = useState(false);
    const [isRejectEducationalModalVisible, setIsRejectEducationalModalVisible] = useState(false);
    const [dismissedRejectUseExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION, {canBeMissing: true});
    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {canBeMissing: true});
    const shouldShowLoadingBar = useLoadingBarVisibility();
    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isDuplicate = isDuplicateTransactionUtils(transaction);
    const reportID = report?.reportID;
    const {removeTransaction} = useSearchContext();
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction);

    const {isDelegateAccessRestricted, showDelegateNoAccessModal} = useContext(DelegateNoAccessContext);
    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const isFromReviewDuplicates = !!route.params.backTo?.replace(/\?.*/g, '').endsWith('/duplicates/review');
    const shouldDisplayTransactionNavigation = !!(reportID && isReportInRHP);
    const isParentReportArchived = useReportIsArchived(report?.parentReportID);

    const {isBetaEnabled} = usePermissions();

    const hasPendingRTERViolation = hasPendingRTERViolationTransactionUtils(transactionViolations);

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationTransactionUtils(parentReport, policy, transactionViolations);

    // If the parent report is a selfDM, it should always be opened in the Inbox tab
    const shouldOpenParentReportInCurrentTab = !isSelfDM(parentReport);

    const {wideRHPRouteKeys} = useContext(WideRHPContext);

    const markAsCash = useCallback(() => {
        markAsCashAction(transaction?.transactionID, reportID);
    }, [reportID, transaction?.transactionID]);

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
            return {icon: getStatusIcon(Expensicons.CreditCardHourglass), description: translate('iou.transactionPendingDescription')};
        }
        if (shouldShowBrokenConnectionViolation) {
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
            return {icon: getStatusIcon(Expensicons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription')};
        }
    };

    const statusBarProps = getStatusBarProps();

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isLoadingHoldUseExplained || dismissedHoldUseExplanation || !isOnHold) {
            return;
        }
        Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD.getRoute(Navigation.getReportRHPActiveRoute()));
    }, [dismissedHoldUseExplanation, isLoadingHoldUseExplained, isOnHold]);

    const primaryAction = useMemo(() => {
        if (!report || !parentReport || !transaction) {
            return '';
        }
        return getTransactionThreadPrimaryAction(currentUserLogin ?? '', report, parentReport, transaction, transactionViolations, policy, isFromReviewDuplicates);
    }, [parentReport, policy, report, transaction, transactionViolations, isFromReviewDuplicates, currentUserLogin]);

    const primaryActionImplementation = {
        [CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD]: (
            <Button
                success
                text={translate('iou.unhold')}
                onPress={() => {
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
        return getSecondaryTransactionThreadActions(currentUserLogin ?? '', parentReport, transaction, parentReportAction, policy, report, isBetaEnabled(CONST.BETAS.NEWDOT_UPDATE_SPLITS));
    }, [parentReport, transaction, parentReportAction, currentUserLogin, policy, report, isBetaEnabled]);

    const dismissModalAndUpdateUseReject = () => {
        setIsRejectEducationalModalVisible(false);
        dismissRejectUseExplanation();
        if (parentReportAction) {
            rejectMoneyRequestReason(parentReportAction);
        }
    };

    const secondaryActionsImplementation: Record<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>, DropdownOption<ValueOf<typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS>>> = {
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

                changeMoneyRequestHoldStatus(parentReportAction);
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT]: {
            text: isExpenseSplit ? translate('iou.editSplits') : translate('iou.split'),
            icon: Expensicons.ArrowSplit,
            value: CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
            onSelected: () => {
                initSplitExpense(transaction);
            },
        },
        [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MERGE]: {
            text: translate('common.merge'),
            icon: Expensicons.ArrowCollapse,
            value: CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MERGE,
            onSelected: () => {
                if (!transaction) {
                    return;
                }

                setupMergeTransactionData(transaction.transactionID, {targetTransactionID: transaction.transactionID});
                Navigation.navigate(ROUTES.MERGE_TRANSACTION_LIST_PAGE.getRoute(transaction.transactionID, Navigation.getActiveRoute()));
            },
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
                if (dismissedRejectUseExplanation) {
                    if (parentReportAction) {
                        rejectMoneyRequestReason(parentReportAction);
                    }
                } else {
                    setIsRejectEducationalModalVisible(true);
                }
            },
        },
    };

    const applicableSecondaryActions = secondaryActions.map((action) => secondaryActionsImplementation[action]);
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
                {shouldDisplayTransactionNavigation && <MoneyRequestReportTransactionsNavigation currentReportID={reportID} />}
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
                isSmallScreenWidth={isSmallScreenWidth}
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
                        deleteTrackExpense(
                            report?.parentReportID,
                            transaction.transactionID,
                            parentReportAction,
                            duplicateTransactions,
                            duplicateTransactionViolations,
                            true,
                            isParentReportArchived,
                        );
                    } else {
                        deleteMoneyRequest(transaction.transactionID, parentReportAction, duplicateTransactions, duplicateTransactionViolations, true);
                        removeTransaction(transaction.transactionID);
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
            {!!isRejectEducationalModalVisible && (
                <HoldOrRejectEducationalModal
                    onClose={dismissModalAndUpdateUseReject}
                    onConfirm={dismissModalAndUpdateUseReject}
                />
            )}
        </View>
    );
}

MoneyRequestHeader.displayName = 'MoneyRequestHeader';

export default MoneyRequestHeader;
