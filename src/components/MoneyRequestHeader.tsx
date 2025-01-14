import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isCurrentUserSubmitter} from '@libs/ReportUtils';
import {
    allHavePendingRTERViolation,
    getTransactionViolations,
    hasPendingRTERViolation,
    hasReceipt,
    isDuplicate as isDuplicateTransactionUtils,
    isExpensifyCardTransaction,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isReceiptBeingScanned,
    shouldShowBrokenConnectionViolation as shouldShowBrokenConnectionViolationTransactionUtils,
} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import {dismissHoldUseExplanation} from '@userActions/IOU';
import {markAsCash as markAsCashTransactionActions} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import BrokenConnectionDescription from './BrokenConnectionDescription';
import Button from './Button';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import ProcessMoneyRequestHoldMenu from './ProcessMoneyRequestHoldMenu';

type MoneyRequestHeaderProps = {
    /** The report currently being looked at */
    report: OnyxEntry<Report>;

    /** The policy which the report is tied to */
    policy: OnyxEntry<Policy>;

    /** The report action the transaction is tied to from the parent report */
    parentReportAction: OnyxEntry<ReportAction>;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;
};

function MoneyRequestHeader({report, parentReportAction, policy, onBackButtonPress}: MoneyRequestHeaderProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute();
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [transaction] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${
            isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID : CONST.DEFAULT_NUMBER_ID
        }`,
    );
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {initialValue: true});
    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [shouldShowHoldMenu, setShouldShowHoldMenu] = useState(false);
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isDuplicate = isDuplicateTransactionUtils(transaction?.transactionID);
    const reportID = report?.reportID;

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;
    const transactionIDList = transaction ? [transaction.transactionID] : [];
    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactionIDList);

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationTransactionUtils(transactionIDList, parentReport, policy);

    const shouldShowMarkAsCashButton = hasAllPendingRTERViolations || (shouldShowBrokenConnectionViolation && (!isPolicyAdmin(policy) || isCurrentUserSubmitter(parentReport?.reportID)));

    const markAsCash = useCallback(() => {
        markAsCashTransactionActions(transaction?.transactionID, reportID);
    }, [reportID, transaction?.transactionID]);

    const isScanning = hasReceipt(transaction) && isReceiptBeingScanned(transaction);

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

        if (isExpensifyCardTransaction(transaction) && isPending(transaction)) {
            return {icon: getStatusIcon(Expensicons.CreditCardHourglass), description: translate('iou.transactionPendingDescription')};
        }
        if (shouldShowBrokenConnectionViolation) {
            return {
                icon: getStatusIcon(Expensicons.Hourglass),
                description: (
                    <BrokenConnectionDescription
                        transactionID={transaction?.transactionID}
                        report={report}
                        policy={policy}
                    />
                ),
            };
        }
        if (hasPendingRTERViolation(getTransactionViolations(transaction?.transactionID, transactionViolations))) {
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

        if (isSmallScreenWidth) {
            if (Navigation.getActiveRoute().slice(1) === ROUTES.PROCESS_MONEY_REQUEST_HOLD.route) {
                Navigation.goBack();
            }
        } else {
            Navigation.navigate(ROUTES.PROCESS_MONEY_REQUEST_HOLD.getRoute(Navigation.getReportRHPActiveRoute()));
        }
    }, [isSmallScreenWidth, shouldShowHoldMenu]);

    const handleHoldRequestClose = () => {
        dismissHoldUseExplanation();
    };

    return (
        <>
            <View style={[styles.pl0]}>
                {!!report && (
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
                        shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                        onBackButtonPress={onBackButtonPress}
                    >
                        {shouldShowMarkAsCashButton && !shouldUseNarrowLayout && (
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
                                    Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(reportID, Navigation.getReportRHPActiveRoute()));
                                }}
                            />
                        )}
                    </HeaderWithBackButton>
                )}
                {shouldShowMarkAsCashButton && shouldUseNarrowLayout && (
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
                                Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(reportID, Navigation.getReportRHPActiveRoute()));
                            }}
                        />
                    </View>
                )}
                {!!statusBarProps && (
                    <View style={[styles.ph5, styles.pb3, styles.borderBottom]}>
                        <MoneyRequestHeaderStatusBar
                            icon={statusBarProps.icon}
                            description={statusBarProps.description}
                        />
                    </View>
                )}
            </View>
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
