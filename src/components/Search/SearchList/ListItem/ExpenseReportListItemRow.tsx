import React, {Fragment} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import SearchReportAvatar from '@components/ReportActionAvatars/SearchReportAvatar';
import type {SearchColumnType} from '@components/Search/types';
import Text from '@components/Text';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import getBase62ReportID from '@libs/getBase62ReportID';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import ActionCell from './ActionCell';
import DateCell from './DateCell';
import ExportedIconCell from './ExportedIconCell';
import StatusCell from './StatusCell';
import TextCell from './TextCell';
import TotalCell from './TotalCell';
import type {ExpenseReportListItemType} from './types';
import UserInfoCell from './UserInfoCell';
import WorkspaceCell from './WorkspaceCell';

type ExpenseReportListItemRowProps = {
    item: ExpenseReportListItemType;
    reportActions?: ReportAction[];
    showTooltip: boolean;
    canSelectMultiple?: boolean;
    isActionLoading?: boolean;
    onButtonPress?: () => void;
    onCheckboxPress?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    isSelectAllChecked?: boolean;
    isIndeterminate?: boolean;
    isDisabledCheckbox?: boolean;
    isHovered?: boolean;
    isFocused?: boolean;
    isPendingDelete?: boolean;
    columns?: SearchColumnType[];
    isLargeScreenWidth?: boolean;
};

function ExpenseReportListItemRow({
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
    isLargeScreenWidth = false,
}: ExpenseReportListItemRowProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const currency = item.currency ?? CONST.CURRENCY.USD;
    const {totalDisplaySpend = 0, nonReimbursableSpend = 0, reimbursableSpend = 0, isAllScanning: isScanning = false} = item;

    const columnComponents = {
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
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.TITLE]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TITLE)]}>
                <TextCell
                    text={item.reportName ?? ''}
                    isLargeScreenWidth={isLargeScreenWidth}
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
                        isLargeScreenWidth={isLargeScreenWidth}
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
                        isLargeScreenWidth={isLargeScreenWidth}
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
                <ActionCell
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

    // Calculate the correct border color for avatars based on hover and focus states
    const finalAvatarBorderColor =
        StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused || !!isHovered, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ??
        theme.highlightBG;

    if (!isLargeScreenWidth) {
        const expenseCount = item.transactionCount ?? item.transactions?.length ?? 0;
        const expenseCountText = translate('iou.expenseCount', {count: expenseCount});
        const formattedDate = DateUtils.formatWithUTCTimeZone(
            item.created ?? '',
            DateUtils.doesDateBelongToAPastYear(item.created ?? '') ? CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT : CONST.DATE.MONTH_DAY_ABBR_FORMAT,
        );

        const amountText = isScanning ? translate('iou.receiptStatusTitle') : convertToDisplayString(totalDisplaySpend, currency);
        const groupAccessibilityLabel = [item.reportName, amountText, formattedDate, expenseCountText].filter(Boolean).join(', ');
        return (
            <View
                style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}
                accessible
                accessibilityLabel={groupAccessibilityLabel}
                role={CONST.ROLE.BUTTON}
            >
                {!!canSelectMultiple && (
                    <Checkbox
                        onPress={onCheckboxPress}
                        isChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled), styles.m0]}
                        disabled={isDisabledCheckbox}
                        accessibilityLabel={item.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), isDisabledCheckbox && styles.cursorDisabled]}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.EXPENSE_REPORT_CHECKBOX}
                    />
                )}
                <View style={[styles.flexColumn, styles.gap1, styles.flex1]}>
                    <View style={[styles.flexRow, styles.gap2]}>
                        <Text
                            numberOfLines={2}
                            style={[styles.lh20, styles.flex1]}
                        >
                            {item.reportName ?? ''}
                        </Text>
                        <Text style={[styles.lh20, styles.flexShrink0, styles.textAlignRight]}>
                            {isScanning ? translate('iou.receiptStatusTitle') : convertToDisplayString(totalDisplaySpend, currency)}
                        </Text>
                    </View>
                    <View style={[styles.flexRow, styles.gap2]}>
                        <Text style={[styles.mutedNormalTextLabel, styles.flex1]}>{formattedDate}</Text>
                        <Text style={[styles.mutedNormalTextLabel, styles.flexShrink0, styles.textAlignRight]}>{expenseCountText}</Text>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3, containerStyle]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                {!!canSelectMultiple && (
                    <Checkbox
                        onPress={onCheckboxPress}
                        isChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled), styles.m0]}
                        disabled={isDisabledCheckbox}
                        accessibilityLabel={item.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), isDisabledCheckbox && styles.cursorDisabled]}
                        sentryLabel={CONST.SENTRY_LABEL.SEARCH.EXPENSE_REPORT_CHECKBOX}
                    />
                )}
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR), styles.alignItemsStretch]}>
                    <SearchReportAvatar
                        primaryAvatar={item.primaryAvatar}
                        secondaryAvatar={item.secondaryAvatar}
                        avatarType={item.avatarType}
                        shouldShowTooltip={showTooltip}
                        subscriptAvatarBorderColor={finalAvatarBorderColor}
                        reportID={item.reportID}
                        isLargeScreenWidth={isLargeScreenWidth}
                    />
                </View>

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

export default ExpenseReportListItemRow;
