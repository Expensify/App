import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {ColorValue} from 'react-native';
import Checkbox from '@components/Checkbox';
import ReportSearchHeader from '@components/ReportSearchHeader';
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
import TotalCell from './TotalCell';
import UserInfoAndActionButtonRow from './UserInfoAndActionButtonRow';

type ReportListItemHeaderProps<TItem extends ListItem> = {
    /** The report currently being looked at */
    report: TransactionReportGroupListItemType;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether the item is focused */
    isFocused?: boolean;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;

    /** Whether all transactions are selected */
    isSelectAllChecked?: boolean;

    /** Whether only some transactions are selected */
    isIndeterminate?: boolean;

    /** Whether the item is hovered */
    isHovered?: boolean;
};

type FirstRowReportHeaderProps<TItem extends ListItem> = {
    /** The report currently being looked at */
    report: TransactionReportGroupListItemType;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;

    /** Whether selecting multiple transactions at once is allowed */
    canSelectMultiple: boolean | undefined;

    /** Callback passed as goToItem in actionCell, triggered by clicking actionButton */
    handleOnButtonPress?: () => void;

    /** Whether the action button should be displayed */
    shouldShowAction?: boolean;

    /** Color of the secondary avatar border, usually should match the container background */
    avatarBorderColor?: ColorValue;

    /** Whether all transactions are selected */
    isSelectAllChecked?: boolean;

    /** Whether only some transactions are selected */
    isIndeterminate?: boolean;
};

function HeaderFirstRow<TItem extends ListItem>({
    report: reportItem,
    onCheckboxPress,
    isDisabled,
    canSelectMultiple,
    handleOnButtonPress = () => {},
    shouldShowAction = false,
    avatarBorderColor,
    isSelectAllChecked,
    isIndeterminate,
}: FirstRowReportHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

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

    return (
        <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart, styles.pl3]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex1, styles.gap3]}>
                {!!canSelectMultiple && (
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
                )}
                <View style={[{flexShrink: 1, flexGrow: 1, minWidth: 0}, styles.mr2]}>
                    <ReportSearchHeader
                        report={reportItem}
                        style={[{maxWidth: 700}]}
                        transactions={reportItem.transactions}
                        avatarBorderColor={avatarBorderColor}
                    />
                </View>
            </View>
            <View style={[styles.flexShrink0, shouldShowAction && styles.mr3]}>
                <TotalCell
                    total={total}
                    currency={currency}
                />
            </View>
            {shouldShowAction && (
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
            )}
        </View>
    );
}

function ReportListItemHeader<TItem extends ListItem>({
    report: reportItem,
    onSelectRow,
    onCheckboxPress,
    isDisabled,
    isFocused,
    canSelectMultiple,
    isSelectAllChecked,
    isIndeterminate,
    isHovered,
}: ReportListItemHeaderProps<TItem>) {
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {currentSearchHash, currentSearchKey} = useSearchContext();
    const {isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const thereIsFromAndTo = !!reportItem?.from && !!reportItem?.to;
    const showUserInfo = (reportItem.type === CONST.REPORT.TYPE.IOU && thereIsFromAndTo) || (reportItem.type === CONST.REPORT.TYPE.EXPENSE && !!reportItem?.from);
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`, {canBeMissing: true});
    const snapshotReport = useMemo(() => {
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`] ?? {}) as SearchReport;
    }, [snapshot, reportItem.reportID]);
    const snapshotPolicy = useMemo(() => {
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem.policyID}`] ?? {}) as SearchPolicy;
    }, [snapshot, reportItem.policyID]);
    const avatarBorderColor =
        StyleUtils.getItemBackgroundColorStyle(!!reportItem.isSelected, !!isFocused || !!isHovered, !!isDisabled, theme.activeComponentBG, theme.hoverComponentBG)?.backgroundColor ??
        theme.highlightBG;

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
        );
    };
    return !isLargeScreenWidth ? (
        <View>
            <HeaderFirstRow
                report={reportItem}
                onCheckboxPress={onCheckboxPress}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                avatarBorderColor={avatarBorderColor}
                isSelectAllChecked={isSelectAllChecked}
                isIndeterminate={isIndeterminate}
            />
            <UserInfoAndActionButtonRow
                item={reportItem}
                handleActionButtonPress={handleOnButtonPress}
                shouldShowUserInfo={showUserInfo}
                containerStyles={[styles.pr0]}
            />
        </View>
    ) : (
        <View>
            <HeaderFirstRow
                report={reportItem}
                onCheckboxPress={onCheckboxPress}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                shouldShowAction
                handleOnButtonPress={handleOnButtonPress}
                avatarBorderColor={avatarBorderColor}
                isSelectAllChecked={isSelectAllChecked}
                isIndeterminate={isIndeterminate}
            />
        </View>
    );
}

ReportListItemHeader.displayName = 'ReportListItemHeader';

export default ReportListItemHeader;
