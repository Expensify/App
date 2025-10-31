import React, {useMemo} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ReportActionAvatars from '@components/ReportActionAvatars';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem, TransactionReportGroupListItemType} from '@components/SelectionListWithSections/types';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleActionButtonPress} from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchPolicy, SearchReport} from '@src/types/onyx/SearchResults';
import ActionCell from './ActionCell';
import DateCell from './DateCell';
import StatusCell from './StatusCell';
import TitleCell from './TitleCell';
import TotalCell from './TotalCell';
import UserInfoCell from './UserInfoCell';

type ReportListItemRowProps<TItem extends ListItem> = {
    /** The report currently being looked at */
    report: TransactionReportGroupListItemType;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;

    /** Whether all transactions are selected */
    isSelectAllChecked?: boolean;

    /** Whether only some transactions are selected */
    isIndeterminate?: boolean;

    /** Callback to fire when DEW modal should be opened */
    onDEWModalOpen?: () => void;

    /** Optional container styles */
    containerStyle?: StyleProp<ViewStyle>;
};

function ReportListItemRow<TItem extends ListItem>({
    report: reportItem,
    onSelectRow,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    onDEWModalOpen,
    containerStyle,
}: ReportListItemRowProps<TItem>) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {currentSearchHash, currentSearchKey} = useSearchContext();
    const {isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`, {canBeMissing: true});

    const snapshotReport = useMemo(() => {
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`] ?? {}) as SearchReport;
    }, [snapshot, reportItem.reportID]);

    const snapshotPolicy = useMemo(() => {
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem.policyID}`] ?? {}) as SearchPolicy;
    }, [snapshot, reportItem.policyID]);

    const {total, currency} = useMemo(() => {
        let reportTotal = reportItem.total ?? 0;

        if (reportTotal) {
            if (reportItem.type === CONST.REPORT.TYPE.IOU) {
                reportTotal = Math.abs(reportTotal ?? 0);
            } else {
                reportTotal *= reportItem.type === CONST.REPORT.TYPE.EXPENSE || reportItem.type === CONST.REPORT.TYPE.INVOICE ? -1 : 1;
            }
        }

        const reportCurrency = reportItem.currency ?? CONST.CURRENCY.USD;

        return {total: reportTotal, currency: reportCurrency};
    }, [reportItem.type, reportItem.total, reportItem.currency]);

    const handleOnButtonPress = () => {
        handleActionButtonPress(
            currentSearchHash,
            reportItem,
            () => onSelectRow(reportItem as unknown as TItem),
            shouldUseNarrowLayout && !!canSelectMultiple,
            snapshotReport,
            snapshotPolicy,
            lastPaymentMethod,
            currentSearchKey,
            onDEWModalOpen,
        );
    };

    if (!isLargeScreenWidth) {
        // Mobile/small screen layout - simplified view
        return (
            <View style={[containerStyle, styles.gap3]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                    {!!canSelectMultiple && (
                        <Checkbox
                            onPress={() => onCheckboxPress?.(reportItem as unknown as TItem)}
                            isChecked={isSelectAllChecked}
                            isIndeterminate={isIndeterminate}
                            containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!reportItem.isSelected, !!reportItem.isDisabled)]}
                            disabled={!!isDisabled || reportItem.isDisabledCheckbox}
                            accessibilityLabel={reportItem.text ?? ''}
                            shouldStopMouseDownPropagation
                            style={styles.mr1}

                            // style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), reportItem.isDisabledCheckbox && styles.cursorDisabled]}
                        />
                    )}
                    <ReportActionAvatars
                        reportID={reportItem.reportID}
                        size={CONST.AVATAR_SIZE.MID_SUBSCRIPT}
                        shouldShowTooltip
                        singleAvatarContainerStyle={[styles.mr2]}
                    />
                    <View style={[styles.flex1, styles.gap1]}>
                        <TitleCell
                            text={reportItem.reportName ?? ''}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                        <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter]}>
                            <StatusCell
                                stateNum={reportItem.stateNum}
                                statusNum={reportItem.statusNum}
                            />
                            <DateCell
                                created={reportItem.created ?? ''}
                                showTooltip
                                isLargeScreenWidth={isLargeScreenWidth}
                            />
                        </View>
                    </View>
                    <TotalCell
                        total={total}
                        currency={currency}
                    />
                </View>
                {!!(reportItem.from || reportItem.to) && (
                    <View style={[styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                        {!!reportItem.from && (
                            <View style={[styles.flex1]}>
                                <UserInfoCell
                                    accountID={reportItem.from.accountID}
                                    avatar={reportItem.from.avatar}
                                    displayName={reportItem.from.displayName ?? reportItem.from.login ?? ''}
                                />
                            </View>
                        )}
                        {!!reportItem.to && (
                            <View style={[styles.flex1]}>
                                <UserInfoCell
                                    accountID={reportItem.to.accountID}
                                    avatar={reportItem.to.avatar}
                                    displayName={reportItem.to.displayName ?? reportItem.to.login ?? ''}
                                />
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    }

    // Desktop/large screen layout - column-based table view
    return (
        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, containerStyle]}>
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                {/* {!!canSelectMultiple && (
                    <Checkbox
                        onPress={() => onCheckboxPress?.(reportItem as unknown as TItem)}
                        isChecked={isSelectAllChecked}
                        isIndeterminate={isIndeterminate}
                        containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!reportItem.isSelected, !!reportItem.isDisabled)]}
                        disabled={!!isDisabled || reportItem.isDisabledCheckbox}
                        accessibilityLabel={reportItem.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), reportItem.isDisabledCheckbox && styles.cursorDisabled]}
                    />
                )} */}
                {!!canSelectMultiple && (
                    <Checkbox
                        // disabled={isDisabled}
                        onPress={() => {
                            // onCheckboxPress(transactionItem.transactionID);
                        }}
                        accessibilityLabel={CONST.ROLE.CHECKBOX}
                        // isChecked={isSelected}
                        style={styles.mr1}
                        wrapperStyle={styles.justifyContentCenter}
                    />
                )}
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.AVATAR)]}>
                    <ReportActionAvatars
                        reportID={reportItem.reportID}
                        shouldShowTooltip
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, true)]}>
                    <DateCell
                        created={reportItem.created ?? ''}
                        showTooltip
                        isLargeScreenWidth
                    />
                </View>

                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.STATUS)]}>
                    <StatusCell
                        stateNum={reportItem.stateNum}
                        statusNum={reportItem.statusNum}
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TITLE)]}>
                    <TitleCell
                        text={reportItem.reportName ?? ''}
                        isLargeScreenWidth={isLargeScreenWidth}
                    />
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.FROM)]}>
                    {!!reportItem.from && (
                        <UserInfoCell
                            accountID={reportItem.from.accountID}
                            avatar={reportItem.from.avatar}
                            displayName={reportItem.from.displayName ?? reportItem.from.login ?? ''}
                        />
                    )}
                </View>
                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TO)]}>
                    {!!reportItem.to && (
                        <UserInfoCell
                            accountID={reportItem.to.accountID}
                            avatar={reportItem.to.avatar}
                            displayName={reportItem.to.displayName ?? reportItem.to.login ?? ''}
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
                        action={reportItem.action}
                        goToItem={handleOnButtonPress}
                        isSelected={reportItem.isSelected}
                        isLoading={reportItem.isActionLoading}
                        policyID={reportItem.policyID}
                        reportID={reportItem.reportID}
                        hash={reportItem.hash}
                        amount={reportItem.total}
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
