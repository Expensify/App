import type {ReactNode} from 'react';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import variables from '@styles/variables';
import * as IOU from '@userActions/IOU';
import * as TransactionActions from '@userActions/Transaction';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import Button from './Button';
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
    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {initialValue: true});
    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [shouldShowHoldMenu, setShouldShowHoldMenu] = useState(false);
    const isOnHold = TransactionUtils.isOnHold(transaction);
    const isDuplicate = TransactionUtils.isDuplicate(transaction?.transactionID ?? '');

    const hasAllPendingRTERViolations = TransactionUtils.allHavePendingRTERViolation([transaction?.transactionID ?? '-1']);

    const markAsCash = useCallback(() => {
        TransactionActions.markAsCash(transaction?.transactionID ?? '-1', report.reportID);
    }, [report.reportID, transaction?.transactionID]);

    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);

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
            return {icon: getStatusIcon(Expensicons.Stopwatch), description: isDuplicate ? translate('iou.expenseDuplicate') : translate('iou.expenseOnHold')};
        }

        if (TransactionUtils.isExpensifyCardTransaction(transaction) && TransactionUtils.isPending(transaction)) {
            return {icon: getStatusIcon(Expensicons.CreditCardHourglass), description: translate('iou.transactionPendingDescription')};
        }
        if (TransactionUtils.hasPendingRTERViolation(TransactionUtils.getTransactionViolations(transaction?.transactionID ?? '-1', transactionViolations))) {
            return {icon: getStatusIcon(Expensicons.Hourglass), description: translate('iou.pendingMatchWithCreditCardDescription')};
        }
        if (isScanning) {
            return {icon: getStatusIcon(Expensicons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription')};
        }
    };

    const statusBarProps = getStatusBarProps();

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

        if (shouldUseNarrowLayout) {
            if (Navigation.getActiveRoute().slice(1) === ROUTES.PROCESS_MONEY_REQUEST_HOLD) {
                Navigation.goBack();
            }
        } else {
            Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD);
        }
    }, [shouldUseNarrowLayout, shouldShowHoldMenu]);

    const handleHoldRequestClose = () => {
        IOU.dismissHoldUseExplanation();
    };

    return (
        <>
            <View style={[styles.pl0]}>
                <HeaderWithBackButton
                    shouldShowBorderBottom={!statusBarProps && !isOnHold}
                    shouldShowReportAvatarWithDisplay
                    shouldEnableDetailPageNavigation
                    shouldShowPinButton={false}
                    report={{
                        ...report,
                        ownerAccountID: parentReport?.ownerAccountID,
                    }}
                    policy={policy}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    onBackButtonPress={onBackButtonPress}
                    shouldDisplaySearchRouter
                >
                    {hasAllPendingRTERViolations && !shouldUseNarrowLayout && (
                        <Button
                            success
                            text={translate('iou.markAsCash')}
                            style={[styles.p0]}
                            onPress={markAsCash}
                        />
                    )}
                    {isDuplicate && !shouldUseNarrowLayout && (
                        <Button
                            success
                            text={translate('iou.reviewDuplicates')}
                            style={[styles.p0, styles.ml2]}
                            onPress={() => {
                                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(report.reportID));
                            }}
                        />
                    )}
                </HeaderWithBackButton>
                {hasAllPendingRTERViolations && shouldUseNarrowLayout && (
                    <View style={[styles.ph5, styles.pb3]}>
                        <Button
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
                            text={translate('iou.reviewDuplicates')}
                            style={[styles.w100, styles.pr0]}
                            onPress={() => {
                                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(report.reportID));
                            }}
                        />
                    </View>
                )}
                {statusBarProps && (
                    <View style={[styles.ph5, styles.pb3, styles.borderBottom]}>
                        <MoneyRequestHeaderStatusBar
                            icon={statusBarProps.icon}
                            description={statusBarProps.description}
                        />
                    </View>
                )}
            </View>
            {shouldUseNarrowLayout && shouldShowHoldMenu && (
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
