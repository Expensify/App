import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ReportActionAvatars from '@components/ReportActionAvatars';
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
import UserInfoCell from './UserInfoCell';

type ReportListItemRowProps = {
    item: ReportListItemType;
    showTooltip: boolean;
    canSelectMultiple?: boolean;
    isSelected?: boolean;
    isActionLoading?: boolean;
    onButtonPress?: () => void;
    onCheckboxPress?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
};

function ReportListItemRow({
    item,
    isSelected,
    onCheckboxPress = () => {},
    onButtonPress = () => {},
    isActionLoading,
    containerStyle,
    showTooltip,
    canSelectMultiple,
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

    if (!isLargeScreenWidth) {
        // return <HeaderFirstRow
        //                 report={reportItem}
        //                 onCheckboxPress={onCheckboxPress}
        //                 isDisabled={isDisabled}
        //                 canSelectMultiple={canSelectMultiple}
        //                 avatarBorderColor={avatarBorderColor}
        //                 isSelectAllChecked={isSelectAllChecked}
        //                 isIndeterminate={isIndeterminate}
        //             />
        //             <UserInfoAndActionButtonRow
        //                 item={reportItem}
        //                 handleActionButtonPress={handleOnButtonPress}
        //                 shouldShowUserInfo={showUserInfo}
        //                 containerStyles={[styles.pr0]}
        //             />
        // Mobile/small screen layout - simplified view
        return (
            <View style={[containerStyle, styles.gap3]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                    {/* {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(item as unknown as TItem)}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
                            containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}
                            disabled={!!isDisabled || item.isDisabledCheckbox}
                            accessibilityLabel={item.text ?? ''}
                            shouldStopMouseDownPropagation
                            style={styles.mr1}
                            // style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled]}
                        />
                    )} */}
                    <ReportActionAvatars
                        reportID={item.reportID}
                        size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                        shouldShowTooltip={showTooltip}
                        singleAvatarContainerStyle={[styles.mr2]}
                    />
                    <View style={[styles.flex1, styles.gap1]}>
                        <TitleCell
                            text={item.reportName ?? ''}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                        <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                            <StatusCell
                                stateNum={item.stateNum}
                                statusNum={item.statusNum}
                            />
                            <DateCell
                                created={item.created ?? ''}
                                showTooltip={showTooltip}
                                isLargeScreenWidth={isLargeScreenWidth}
                            />
                        </View>
                    </View>
                    <TotalCell
                        total={total}
                        currency={currency}
                    />
                </View>
                {/* {!!(item.from || item.to) && (
                    <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                        {!!item.from && (
                            <View style={[styles.flex1]}>
                                <UserInfoCell
                                    accountID={item.from.accountID}
                                    avatar={item.from.avatar}
                                    displayName={item.from.displayName ?? item.from.login ?? ''}
                                />
                            </View>
                        )}
                        {!!item.to && (
                            <View style={[styles.flex1]}>
                                <UserInfoCell
                                    accountID={item.to.accountID}
                                    avatar={item.to.avatar}
                                    displayName={item.to.displayName ?? item.to.login ?? ''}
                                />
                            </View>
                        )}
                    </View>
                )} */}
            </View>
        );
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                {!!canSelectMultiple && (
                    <Checkbox
                        onPress={onCheckboxPress}
                        accessibilityLabel={CONST.ROLE.CHECKBOX}
                        isChecked={isSelected}
                        style={styles.mr1}
                        wrapperStyle={styles.justifyContentCenter}
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
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ARROW)]}>
                    <Icon
                        src={Expensicons.ArrowRight}
                        fill={theme.icon}
                        additionalStyles={{opacity: 0.5}}
                        small
                    />
                </View>
            </View>
        </View>
    );
}

ReportListItemRow.displayName = 'ReportListItemRow';

export default ReportListItemRow;
