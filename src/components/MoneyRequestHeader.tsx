import type {ReactNode} from 'react';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as HeaderUtils from '@libs/HeaderUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import * as TransactionActions from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import ProcessMoneyRequestHoldMenu from './ProcessMoneyRequestHoldMenu';

type MoneyRequestHeaderProps = {
    /** The report currently being looked at */
    report: Report;

    /** The policy which the report is tied to */
    policy: OnyxEntry<Policy>;

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: OnyxEntry<ReportAction>;

    /** Whether we should display the header as in narrow layout */
    shouldUseNarrowLayout?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyRequestHeader({report, parentReportAction, policy, shouldUseNarrowLayout = false, onBackButtonPress}: MoneyRequestHeaderProps) {
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`);
    const [transaction] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${
            ReportActionsUtils.isMoneyRequestAction(parentReportAction) ? ReportActionsUtils.getOriginalMessage(parentReportAction)?.IOUTransactionID ?? -1 : -1
        }`,
    );
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {initialValue: true});
    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [shouldShowHoldMenu, setShouldShowHoldMenu] = useState(false);
    const moneyRequestReport = parentReport;
    const isSettled = ReportUtils.isSettled(moneyRequestReport?.reportID);
    const isApproved = ReportUtils.isReportApproved(moneyRequestReport);
    const isDraft = ReportUtils.isOpenExpenseReport(moneyRequestReport);
    const isOnHold = TransactionUtils.isOnHold(transaction);
    const isDuplicate = TransactionUtils.isDuplicate(transaction?.transactionID ?? '');
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();

    const navigateBackToAfterDelete = useRef<Route>();

    // Only the requestor can take delete the request, admins can only edit it.
    const isActionOwner = typeof parentReportAction?.actorAccountID === 'number' && typeof session?.accountID === 'number' && parentReportAction.actorAccountID === session?.accountID;
    const isPolicyAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isApprover = ReportUtils.isMoneyRequestReport(moneyRequestReport) && moneyRequestReport?.managerID !== null && session?.accountID === moneyRequestReport?.managerID;
    const hasAllPendingRTERViolations = TransactionUtils.allHavePendingRTERViolation([transaction?.transactionID ?? '-1']);
    const shouldShowMarkAsCashButton = isDraft && hasAllPendingRTERViolations;
    const deleteTransaction = useCallback(() => {
        if (parentReportAction) {
            const iouTransactionID = ReportActionsUtils.isMoneyRequestAction(parentReportAction) ? ReportActionsUtils.getOriginalMessage(parentReportAction)?.IOUTransactionID ?? '-1' : '-1';
            if (ReportActionsUtils.isTrackExpenseAction(parentReportAction)) {
                navigateBackToAfterDelete.current = IOU.deleteTrackExpense(parentReport?.reportID ?? '-1', iouTransactionID, parentReportAction, true);
            } else {
                navigateBackToAfterDelete.current = IOU.deleteMoneyRequest(iouTransactionID, parentReportAction, true);
            }
        }

        setIsDeleteModalVisible(false);
    }, [parentReport?.reportID, parentReportAction, setIsDeleteModalVisible]);

    const markAsCash = useCallback(() => {
        TransactionActions.markAsCash(transaction?.transactionID ?? '-1', report.reportID);
    }, [report.reportID, transaction?.transactionID]);

    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);

    const isDeletedParentAction = ReportActionsUtils.isDeletedAction(parentReportAction);
    const canHoldOrUnholdRequest = !isSettled && !isApproved && !isDeletedParentAction && !ReportUtils.isArchivedRoom(parentReport);

    // If the report supports adding transactions to it, then it also supports deleting transactions from it.
    const canDeleteRequest = isActionOwner && (ReportUtils.canAddOrDeleteTransactions(moneyRequestReport) || ReportUtils.isTrackExpenseReport(report)) && !isDeletedParentAction;

    const changeMoneyRequestStatus = () => {
        const iouTransactionID = ReportActionsUtils.isMoneyRequestAction(parentReportAction) ? ReportActionsUtils.getOriginalMessage(parentReportAction)?.IOUTransactionID ?? '-1' : '-1';

        if (isOnHold) {
            IOU.unholdRequest(iouTransactionID, report?.reportID);
        } else {
            const activeRoute = encodeURIComponent(Navigation.getActiveRouteWithoutParams());
            Navigation.navigate(ROUTES.MONEY_REQUEST_HOLD_REASON.getRoute(policy?.type ?? CONST.POLICY.TYPE.PERSONAL, iouTransactionID, report?.reportID, activeRoute));
        }
    };

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
            return {
                title: translate('violations.hold'),
                description: isDuplicate ? translate('iou.expenseDuplicate') : translate('iou.expenseOnHold'),
                danger: true,
                shouldShowBorderBottom: true,
            };
        }

        if (TransactionUtils.isExpensifyCardTransaction(transaction) && TransactionUtils.isPending(transaction)) {
            return {title: getStatusIcon(Expensicons.CreditCardHourglass), description: translate('iou.transactionPendingDescription'), shouldShowBorderBottom: true};
        }
        if (TransactionUtils.hasPendingRTERViolation(TransactionUtils.getTransactionViolations(transaction?.transactionID ?? '-1', transactionViolations))) {
            return {
                title: getStatusIcon(Expensicons.Hourglass),
                description: translate('iou.pendingMatchWithCreditCardDescription'),
                shouldShowBorderBottom: true,
            };
        }
        if (isScanning) {
            return {title: getStatusIcon(Expensicons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription'), shouldShowBorderBottom: true};
        }
    };

    const statusBarProps = getStatusBarProps();

    useEffect(() => {
        if (canDeleteRequest) {
            return;
        }

        setIsDeleteModalVisible(false);
    }, [canDeleteRequest]);

    const threeDotsMenuItems = [HeaderUtils.getPinMenuItem(report)];
    if (canHoldOrUnholdRequest) {
        const isRequestIOU = parentReport?.type === 'iou';
        const isHoldCreator = ReportUtils.isHoldCreator(transaction, report?.reportID) && isRequestIOU;
        const isTrackExpenseReport = ReportUtils.isTrackExpenseReport(report);
        const canModifyStatus = !isTrackExpenseReport && (isPolicyAdmin || isActionOwner || isApprover);
        if (isOnHold && !isDuplicate && (isHoldCreator || (!isRequestIOU && canModifyStatus))) {
            threeDotsMenuItems.push({
                icon: Expensicons.Stopwatch,
                text: translate('iou.unholdExpense'),
                onSelected: () => changeMoneyRequestStatus(),
            });
        }
        if (!isOnHold && (isRequestIOU || canModifyStatus) && !isScanning) {
            threeDotsMenuItems.push({
                icon: Expensicons.Stopwatch,
                text: translate('iou.hold'),
                onSelected: () => changeMoneyRequestStatus(),
            });
        }
    }

    useEffect(() => {
        if (isLoadingHoldUseExplained) {
            return;
        }
        setShouldShowHoldMenu(isOnHold && !dismissedHoldUseExplanation);
    }, [dismissedHoldUseExplanation, isLoadingHoldUseExplained, isOnHold]);

    useEffect(() => {
        if (!shouldShowHoldMenu) {
            return;
        }

        if (isSmallScreenWidth) {
            if (Navigation.getActiveRoute().slice(1) === ROUTES.PROCESS_MONEY_REQUEST_HOLD) {
                Navigation.goBack();
            }
        } else {
            Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD);
        }
    }, [isSmallScreenWidth, shouldShowHoldMenu]);

    const handleHoldRequestClose = () => {
        IOU.dismissHoldUseExplanation();
    };

    if (canDeleteRequest) {
        threeDotsMenuItems.push({
            icon: Expensicons.Trashcan,
            text: translate('reportActionContextMenu.deleteAction', {action: parentReportAction}),
            onSelected: () => setIsDeleteModalVisible(true),
        });
    }

    return (
        <>
            <View style={[styles.pl0]}>
                <HeaderWithBackButton
                    shouldShowBorderBottom={!statusBarProps && !isOnHold}
                    shouldShowReportAvatarWithDisplay
                    shouldEnableDetailPageNavigation
                    shouldShowPinButton={false}
                    shouldShowThreeDotsButton
                    threeDotsMenuItems={threeDotsMenuItems}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                    report={{
                        ...report,
                        ownerAccountID: parentReport?.ownerAccountID,
                    }}
                    policy={policy}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={onBackButtonPress}
                >
                    {shouldShowMarkAsCashButton && !shouldUseNarrowLayout && (
                        <Button
                            success
                            medium
                            text={translate('iou.markAsCash')}
                            style={[styles.p0]}
                            onPress={markAsCash}
                        />
                    )}
                    {isDuplicate && !shouldUseNarrowLayout && (
                        <Button
                            success
                            medium
                            text={translate('iou.reviewDuplicates')}
                            style={[styles.p0]}
                            onPress={() => {
                                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(report.reportID));
                            }}
                        />
                    )}
                </HeaderWithBackButton>
                {shouldShowMarkAsCashButton && shouldUseNarrowLayout && (
                    <View style={[styles.ph5, styles.pb3]}>
                        <Button
                            medium
                            success
                            text={translate('iou.markAsCash')}
                            style={[styles.w100, styles.pr0]}
                            onPress={markAsCash}
                        />
                    </View>
                )}
                {isDuplicate && shouldUseNarrowLayout && (
                    <View style={[styles.ph5, styles.pb3]}>
                        <Button
                            success
                            medium
                            text={translate('iou.reviewDuplicates')}
                            style={[styles.w100, styles.pr0]}
                            onPress={() => {
                                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(report.reportID));
                            }}
                        />
                    </View>
                )}
                {statusBarProps && (
                    <MoneyRequestHeaderStatusBar
                        title={statusBarProps.title}
                        description={statusBarProps.description}
                        danger={statusBarProps.danger}
                        shouldShowBorderBottom={statusBarProps.shouldShowBorderBottom}
                    />
                )}
            </View>
            <ConfirmModal
                title={translate('iou.deleteExpense')}
                isVisible={isDeleteModalVisible}
                onConfirm={deleteTransaction}
                onCancel={() => setIsDeleteModalVisible(false)}
                onModalHide={() => {
                    if (!navigateBackToAfterDelete.current) {
                        return;
                    }
                    Navigation.goBack(navigateBackToAfterDelete.current);
                }}
                prompt={translate('iou.deleteConfirmation')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
                shouldEnableNewFocusManagement
            />
            {isSmallScreenWidth && shouldShowHoldMenu && (
                <ProcessMoneyRequestHoldMenu
                    onClose={handleHoldRequestClose}
                    onConfirm={handleHoldRequestClose}
                    isVisible={shouldShowHoldMenu}
                />
            )}
        </>
    );
}

MoneyRequestHeader.displayName = 'MoneyRequestHeader';

export default MoneyRequestHeader;
