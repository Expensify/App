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
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import variables from '@styles/variables';
import * as TransactionActions from '@userActions/Transaction';
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
            ReportActionsUtils.isMoneyRequestAction(parentReportAction)
                ? ReportActionsUtils.getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID
                : CONST.DEFAULT_NUMBER_ID
        }`,
    );
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [dismissedHoldUseExplanation, dismissedHoldUseExplanationResult] = useOnyx(ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION, {initialValue: true});
    const isLoadingHoldUseExplained = isLoadingOnyxValue(dismissedHoldUseExplanationResult);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const isOnHold = TransactionUtils.isOnHold(transaction);
    const isDuplicate = TransactionUtils.isDuplicate(transaction?.transactionID);
    const reportID = report?.reportID;

    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = !isReportInRHP || isSmallScreenWidth;

    const hasAllPendingRTERViolations = TransactionUtils.allHavePendingRTERViolation([transaction?.transactionID]);

    const shouldShowBrokenConnectionViolation = TransactionUtils.shouldShowBrokenConnectionViolation(transaction?.transactionID, parentReport, policy);

    const shouldShowMarkAsCashButton =
        hasAllPendingRTERViolations || (shouldShowBrokenConnectionViolation && (!PolicyUtils.isPolicyAdmin(policy) || ReportUtils.isCurrentUserSubmitter(parentReport?.reportID)));

    const markAsCash = useCallback(() => {
        TransactionActions.markAsCash(transaction?.transactionID, reportID);
    }, [reportID, transaction?.transactionID]);

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
        if (TransactionUtils.hasPendingRTERViolation(TransactionUtils.getTransactionViolations(transaction?.transactionID, transactionViolations))) {
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
        <View style={[styles.pl0]}>
            <HeaderWithBackButton
                shouldShowBorderBottom={!statusBarProps && !isOnHold}
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
                <View style={[styles.ph5, styles.pb3, styles.borderBottom]}>
                    <MoneyRequestHeaderStatusBar
                        icon={statusBarProps.icon}
                        description={statusBarProps.description}
                    />
                </View>
            )}
        </View>
    );
}

MoneyRequestHeader.displayName = 'MoneyRequestHeader';

export default MoneyRequestHeader;
