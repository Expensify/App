import React, {Fragment} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import ReportActionAvatars from '@components/ReportActionAvatars';
import ReportSearchHeader from '@components/ReportSearchHeader';
import type {SearchColumnType} from '@components/Search/types';
import type {ExpenseReportListItemType} from '@components/SelectionListWithSections/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import getBase62ReportID from '@libs/getBase62ReportID';
import {getMoneyRequestSpendBreakdown} from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {PersonalDetailsList, Policy, ReportAction} from '@src/types/onyx';
import ActionCell from './ActionCell';
import DateCell from './DateCell';
import ExportedIconCell from './ExportedIconCell';
import StatusCell from './StatusCell';
import TextCell from './TextCell';
import TotalCell from './TotalCell';
import UserInfoAndActionButtonRow from './UserInfoAndActionButtonRow';
import UserInfoCell from './UserInfoCell';
import WorkspaceCell from './WorkspaceCell';

type ExpenseReportListItemRowProps = {
    item: ExpenseReportListItemType;
    policy?: Policy;
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
    columns?: SearchColumnType[];
    personalDetailsList?: PersonalDetailsList;
};

function ExpenseReportListItemRow({
    item,
    policy,
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
    personalDetailsList,
}: ExpenseReportListItemRowProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowRight']);

    const currency = item.currency ?? CONST.CURRENCY.USD;
    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(item);

    const columnComponents = {
        [CONST.SEARCH.TABLE_COLUMNS.DATE]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, item.shouldShowYear)]}>
                <DateCell
                    date={item.created ?? ''}
                    showTooltip
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.SUBMITTED]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.SUBMITTED, false, false, false, item.shouldShowYearSubmitted)]}>
                <DateCell
                    date={item.submitted ?? ''}
                    showTooltip
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.APPROVED]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.APPROVED, false, false, false, false, item.shouldShowYearApproved)]}>
                <DateCell
                    date={item.approved ?? ''}
                    showTooltip
                    isLargeScreenWidth
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.EXPORTED]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.EXPORTED, false, false, false, false, false, false, item.shouldShowYearExported)]}>
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
                    />
                )}
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE_TOTAL]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL)]}>
                <TotalCell
                    total={reimbursableSpend}
                    currency={currency}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL)]}>
                <TotalCell
                    total={nonReimbursableSpend}
                    currency={currency}
                />
            </View>
        ),
        [CONST.SEARCH.TABLE_COLUMNS.TOTAL]: (
            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL)]}>
                <TotalCell
                    total={totalDisplaySpend}
                    currency={currency}
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
                    goToItem={onButtonPress}
                    isSelected={item.isSelected}
                    isLoading={isActionLoading}
                    policyID={item.policyID}
                    reportID={item.reportID}
                    hash={item.hash}
                    amount={item.total}
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

    const thereIsFromAndTo = !!item?.from && !!item?.to;
    const showUserInfo = (item.type === CONST.REPORT.TYPE.IOU && thereIsFromAndTo) || (item.type === CONST.REPORT.TYPE.EXPENSE && !!item?.from);

    // Calculate the correct border color for avatars based on hover and focus states
    const finalAvatarBorderColor =
        StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused || !!isHovered, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ??
        theme.highlightBG;

    if (!isLargeScreenWidth) {
        return (
            <View>
                <UserInfoAndActionButtonRow
                    item={item}
                    handleActionButtonPress={onButtonPress}
                    shouldShowUserInfo={showUserInfo}
                    containerStyles={[styles.mb2, styles.ph0]}
                    isInMobileSelectionMode={shouldUseNarrowLayout && !!canSelectMultiple}
                />
                <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                        {!!canSelectMultiple && (
                            <Checkbox
                                onPress={onCheckboxPress}
                                isChecked={isSelectAllChecked}
                                isIndeterminate={isIndeterminate}
                                containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}
                                disabled={isDisabledCheckbox}
                                accessibilityLabel={item.text ?? ''}
                                shouldStopMouseDownPropagation
                                style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), isDisabledCheckbox && styles.cursorDisabled]}
                            />
                        )}
                        <View style={[styles.flexShrink1, styles.flexGrow1, styles.mnw0, styles.mr2]}>
                            <ReportSearchHeader
                                report={item}
                                style={[{maxWidth: variables.reportSearchHeaderMaxWidth}]}
                                transactions={item.transactions}
                                avatarBorderColor={finalAvatarBorderColor}
                                personalDetailsList={personalDetailsList}
                            />
                        </View>
                    </View>
                    <View style={[styles.flexShrink0, styles.flexColumn, styles.alignItemsEnd, styles.gap1]}>
                        <TotalCell
                            total={totalDisplaySpend}
                            currency={currency}
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.pr2]}>
                {!!canSelectMultiple && (
                    <Checkbox
                        onPress={onCheckboxPress}
                        isChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}
                        disabled={isDisabledCheckbox}
                        accessibilityLabel={item.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), isDisabledCheckbox && styles.cursorDisabled, styles.mr1]}
                    />
                )}
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR), {alignItems: 'stretch'}]}>
                    <ReportActionAvatars
                        report={item}
                        reportID={item.reportID}
                        policy={policy}
                        shouldShowTooltip={showTooltip}
                        subscriptAvatarBorderColor={finalAvatarBorderColor}
                        personalDetailsList={personalDetailsList}
                    />
                </View>

                {columns.map((column) => {
                    const CellComponent = columnComponents[column as keyof typeof columnComponents];
                    return <Fragment key={column}>{CellComponent}</Fragment>;
                })}
            </View>
            <View style={styles.ml2}>
                <Icon
                    src={expensifyIcons.ArrowRight}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                    fill={theme.icon}
                    additionalStyles={!isHovered && styles.opacitySemiTransparent}
                />
            </View>
        </View>
    );
}

export default ExpenseReportListItemRow;
