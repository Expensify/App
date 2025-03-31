import {useRoute} from '@react-navigation/native';
import type {ReactNode} from 'react';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    checkIfShouldShowMarkAsCashButton,
    hasPendingRTERViolation as hasPendingRTERViolationTransactionUtils,
    hasReceipt,
    isDuplicate as isDuplicateTransactionUtils,
    isExpensifyCardTransaction,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isReceiptBeingScanned,
    shouldShowBrokenConnectionViolation as shouldShowBrokenConnectionViolationTransactionUtils,
} from '@libs/TransactionUtils';
import variables from '@styles/variables';
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
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import LoadingBar from './LoadingBar';
import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';

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
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID ?? CONST.DEFAULT_NUMBER_ID}`);
    const [transaction] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${
            isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID : CONST.DEFAULT_NUMBER_ID
        }`,
    );
    const transactionViolations = useTransactionViolations(transaction?.transactionID);

    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {initialValue: true});
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA);
    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isDuplicate = isDuplicateTransactionUtils(transaction?.transactionID);
    const reportID = report?.reportID;

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;

    const hasPendingRTERViolation = hasPendingRTERViolationTransactionUtils(transactionViolations);

    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationTransactionUtils(parentReport, policy, transactionViolations);
    const shouldShowMarkAsCashButton = checkIfShouldShowMarkAsCashButton(hasPendingRTERViolation, shouldShowBrokenConnectionViolation, parentReport, policy);

    const markAsCash = useCallback(() => {
        markAsCashAction(transaction?.transactionID, reportID);
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
            return {icon: getStatusIcon(Expensicons.Stopwatch), description: translate('iou.expenseOnHold')};
        }

        if (isDuplicate) {
            return {icon: getStatusIcon(Expensicons.Exclamation), description: translate('iou.expenseDuplicate')};
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
        if (isScanning) {
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

    return (
        <View style={[styles.pl0, styles.borderBottom]}>
            <HeaderWithBackButton
                shouldShowBorderBottom={false}
                shouldShowReportAvatarWithDisplay
                shouldEnableDetailPageNavigation
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
                            if (!reportID) {
                                return;
                            }
                            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(reportID, Navigation.getReportRHPActiveRoute()));
                        }}
                    />
                )}
            </HeaderWithBackButton>
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
                            if (!reportID) {
                                return;
                            }
                            Navigation.navigate(ROUTES.TRANSACTION_DUPLICATE_REVIEW_PAGE.getRoute(reportID, Navigation.getReportRHPActiveRoute()));
                        }}
                    />
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
            <LoadingBar shouldShow={(isLoadingReportData && shouldUseNarrowLayout) ?? false} />
        </View>
    );
}

MoneyRequestHeader.displayName = 'MoneyRequestHeader';

export default MoneyRequestHeader;
