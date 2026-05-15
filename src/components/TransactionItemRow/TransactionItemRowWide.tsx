import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import RadioButton from '@components/RadioButton';
import DeferredActionCell from '@components/Search/SearchList/ListItem/ActionCell/DeferredActionCell';
import AttendeesCell from '@components/Search/SearchList/ListItem/AttendeesCell';
import DateCell from '@components/Search/SearchList/ListItem/DateCell';
import ExportedIconCell from '@components/Search/SearchList/ListItem/ExportedIconCell';
import StatusCell from '@components/Search/SearchList/ListItem/StatusCell';
import TextCell from '@components/Search/SearchList/ListItem/TextCell';
import AmountCell from '@components/Search/SearchList/ListItem/TotalCell';
import UserInfoCell from '@components/Search/SearchList/ListItem/UserInfoCell';
import WorkspaceCell from '@components/Search/SearchList/ListItem/WorkspaceCell';
import type {SearchColumnType} from '@components/Search/types';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getBase62ReportID from '@libs/getBase62ReportID';
import {getReportName} from '@libs/ReportNameUtils';
import {isExpenseReport} from '@libs/ReportUtils';
import {
    getAmount,
    getConvertedAmount,
    getCurrency,
    getOriginalAmountForDisplay,
    getOriginalCurrencyForDisplay,
    getReimbursable,
    getTaxName,
    isDeletedTransaction as isDeletedTransactionUtil,
    isScanning,
    isTimeRequest,
} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import CategoryCell from './DataCells/CategoryCell';
import DeferredChatBubbleCell from './DataCells/DeferredChatBubbleCell';
import MerchantOrDescriptionCell from './DataCells/MerchantCell';
import ReceiptCell from './DataCells/ReceiptCell';
import TagCell from './DataCells/TagCell';
import TaxCell from './DataCells/TaxCell';
import TotalCell from './DataCells/TotalCell';
import TypeCell from './DataCells/TypeCell';
import DeferredTransactionItemRowRBR from './DeferredTransactionItemRowRBR';
import type {TransactionItemRowProps, TransactionItemRowWideComputedData} from './types';

type TransactionItemRowWideProps = Omit<TransactionItemRowProps, 'shouldUseNarrowLayout' | 'isAttendeesEnabledForMovingPolicy' | 'isLargeScreenWidth' | 'shouldShowCheckbox'> &
    TransactionItemRowWideComputedData;

function TransactionItemRowWide({
    transactionItem,
    report,
    policy,
    isSelected,
    shouldShowTooltip,
    dateColumnSize,
    submittedColumnSize,
    approvedColumnSize,
    postedColumnSize,
    exportedColumnSize,
    amountColumnSize,
    taxAmountColumnSize,
    onCheckboxPress = () => {},
    columns,
    onButtonPress = () => {},
    style,
    isReportItemChild = false,
    isActionLoading,
    isInSingleTransactionReport = false,
    shouldShowRadioButton = false,
    onRadioButtonPress = () => {},
    shouldShowErrors = true,
    isDisabled = false,
    violations,
    shouldShowBottomBorder,
    onArrowRightPress,
    isHover = false,
    reportActions,
    checkboxSentryLabel,
    isActionColumnWide: isActionColumnWideProp,
    shouldRemoveTotalColumnFlex,
    bgActiveStyles,
    merchant,
    description,
    missingFieldError,
    exchangeRateMessage,
    cardName,
    transactionAttendees,
    shouldShowAttendees,
    totalPerAttendee,
    transactionThreadReportID,
    createdAt,
}: TransactionItemRowWideProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const expensicons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const isDeletedTransaction = isDeletedTransactionUtil(transactionItem);

    const isDateColumnWide = dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isSubmittedColumnWide = submittedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isApprovedColumnWide = approvedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isPostedColumnWide = postedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isExportedColumnWide = exportedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isAmountColumnWide = amountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;
    const isTaxAmountColumnWide = taxAmountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;

    const renderColumn = (column: SearchColumnType): React.ReactNode => {
        switch (column) {
            case CONST.SEARCH.TABLE_COLUMNS.TYPE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)]}
                    >
                        <TypeCell
                            transactionItem={transactionItem}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={false}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.RECEIPT:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.RECEIPT)]}
                    >
                        <ReceiptCell
                            transactionItem={transactionItem}
                            isSelected={isSelected}
                            shouldUseNarrowLayout={false}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TAG:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAG)]}
                    >
                        <TagCell
                            transactionItem={transactionItem}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={false}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.DATE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, {isDateColumnWide})]}
                    >
                        <DateCell
                            date={createdAt}
                            showTooltip={shouldShowTooltip}
                            isLargeScreenWidth
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.SUBMITTED:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.SUBMITTED, {isDateColumnWide, isSubmittedColumnWide})]}
                    >
                        <DateCell
                            date={report?.submitted ?? ''}
                            showTooltip={shouldShowTooltip}
                            isLargeScreenWidth
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.APPROVED:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.APPROVED, {isApprovedColumnWide})]}
                    >
                        <DateCell
                            date={report?.approved ?? ''}
                            showTooltip={shouldShowTooltip}
                            isLargeScreenWidth
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.POSTED:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.POSTED, {isPostedColumnWide})]}
                    >
                        <DateCell
                            date={transactionItem.posted ?? ''}
                            showTooltip={shouldShowTooltip}
                            isLargeScreenWidth
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.EXPORTED:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPORTED, {isExportedColumnWide})]}
                    >
                        <DateCell
                            date={transactionItem.exported ?? ''}
                            showTooltip={shouldShowTooltip}
                            isLargeScreenWidth
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.CATEGORY:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CATEGORY)]}
                    >
                        <CategoryCell
                            transactionItem={transactionItem}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={false}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE)]}
                    >
                        <Text>{getReimbursable(transactionItem) ? translate('common.yes') : translate('common.no')}</Text>
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.BILLABLE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.BILLABLE)]}
                    >
                        <Text>{transactionItem.billable ? translate('common.yes') : translate('common.no')}</Text>
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.ACTION:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION, {isActionColumnWide: isActionColumnWideProp ?? isDeletedTransaction})]}
                    >
                        {!!transactionItem.action && (
                            <DeferredActionCell
                                action={transactionItem.action}
                                isSelected={isSelected}
                                isChildListItem={isReportItemChild}
                                onButtonPress={onButtonPress}
                                isLoading={isActionLoading}
                                reportID={transactionItem.reportID}
                                policyID={report?.policyID}
                                hash={transactionItem?.hash}
                                amount={report?.total}
                                shouldDisablePointerEvents={isDisabled}
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.MERCHANT:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)]}
                    >
                        {!!merchant && (
                            <MerchantOrDescriptionCell
                                merchantOrDescription={merchant}
                                shouldShowTooltip={shouldShowTooltip}
                                shouldUseNarrowLayout={false}
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION)]}
                    >
                        {!!description && (
                            <MerchantOrDescriptionCell
                                merchantOrDescription={description}
                                shouldShowTooltip={shouldShowTooltip}
                                shouldUseNarrowLayout={false}
                                isDescription
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TO:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TO)]}
                    >
                        {!!transactionItem.to && (
                            <UserInfoCell
                                accountID={transactionItem.to.accountID}
                                avatar={transactionItem.to.avatar}
                                displayName={transactionItem.formattedTo ?? transactionItem.to.displayName ?? ''}
                                isLargeScreenWidth
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.FROM:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}
                    >
                        {!!transactionItem.from && (
                            <UserInfoCell
                                accountID={transactionItem.from.accountID}
                                avatar={transactionItem.from.avatar}
                                displayName={transactionItem.formattedFrom ?? transactionItem.from.displayName ?? ''}
                                isLargeScreenWidth
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.CARD:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CARD)]}
                    >
                        <TextCell text={cardName} />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.ATTENDEES:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ATTENDEES)]}
                    >
                        {shouldShowAttendees && (
                            <AttendeesCell
                                attendees={transactionAttendees}
                                isHovered={isHover}
                                isPressed={isSelected}
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.COMMENTS:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.COMMENTS)]}
                    >
                        <DeferredChatBubbleCell
                            transaction={transactionItem}
                            isInSingleTransactionReport={isInSingleTransactionReport}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXCHANGE_RATE)]}
                    >
                        <TextCell text={exchangeRateMessage} />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, {isAmountColumnWide, shouldRemoveTotalColumnFlex})]}
                    >
                        <TotalCell
                            transactionItem={transactionItem}
                            shouldShowTooltip={shouldShowTooltip}
                            shouldUseNarrowLayout={false}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_PER_ATTENDEE, {isAmountColumnWide, shouldRemoveTotalColumnFlex})]}
                    >
                        {shouldShowAttendees && (
                            <AmountCell
                                total={totalPerAttendee ?? 0}
                                currency={getCurrency(transactionItem)}
                                isScanning={isScanning(transactionItem)}
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ORIGINAL_AMOUNT, {isAmountColumnWide, shouldRemoveTotalColumnFlex})]}
                    >
                        <AmountCell
                            total={getOriginalAmountForDisplay(transactionItem, isExpenseReport(transactionItem.report))}
                            currency={getOriginalCurrencyForDisplay(transactionItem)}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.REPORT_ID:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.REPORT_ID)]}
                    >
                        <TextCell text={transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? '' : transactionItem.reportID} />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID)]}
                    >
                        <TextCell text={transactionItem.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? '' : getBase62ReportID(Number(transactionItem.reportID))} />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TAX_RATE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAX_RATE)]}
                    >
                        <TextCell text={isTimeRequest(transactionItem) ? '' : (getTaxName(policy, transactionItem) ?? transactionItem.taxValue ?? '')} />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAX_AMOUNT, {isTaxAmountColumnWide})]}
                    >
                        {isTimeRequest(transactionItem) ? null : (
                            <TaxCell
                                transactionItem={transactionItem}
                                shouldShowTooltip={shouldShowTooltip}
                            />
                        )}
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME)]}
                    >
                        <WorkspaceCell
                            policyID={transactionItem.report?.policyID}
                            report={transactionItem.report}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TITLE:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TITLE)]}
                    >
                        <TextCell
                            text={getReportName(transactionItem.report) || (transactionItem.report?.reportName ?? '')}
                            isLargeScreenWidth
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.STATUS:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.STATUS)]}
                    >
                        <StatusCell
                            stateNum={transactionItem.report?.stateNum}
                            statusNum={transactionItem.report?.statusNum}
                            isDeleted={isDeletedTransaction}
                            isSelected={isSelected}
                        />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO)]}
                    >
                        <ExportedIconCell reportActions={reportActions} />
                    </View>
                );
            case CONST.SEARCH.TABLE_COLUMNS.TOTAL: {
                const isFromExpenseReport = isExpenseReport(transactionItem.report ?? report);
                const hasConvertedAmount = transactionItem.convertedAmount != null;
                // Offline expenses don't have a BE-computed convertedAmount yet — fall back to the unconverted
                // amount in the transaction's own currency so users don't see a misleading $0.00 placeholder.
                // Pass isFromExpenseReport so IOU reports stay positive while expense reports get NewDot's signed display.
                const totalAmount = hasConvertedAmount ? getConvertedAmount(transactionItem, isFromExpenseReport) : getAmount(transactionItem, isFromExpenseReport);
                // When converted, display in the report's output currency; otherwise use the transaction's own currency.
                const totalCurrency = hasConvertedAmount ? (report?.currency ?? policy?.outputCurrency ?? getCurrency(transactionItem)) : getCurrency(transactionItem);
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT, {isAmountColumnWide, shouldRemoveTotalColumnFlex})]}
                    >
                        <AmountCell
                            total={totalAmount}
                            currency={totalCurrency}
                        />
                    </View>
                );
            }
            case CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID:
                return (
                    <View
                        key={column}
                        style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.WITHDRAWAL_ID)]}
                    >
                        <TextCell text={transactionItem.withdrawalID} />
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <View
                style={[styles.expenseWidgetRadius, styles.flex1, styles.gap2, bgActiveStyles, styles.mw100, style]}
                testID="transaction-item-row"
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                    {!shouldShowRadioButton && (
                        <Checkbox
                            disabled={isDisabled}
                            onPress={() => {
                                onCheckboxPress(transactionItem.transactionID);
                            }}
                            accessibilityLabel={CONST.ROLE.CHECKBOX}
                            isChecked={isSelected}
                            containerStyle={styles.m0}
                            wrapperStyle={styles.justifyContentCenter}
                            sentryLabel={checkboxSentryLabel}
                        />
                    )}
                    {columns?.map(renderColumn)}
                    {shouldShowRadioButton && (
                        <View style={[styles.ml1, styles.justifyContentCenter]}>
                            <RadioButton
                                isChecked={isSelected}
                                disabled={isDisabled}
                                onPress={() => onRadioButtonPress?.(transactionItem.transactionID)}
                                accessibilityLabel={CONST.ROLE.RADIO}
                            />
                        </View>
                    )}
                    {onArrowRightPress ? (
                        <PressableWithFeedback
                            disabled={!!isDisabled}
                            onPress={() => onArrowRightPress?.()}
                            style={[styles.pv2, styles.justifyContentCenter, styles.alignItemsEnd]}
                            accessibilityRole={CONST.ROLE.BUTTON}
                            accessibilityLabel={CONST.ROLE.BUTTON}
                            sentryLabel={CONST.SENTRY_LABEL.TRANSACTION_ITEM_ROW.ARROW_RIGHT}
                        >
                            <Icon
                                src={expensicons.ArrowRight}
                                fill={theme.icon}
                                additionalStyles={!isHover && styles.opacitySemiTransparent}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                        </PressableWithFeedback>
                    ) : (
                        <View style={[styles.p3Half, styles.pl0half, styles.pr0half, {width: variables.iconSizeNormal}]} />
                    )}
                </View>
                {shouldShowErrors && (
                    <DeferredTransactionItemRowRBR
                        transaction={transactionItem}
                        violations={violations}
                        report={report}
                        missingFieldError={missingFieldError}
                        transactionThreadReportID={transactionThreadReportID}
                    />
                )}
            </View>
            {!!shouldShowBottomBorder && (
                <View style={bgActiveStyles}>
                    <View style={styles.ph3}>
                        <View style={[StyleUtils.getSelectedBorderBottomStyle(isSelected)]} />
                    </View>
                </View>
            )}
        </>
    );
}

export default TransactionItemRowWide;
