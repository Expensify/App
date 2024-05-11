import React from 'react';
import {View} from 'react-native';
import useWindowDimensions from '@hooks/useWindowDimensions';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ListItem, ReportListItemProps} from '@components/SelectionList/types';
import BaseListItem from '@components/SelectionList/BaseListItem';
import TextWithTooltip from '@components/TextWithTooltip';
import useStyleUtils from '@hooks/useStyleUtils';
import CONST from '@src/CONST';
import type {ThemeStyles} from '@styles/index';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';

const reportNameCell = (showTooltip: boolean, item: ReportListItem, styles: ThemeStyles) => (
    <TextWithTooltip
        shouldShowTooltip={showTooltip}
        text={item.name}
        style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
    />
)

const groupedExpensesCell = (showTooltip: boolean, item: ReportListItem, styles: ThemeStyles, translate) => (
    <TextWithTooltip
        shouldShowTooltip={showTooltip}
        text={`${item.transactions.length} grouped expenses`}
        style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
    />
)

const totalCell = (showTooltip: boolean, item: ReportListItem, styles: ThemeStyles) => (
    <TextWithTooltip
        shouldShowTooltip={showTooltip}
        text={CurrencyUtils.convertToDisplayString(item.total, item.currency)}
        style={[styles.optionDisplayName, styles.label, styles.pre, styles.justifyContentCenter]}
    />
)

const actionCell = (showTooltip: boolean, item: ReportListItem, styles: ThemeStyles, translate, onSelectRow) => (
    <Button
        text={translate('common.view')}
        onPress={() => {
            onSelectRow(item);
        }}
        small
        pressOnEnter
        style={[styles.p0]}
    />
)

function ReportListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onDismissError,
    shouldPreventDefaultFocusOnSelectRow,
    onFocus,
    shouldSyncFocus,
}: ReportListItemProps<TItem>) {
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const listItemPressableStyle = [styles.selectionListPressableItemWrapper, styles.pv3, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive];

    if (!isLargeScreenWidth) {
        return (
            <></>
        );
    }

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]}
            containerStyle={[styles.mb3]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
        >
            {() => (
                <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.alignItemsCenter]}>
                    <View style={[styles.flex1]}>
                        {reportNameCell(showTooltip, item, styles)}
                        {groupedExpensesCell(showTooltip, item, styles, translate)}
                    </View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.TOTAL)]}>{totalCell(showTooltip, item, styles)}</View>
                    <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>{actionCell(showTooltip, item, styles, translate, shouldPreventDefaultFocusOnSelectRow)}</View>
                </View>
                // line separator
                // transactionlist items
            )}
        </BaseListItem>
    );
}

ReportListItem.displayName = 'ReportListItem';

export default ReportListItem;
