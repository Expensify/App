import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
import ExpenseItemHeader from './ExpenseItemHeader';
import ListItemCheckbox from './ListItemCheckbox';
import TransactionListItem from './TransactionListItem';
import type {ListItem, ReportListItemProps, ReportListItemType} from './types';

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
    const reportItem = item as unknown as ReportListItemType;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const {isLargeScreenWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();

    const listItemPressableStyle = [styles.selectionListPressableItemWrapper, styles.pv3, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive];

    const totalCell = (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={CurrencyUtils.convertToDisplayString(reportItem?.total, reportItem?.currency)}
            style={[styles.optionDisplayName, styles.textNewKansasNormal, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : styles.textAlignRight]}
        />
    );

    const actionCell = (
        <Button
            text={translate('common.view')}
            onPress={() => {
                onSelectRow(item);
            }}
            small
            pressOnEnter
            style={[styles.p0]}
        />
    );

    if (reportItem.transactions.length === 1) {
        return (
            <TransactionListItem
                item={reportItem.transactions[0]}
                isFocused={isFocused}
                showTooltip={showTooltip}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                onSelectRow={onSelectRow}
                onDismissError={onDismissError}
                shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                onFocus={onFocus}
                shouldSyncFocus={shouldSyncFocus}
            />
        );
    }
    const participantFrom = reportItem.transactions[0].from;
    const participantTo = reportItem.transactions[0].to;

    if (reportItem?.reportName && reportItem.transactions.length > 1) {
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
                <View style={styles.flex1}>
                    {!isLargeScreenWidth && (
                        <ExpenseItemHeader
                            participantFrom={participantFrom}
                            participantTo={participantTo}
                            buttonText={translate('common.view')}
                            onButtonPress={() => {
                                onSelectRow(item);
                            }}
                        />
                    )}
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, isLargeScreenWidth && styles.mr4]}>
                        <View style={[styles.flexRow, styles.flex1, styles.alignItemsCenter, styles.justifyContentBetween, isLargeScreenWidth && {marginRight: 52}]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                {canSelectMultiple && (
                                    <ListItemCheckbox
                                        accessibilityLabel={item.text}
                                        isDisabled={!!isDisabled}
                                        isDisabledCheckbox={!!item.isDisabledCheckbox}
                                        isSelected={!!item.isSelected}
                                        onPress={() => {}}
                                    />
                                )}

                                <View style={[styles.flexShrink1, isLargeScreenWidth && styles.ph4]}>
                                    <Text style={[styles.textNormalThemeText, {fontWeight: '700'}]}>{reportItem?.reportName}</Text>
                                    <Text style={[styles.textMicroSupporting]}>{`${reportItem.transactions.length} grouped expenses`}</Text>
                                </View>
                            </View>
                            {totalCell}
                        </View>
                        {isLargeScreenWidth && <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>{actionCell}</View>}
                        {/* {reportItem.transactions.map((transaction) => (
                        <TransactionListItem
                            item={transaction}
                            isFocused={isFocused}
                            showTooltip={showTooltip}
                            isDisabled={isDisabled}
                            canSelectMultiple={canSelectMultiple}
                            onSelectRow={onSelectRow}
                            onDismissError={onDismissError}
                            shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                            onFocus={() => {}}
                            shouldSyncFocus={shouldSyncFocus}
                        />
                    ))} */}
                    </View>
                    <View style={[styles.mv3, {borderBottomWidth: 1, borderBottomColor: theme.activeComponentBG}]} />
                </View>
            </BaseListItem>
        );
    }

    return null;
}

ReportListItem.displayName = 'ReportListItem';

export default ReportListItem;
