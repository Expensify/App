import React, {Fragment} from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import DeferredActionCell from '@components/Search/SearchList/ListItem/ActionCell/DeferredActionCell';
import DateCell from '@components/Search/SearchList/ListItem/DateCell';
import ExportedIconCell from '@components/Search/SearchList/ListItem/ExportedIconCell';
import StatusCell from '@components/Search/SearchList/ListItem/StatusCell';
import TextCell from '@components/Search/SearchList/ListItem/TextCell';
import TotalCell from '@components/Search/SearchList/ListItem/TotalCell';
import UserInfoCell from '@components/Search/SearchList/ListItem/UserInfoCell';
import WorkspaceCell from '@components/Search/SearchList/ListItem/WorkspaceCell';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getBase62ReportID from '@libs/getBase62ReportID';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ExpenseReportListItemAvatar from './ExpenseReportListItemAvatar';
import type {ExpenseReportListItemRowWideProps} from './types';

function ExpenseReportListItemRowWide({
    item,
    reportActions,
    onCheckboxPress = () => {},
    onButtonPress = () => {},
    isActionLoading,
    containerStyle,
    showTooltip,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isDisabledCheckbox,
    columns = [],
    isHovered = false,
    isFocused = false,
    isPendingDelete = false,
}: ExpenseReportListItemRowWideProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const currency = item.currency ?? CONST.CURRENCY.USD;
    const {totalDisplaySpend = 0, nonReimbursableSpend = 0, reimbursableSpend = 0, isAllScanning: isScanning = false} = item;

    const columnComponents = {
        [CONST.SEARCH.TABLE_COLUMNS.AVATAR]: (
            <ExpenseReportListItemAvatar
                item={item}
                showTooltip={showTooltip}
                isHovered={isHovered}
                isFocused={isFocused}
                isLargeScreenWidth
            />
        ),
        [CONST.SEARCH.TABLE_COLUMNS.DATE]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, {isDateColumnWide: item.shouldShowYear})]}>
                <DateCell
                    date={item.created ?? ''}
                    showTooltip
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.SUBMITTED]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.SUBMITTED, {isSubmittedColumnWide: item.shouldShowYearSubmitted})]}>
                <DateCell
                    date={item.submitted ?? ''}
                    showTooltip
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.APPROVED]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.APPROVED, {isApprovedColumnWide: item.shouldShowYearApproved})]}>
                <DateCell
                    date={item.approved ?? ''}
                    showTooltip
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.EXPORTED]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPORTED, {isExportedColumnWide: item.shouldShowYearExported})]}>
                <DateCell
                    date={item.exported ?? ''}
                    showTooltip
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.STATUS]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.STATUS)]}>
                <StatusCell
                    stateNum={item.stateNum}
                    statusNum={item.statusNum}
                    isPending={item.shouldShowStatusAsPending}
                    isSelected={item.isSelected}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.TITLE]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TITLE)]}>
                <TextCell
                    text={item.reportName ?? ''}
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.FROM]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
                {!!item.from && (
                    <UserInfoCell
                        accountID={item.from.accountID}
                        avatar={item.from.avatar}
                        displayName={item.formattedFrom ?? ''}
                        isLargeScreenWidth
                    />
                )}
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.TO]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TO)]}>
                {!!item.to && (
                    <UserInfoCell
                        accountID={item.to.accountID}
                        avatar={item.to.avatar}
                        displayName={item.formattedTo ?? ''}
                        isLargeScreenWidth
                    />
                )}
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE_TOTAL]: (
            <View
                style={[
                    StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE_TOTAL, {isAmountColumnWide: item.isAmountColumnWide, shouldRemoveTotalColumnFlex: true}),
                ]}
            >
                <TotalCell
                    total={reimbursableSpend}
                    currency={currency}
                    isScanning={isScanning}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL]: (
            <View
                style={[
                    StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL, {
                        isAmountColumnWide: item.isAmountColumnWide,
                        shouldRemoveTotalColumnFlex: true,
                    }),
                ]}
            >
                <TotalCell
                    total={nonReimbursableSpend}
                    currency={currency}
                    isScanning={isScanning}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.TOTAL]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL, {isAmountColumnWide: item.isAmountColumnWide, shouldRemoveTotalColumnFlex: true})]}>
                <TotalCell
                    total={totalDisplaySpend}
                    currency={currency}
                    isScanning={isScanning}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.REPORT_ID]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.REPORT_ID)]}>
                <TextCell text={item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? '' : item.reportID} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.BASE_62_REPORT_ID)]}>
                <TextCell text={item.reportID === CONST.REPORT.UNREPORTED_REPORT_ID ? '' : getBase62ReportID(Number(item.reportID))} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPORTED_TO)]}>
                <ExportedIconCell reportActions={reportActions} />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.ACTION]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)]}>
                <DeferredActionCell
                    action={item.action}
                    onButtonPress={onButtonPress}
                    isSelected={item.isSelected}
                    isLoading={isActionLoading}
                    policyID={item.policyID}
                    reportID={item.reportID}
                    hash={item.hash}
                    amount={item.total}
                    shouldDisablePointerEvents={isPendingDelete}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.POLICY_NAME)]}>
                <WorkspaceCell
                    policyID={item.policyID}
                    report={item}
                />
            </View>
        ),
    };

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3, containerStyle]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                {!!canSelectMultiple && (
                    <Checkbox
                        onPress={onCheckboxPress}
                        isChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        containerStyle={styles.m0}
                        disabled={isDisabledCheckbox}
                        accessibilityLabel={item.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={[styles.cursorUnset, isDisabledCheckbox && styles.cursorDisabled]}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.EXPENSE_REPORT_CHECKBOX}
                    />
                )}
                {columns.map((column) => {
                    const CellComponent = columnComponents[column as keyof typeof columnComponents];
                    return <Fragment key={column}>{CellComponent}</Fragment>;
                })}
            </View>
            <Icon
                src={expensifyIcons.ArrowRight}
                width={variables.iconSizeNormal}
                height={variables.iconSizeNormal}
                fill={theme.icon}
                additionalStyles={!isHovered && styles.opacitySemiTransparent}
            />
        </View>
    );
}

export default ExpenseReportListItemRowWide;
