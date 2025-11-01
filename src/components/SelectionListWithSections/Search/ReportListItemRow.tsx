import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ColorValue, StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ReportActionAvatars from '@components/ReportActionAvatars';
import ReportSearchHeader from '@components/ReportSearchHeader';
import type {ReportListItemType} from '@components/SelectionListWithSections/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ActionCell from './ActionCell';
import DateCell from './DateCell';
import StatusCell from './StatusCell';
import TitleCell from './TitleCell';
import TotalCell from './TotalCell';
import UserInfoAndActionButtonRow from './UserInfoAndActionButtonRow';
import UserInfoCell from './UserInfoCell';

type ReportListItemRowProps = {
    item: ReportListItemType;
    showTooltip: boolean;
    canSelectMultiple?: boolean;
    isActionLoading?: boolean;
    onButtonPress?: () => void;
    onCheckboxPress?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    avatarBorderColor?: ColorValue;
    isSelectAllChecked?: boolean;
    isIndeterminate?: boolean;
    isDisabled?: boolean;
};

function ReportListItemRow({
    item,
    onCheckboxPress = () => {},
    onButtonPress = () => {},
    isActionLoading,
    containerStyle,
    showTooltip,
    canSelectMultiple,
    avatarBorderColor,
    isSelectAllChecked,
    isIndeterminate,
    isDisabled,
}: ReportListItemRowProps) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {isLargeScreenWidth} = useResponsiveLayout();

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

    if (!isLargeScreenWidth) {
        return (
            <View style={[styles.pv1Half]}>
                <UserInfoAndActionButtonRow
                    item={item}
                    handleActionButtonPress={onButtonPress}
                    shouldShowUserInfo={showUserInfo}
                    containerStyles={[styles.mb2, styles.ph0]}
                />
                <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                        {!!canSelectMultiple && (
                            <Checkbox
                                onPress={onCheckboxPress}
                                isChecked={isSelectAllChecked}
                                isIndeterminate={isIndeterminate}
                                containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}
                                disabled={!!isDisabled || item.isDisabledCheckbox}
                                accessibilityLabel={item.text ?? ''}
                                shouldStopMouseDownPropagation
                                style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled]}
                            />
                        )}
                        <View style={[{flexShrink: 1, flexGrow: 1, minWidth: 0}, styles.mr2]}>
                            <ReportSearchHeader
                                report={item}
                                style={[{maxWidth: 700}]}
                                transactions={item.transactions}
                                avatarBorderColor={avatarBorderColor}
                            />
                        </View>
                    </View>
                    <View style={[styles.flexShrink0, styles.flexColumn, styles.alignItemsCenter, styles.gap1]}>
                        <TotalCell
                            total={total}
                            currency={currency}
                        />
                        <View style={[styles.w100, styles.flexRow, styles.justifyContentEnd]}>
                            <Icon
                                src={Expensicons.ArrowRight}
                                fill={theme.icon}
                                additionalStyles={[styles.flexShrink0, {opacity: 0.5}]}
                                small
                            />
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                {!!canSelectMultiple && (
                    <Checkbox
                        onPress={onCheckboxPress}
                        isChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}
                        disabled={!!isDisabled || item.isDisabledCheckbox}
                        accessibilityLabel={item.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled, styles.mr1]}
                    />
                )}
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR), {alignItems: 'stretch'}]}>
                    <ReportActionAvatars
                        reportID={item.reportID}
                        shouldShowTooltip={showTooltip}
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
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT)]}>
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
                <Icon
                    src={Expensicons.ArrowRight}
                    fill={theme.icon}
                    additionalStyles={{opacity: 0.5}}
                    small
                />
            </View>
        </View>
    );
}

ReportListItemRow.displayName = 'ReportListItemRow';

export default ReportListItemRow;
