import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';

import {isPersonalCard} from '@libs/CardUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList, RightModalNavigatorParamList} from '@libs/Navigation/types';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {isMarkAsResolvedAction} from '@libs/ReportPrimaryActionUtils';
import {isSelfDM, isSettled as isSettledReportUtils} from '@libs/ReportUtils';
import {
    hasPendingRTERViolation as hasPendingRTERViolationTransactionUtils,
    isDuplicate as isDuplicateTransactionUtils,
    isOnHold as isOnHoldTransactionUtils,
    isPending,
    isScanning,
    shouldShowBrokenConnectionViolation as shouldShowBrokenConnectionViolationTransactionUtils,
} from '@libs/TransactionUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import {personalDetailsLoginSelector} from '@src/selectors/PersonalDetails';
import type IconAsset from '@src/types/utils/IconAsset';

import type {ReactNode} from 'react';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';

import type {MoneyRequestHeaderStatusBarProps} from './MoneyRequestHeaderStatusBar';

import BrokenConnectionDescription from './BrokenConnectionDescription';
import HeaderLoadingBar from './HeaderLoadingBar';
import HeaderWithBackButton from './HeaderWithBackButton';
import Icon from './Icon';
import MoneyRequestHeaderActions from './MoneyRequestHeaderActions';
import MoneyRequestHeaderStatusBar from './MoneyRequestHeaderStatusBar';
import MoneyRequestReportTransactionsNavigation from './MoneyRequestReportView/MoneyRequestReportTransactionsNavigation';
import {useWideRHPState} from './WideRHPContextProvider';

type MoneyRequestHeaderProps = {
    /** The reportID of the report currently being looked at */
    reportID: string | undefined;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: (prioritizeBackTo?: boolean, options?: {afterTransition?: () => void}) => void;
};

function MoneyRequestHeader({reportID: reportIDProp, onBackButtonPress}: MoneyRequestHeaderProps) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportIDProp}`);
    const [ownerLogin] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(report?.ownerAccountID)});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const parentReportAction = useParentReportAction(report);

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to use a correct layout for the hold expense modal https://github.com/Expensify/App/pull/47990#issuecomment-2362382026
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute<
        | PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_REPORT>
        | PlatformStackRouteProp<RightModalNavigatorParamList, typeof SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT>
    >();
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [transaction] = useOnyx(
        `${ONYXKEYS.COLLECTION.TRANSACTION}${
            isMoneyRequestAction(parentReportAction) ? (getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID
        }`,
        {},
    );
    const transactionViolations = useTransactionViolations(transaction?.transactionID);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {email, accountID} = useCurrentUserPersonalDetails();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Flag', 'Hourglass', 'Stopwatch']);
    const icons = useMemoizedLazyExpensifyIcons(['CreditCardHourglass', 'ReceiptScan']);
    const {wideRHPRouteKeys} = useWideRHPState();

    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isParentReportSettled = isSettledReportUtils(parentReport);
    const isDuplicate = !isParentReportSettled && isDuplicateTransactionUtils(transaction, email ?? '', accountID, report, ownerLogin, policy, transactionViolations);
    const hasPendingRTERViolation = hasPendingRTERViolationTransactionUtils(transactionViolations);
    const shouldShowBrokenConnectionViolation = shouldShowBrokenConnectionViolationTransactionUtils(parentReport, policy, transactionViolations);

    const reportID = report?.reportID;
    const isReportInRHP = route.name === SCREENS.RIGHT_MODAL.SEARCH_REPORT;
    const isFromReviewDuplicates = !!route.params.backTo?.replaceAll(/\?.*/g, '').endsWith('/duplicates/review');
    const shouldDisplayTransactionNavigation = !!(reportID && isReportInRHP);
    const shouldOpenParentReportInCurrentTab = !isSelfDM(parentReport);
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine() && (wideRHPRouteKeys.length === 0 || isSmallScreenWidth);
    const shouldDisplayNarrowVersion = shouldDisplayButtonsInSeparateLine;

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
            return {icon: getStatusIcon(expensifyIcons.Stopwatch), description: translate('iou.expenseOnHold')};
        }
        if (isMarkAsResolvedAction(parentReport, transactionViolations, policy)) {
            return {icon: getStatusIcon(expensifyIcons.Hourglass), description: translate('iou.reject.rejectedStatus')};
        }

        if (isDuplicate) {
            return {icon: getStatusIcon(expensifyIcons.Flag), description: translate('iou.expenseDuplicate')};
        }

        if (isPending(transaction) && (parentReport?.transactionCount ?? 0) <= 1) {
            return {icon: getStatusIcon(icons.CreditCardHourglass), description: translate('iou.transactionPendingDescription')};
        }
        if (!!transaction?.transactionID && !!transactionViolations.length && shouldShowBrokenConnectionViolation) {
            const brokenConnectionError = transactionViolations?.find((violation) => violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION);
            const cardID = brokenConnectionError?.data?.cardID;
            const card = cardID ? cardList?.[cardID] : undefined;
            const isBrokenPersonalCard = isPersonalCard(card);

            if (isBrokenPersonalCard && brokenConnectionError) {
                return undefined;
            }
            return {
                icon: getStatusIcon(expensifyIcons.Hourglass),
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
            return {icon: getStatusIcon(expensifyIcons.Hourglass), description: translate('iou.pendingMatchWithCreditCardDescription')};
        }
        if (isScanning(transaction)) {
            return {icon: getStatusIcon(icons.ReceiptScan), description: translate('iou.receiptScanInProgressDescription')};
        }
    };

    const statusBarProps = getStatusBarProps();

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
                {!shouldDisplayButtonsInSeparateLine && !statusBarProps && (
                    <MoneyRequestHeaderActions
                        reportID={reportID}
                        onBackButtonPress={onBackButtonPress}
                    />
                )}
                {shouldDisplayTransactionNavigation && !!transaction && (
                    <MoneyRequestReportTransactionsNavigation
                        currentTransactionID={transaction.transactionID}
                        isFromReviewDuplicates={isFromReviewDuplicates}
                        shouldDisplayNarrowVersion={shouldDisplayNarrowVersion}
                    />
                )}
            </HeaderWithBackButton>
            {shouldDisplayButtonsInSeparateLine && (
                <View style={styles.mtn1}>
                    <MoneyRequestHeaderActions
                        reportID={reportID}
                        onBackButtonPress={onBackButtonPress}
                    />
                </View>
            )}
            {!!statusBarProps && (
                <View style={[styles.flexRow, styles.gap2, styles.justifyContentStart, styles.flexNoWrap, styles.ph5, styles.pb3, styles.mtn1]}>
                    <View style={[styles.flexShrink1, styles.flexGrow1, styles.mnw0, styles.flexWrap, styles.justifyContentCenter]}>
                        <MoneyRequestHeaderStatusBar
                            icon={statusBarProps.icon}
                            description={statusBarProps.description}
                        />
                    </View>
                    {!shouldDisplayButtonsInSeparateLine && (
                        <MoneyRequestHeaderActions
                            reportID={reportID}
                            onBackButtonPress={onBackButtonPress}
                        />
                    )}
                </View>
            )}
            <HeaderLoadingBar />
        </View>
    );
}

export default MoneyRequestHeader;
