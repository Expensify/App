import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import BrokenConnectionDescription from '@components/BrokenConnectionDescription';
import Checkbox from '@components/Checkbox';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import type {PaymentMethod} from '@components/KYCWall/types';
import type {MoneyRequestHeaderStatusBarProps} from '@components/MoneyRequestHeaderStatusBar';
import type {ReportListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useDelegateUserDetails from '@hooks/useDelegateUserDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePaymentAnimations from '@hooks/usePaymentAnimations';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {buildOptimisticNextStepForPreventSelfApprovalsEnabled} from '@libs/NextStepUtils';
import {getConnectedIntegration} from '@libs/PolicyUtils';
import {getOriginalMessage, isDeletedAction, isMoneyRequestAction, isTrackExpenseAction} from '@libs/ReportActionsUtils';
import {
    canBeExported,
    canDeleteTransaction,
    getArchiveReason,
    getBankAccountRoute,
    getMoneyRequestSpendBreakdown,
    getNonHeldAndFullAmount,
    getTransactionsWithReceipts,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils,
    hasUpdatedTotal,
    isAllowedToApproveExpenseReport,
    isAllowedToSubmitDraftExpenseReport,
    isArchivedReportWithID,
    isInvoiceReport,
    isReportApproved,
    isReportOwner,
    isWaitingForSubmissionFromCurrentUser as isWaitingForSubmissionFromCurrentUserReportUtils,
    navigateBackOnDeleteTransaction,
    reportTransactionsSelector,
} from '@libs/ReportUtils';
import {
    allHavePendingRTERViolation,
    checkIfShouldShowMarkAsCashButton,
    hasDuplicateTransactions,
    isDuplicate as isDuplicateTransactionUtils,
    isExpensifyCardTransaction,
    isOnHold as isOnHoldTransactionUtils,
    isPayAtEndExpense as isPayAtEndExpenseTransactionUtils,
    isPending,
    isReceiptBeingScanned,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
    shouldShowRTERViolationMessage,
} from '@libs/TransactionUtils';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import {
    approveMoneyRequest,
    canApproveIOU,
    canIOUBePaid as canIOUBePaidAction,
    canSubmitReport,
    deleteMoneyRequest,
    deleteTrackExpense,
    getNextApproverAccountID,
    payInvoice,
    payMoneyRequest,
    submitReport,
} from '@userActions/IOU';
import {handleActionButtonPress} from '@userActions/Search';
import {markAsCash as markAsCashAction} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type IconAsset from '@src/types/utils/IconAsset';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import ActionCell from './ActionCell';

type MoneyReportHeaderProps = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The policy tied to the expense report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Array of report actions for the report */
    reportActions: OnyxTypes.ReportAction[];

    /** The reportID of the transaction thread report associated with this current report, if any */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionThreadReportID: string | undefined;

    /** Whether back button should be displayed in header */
    shouldDisplayBackButton?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;

    shouldDisplaySearchIcon?: boolean;

    rightComponent?: React.ReactNode;

    item: any;

    currentSearchHash: any;

    onSelectRow: any;
};

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
    isLargeScreenWidth: boolean;
};

type ReportCellProps = {
    reportItem: ReportListItemType;
} & CellProps;

function TotalCell({showTooltip, isLargeScreenWidth, reportItem}: ReportCellProps) {
    const styles = useThemeStyles();

    let total = reportItem?.total ?? 0;

    // Only invert non-zero values otherwise we'll end up with -0.00
    if (total) {
        total *= reportItem?.type === CONST.REPORT.TYPE.EXPENSE || reportItem?.type === CONST.REPORT.TYPE.INVOICE ? -1 : 1;
    }

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={convertToDisplayString(total, reportItem?.currency)}
            style={[styles.optionDisplayName, styles.textNormal, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : styles.textAlignRight]}
        />
    );
}

function ReportHeader({
    policy,
    report: moneyRequestReport,
    transactionThreadReportID,
    reportActions,
    shouldDisplayBackButton = false,
    onBackButtonPress,
    shouldDisplaySearchIcon = true,
    rightComponent,
    item,
    currentSearchHash,
    onSelectRow,
}: MoneyReportHeaderProps) {
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const route = useRoute();

    const styles = useThemeStyles();
    const isReportInRHP = route.name === SCREENS.SEARCH.REPORT_RHP;
    const shouldDisplaySearchRouter = (!isReportInRHP || isSmallScreenWidth) && shouldDisplaySearchIcon;
    const shouldShowBackButton = shouldDisplayBackButton || shouldUseNarrowLayout;
    const StyleUtils = useStyleUtils();
    const reportItem = item as unknown as ReportListItemType;

    const handleOnButtonPress = () => {
        handleActionButtonPress(currentSearchHash, reportItem, () => onSelectRow(item));
    };

    return (
        // powinien byc pading 16 zgodnie z figmą ale daje 12 żeby było zgodnie z apką
        <View style={[styles.pt0, styles.borderBottom, {flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingRight: 12, paddingLeft: 12, gap: 12}]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mnh40, styles.flex5]}>
                <Checkbox
                    onPress={() => {}}
                    isChecked={false}
                    containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}
                    disabled={false}
                    shouldStopMouseDownPropagation
                    style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled]}
                />
                <HeaderWithBackButton
                    shouldShowReportAvatarWithDisplay
                    shouldEnableDetailPageNavigation
                    shouldShowPinButton={false}
                    report={moneyRequestReport}
                    policy={policy}
                    shouldShowBackButton={shouldShowBackButton}
                    shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                    onBackButtonPress={onBackButtonPress}
                    shouldShowBorderBottom={false}
                    style={[{maxWidth: 250}]}
                />
                <View style={[styles.flexRow, styles.flex1, styles.justifyContentEnd]}>
                    <TotalCell
                        showTooltip
                        isLargeScreenWidth
                        reportItem={reportItem}
                    />
                </View>
            </View>
            <View style={StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)}>
                <ActionCell
                    action={reportItem.action}
                    goToItem={handleOnButtonPress}
                    isSelected={item.isSelected}
                    isLoading={reportItem.isActionLoading}
                />
            </View>
        </View>
    );
}

export default ReportHeader;
