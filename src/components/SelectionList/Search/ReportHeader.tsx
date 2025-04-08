import {useRoute} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Checkbox from '@components/Checkbox';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useSearchContext} from '@components/Search/SearchContext';
import type {ListItem, ReportListItemType} from '@components/SelectionList/types';
import TextWithTooltip from '@components/TextWithTooltip';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {handleActionButtonPress} from '@userActions/Search';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import ActionCell from './ActionCell';

type MoneyReportHeaderProps<TItem extends ListItem> = {
    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The policy tied to the expense report */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The reportID of the transaction thread report associated with this current report, if any */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionThreadReportID: string | undefined;

    /** Whether back button should be displayed in header */
    shouldDisplayBackButton?: boolean;

    /** Method to trigger when pressing close button of the header */
    onBackButtonPress: () => void;

    shouldDisplaySearchIcon?: boolean;

    /** The section list item */
    item: TItem;

    /** Callback to fire when the item is pressed */
    onSelectRow: (item: TItem) => void;

    /** Callback to fire when a checkbox is pressed */
    onCheckboxPress?: (item: TItem) => void;

    /** Whether this section items disabled for selection */
    isDisabled?: boolean | null;
};

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
    isLargeScreenWidth: boolean;
};

type ReportCellProps = {
    reportItem: ReportListItemType;
} & CellProps;

function TotalCell({showTooltip, isLargeScreenWidth, reportItem}: ReportCellProps) {
    const styles = useThemeStyles();

    let total = reportItem?.total ?? 0;

    // Only invert non-zero values otherwise we'll end up with -0.00
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

function ReportHeader<TItem extends ListItem>({
    policy,
    report: moneyRequestReport,
    shouldDisplayBackButton = false,
    onBackButtonPress,
    shouldDisplaySearchIcon = true,
    item,
    onSelectRow,
    onCheckboxPress,
    isDisabled,
}: MoneyReportHeaderProps<TItem>) {
    const styles = useThemeStyles();
    const shouldDisplaySearchRouter = false;
    const shouldShowBackButton = false;
    const StyleUtils = useStyleUtils();
    const reportItem = item as unknown as ReportListItemType;
    const {currentSearchHash} = useSearchContext();

    const handleOnButtonPress = () => {
        handleActionButtonPress(currentSearchHash, reportItem, () => onSelectRow(item));
    };

    return (
        // powinien byc pading 16 zgodnie z figmą ale daje 12 żeby było zgodnie z apką
        <View style={[styles.pt0, styles.borderBottom, {flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingRight: 12, paddingLeft: 12, gap: 12}]}>
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
                <HeaderWithBackButton
                    shouldShowReportAvatarWithDisplay
                    shouldEnableDetailPageNavigation
                    shouldShowPinButton={false}
                    report={moneyRequestReport}
                    policy={policy}
                    shouldShowBackButton={shouldShowBackButton}
                    shouldDisplaySearchRouter={shouldDisplaySearchRouter}
                    onBackButtonPress={onBackButtonPress}
                    style={[{maxWidth: 700}]}
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
    );
}

export default ReportHeader;
