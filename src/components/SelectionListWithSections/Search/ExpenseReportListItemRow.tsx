import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import ReportActionAvatars from '@components/ReportActionAvatars';
import ReportSearchHeader from '@components/ReportSearchHeader';
import type {ExpenseReportListItemType} from '@components/SelectionListWithSections/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import ActionCell from './ActionCell';
import DateCell from './DateCell';
import StatusCell from './StatusCell';
import TitleCell from './TitleCell';
import TotalCell from './TotalCell';
import UserInfoAndActionButtonRow from './UserInfoAndActionButtonRow';
import UserInfoCell from './UserInfoCell';

type ExpenseReportListItemRowProps = {
    item: ExpenseReportListItemType;
    policy?: Policy;
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
};

function ExpenseReportListItemRow({
    item,
    policy,
    onCheckboxPress = () => {},
    onButtonPress = () => {},
    isActionLoading,
    containerStyle,
    showTooltip,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isDisabledCheckbox,
    isHovered = false,
    isFocused = false,
}: ExpenseReportListItemRowProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();

    const {total, currency} = useMemo(() => {
        let reportTotal = item.total ?? 0;

        if (reportTotal) {
            if (item.type === CONST.REPORT.TYPE.IOU) {
                reportTotal = Math.abs(reportTotal ?? 0);
            } else {
                reportTotal *= item.type === CONST.REPORT.TYPE.EXPENSE || item.type === CONST.REPORT.TYPE.INVOICE ? -1 : 1;
            }
        }

        const reportCurrency = item.currency ?? CONST.CURRENCY.USD;

        return {total: reportTotal, currency: reportCurrency};
    }, [item.type, item.total, item.currency]);

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
                            />
                        </View>
                    </View>
                    <View style={[styles.flexShrink0, styles.flexColumn, styles.alignItemsEnd, styles.gap1]}>
                        <TotalCell
                            total={total}
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
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, item.shouldShowYear)]}>
                    <DateCell
                        created={item.created ?? ''}
                        showTooltip
                        isLargeScreenWidth
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.STATUS)]}>
                    <StatusCell
                        stateNum={item.stateNum}
                        statusNum={item.statusNum}
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TITLE)]}>
                    <TitleCell
                        text={item.reportName ?? ''}
                        isLargeScreenWidth={isLargeScreenWidth}
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
                    {!!item.from && (
                        <UserInfoCell
                            accountID={item.from.accountID}
                            avatar={item.from.avatar}
                            displayName={item.from.displayName ?? item.from.login ?? ''}
                        />
                    )}
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TO)]}>
                    {!!item.to && (
                        <UserInfoCell
                            accountID={item.to.accountID}
                            avatar={item.to.avatar}
                            displayName={item.to.displayName ?? item.to.login ?? ''}
                        />
                    )}
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL)]}>
                    <TotalCell
                        total={total}
                        currency={currency}
                    />
                </View>
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
            </View>
        </View>
    );
}

ExpenseReportListItemRow.displayName = 'ExpenseReportListItemRow';

export default ExpenseReportListItemRow;
