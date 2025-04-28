import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Checkbox from '@components/Checkbox';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ReportSearchHeader from '@components/ReportSearchHeader';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem, ReportListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {handleActionButtonPress} from '@userActions/Search';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import ActionCell from './ActionCell';

type ReportListItemHeaderProps<TItem extends ListItem> = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The policy tied to the expense report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;

    /** The section list item */
    item: TItem;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;
};

type ReportCellProps = {
    showTooltip: boolean;
    isLargeScreenWidth: boolean;
    reportItem: ReportListItemType;
};

function TotalCell({showTooltip, isLargeScreenWidth, reportItem}: ReportCellProps) {
    const styles = useThemeStyles();

    let total = reportItem?.total ?? 0;

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

function ReportListItemHeader<TItem extends ListItem>({
    policy,
    report: moneyRequestReport,
    onBackButtonPress,
    item,
    onSelectRow,
    onCheckboxPress,
    isDisabled,
}: ReportListItemHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const shouldDisplaySearchRouter = false;
    const StyleUtils = useStyleUtils();
    const reportItem = item as unknown as ReportListItemType;
    const {currentSearchHash} = useSearchContext();

    const handleOnButtonPress = () => {
        handleActionButtonPress(currentSearchHash, reportItem, () => onSelectRow(item));
    };
    return (
        <View>
            <View style={[styles.pt0, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart, styles.pr3, styles.pl3, styles.gap3]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mnh40, styles.flex5]}>
                    <Checkbox
                        onPress={() => onCheckboxPress?.(item)}
                        isChecked={item.isSelected}
                        containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}
                        disabled={!!isDisabled || item.isDisabledCheckbox}
                        accessibilityLabel={item.text ?? ''}
                        shouldStopMouseDownPropagation
                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled]}
                    />
                    <ReportSearchHeader
                        report={moneyRequestReport}
                        policy={policy}
                        style={[{maxWidth: 700}]}
                        transactions={reportItem.transactions}
                    />
                </View>
                <View style={[styles.justifyContentEnd]}>
                    <TotalCell
                        showTooltip
                        isLargeScreenWidth
                        reportItem={reportItem}
                    />
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
            <View style={[styles.mr3, styles.ml3]}>
                <View style={[styles.borderBottom]} />
            </View>
        </View>
    );
}

ReportListItemHeader.displayName = 'ReportListItemHeader';

export default ReportListItemHeader;
