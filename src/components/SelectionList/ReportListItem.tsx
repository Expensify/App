import React from 'react';
import {useWindowDimensions, View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import CONST from '@src/CONST';
import BaseListItem from './BaseListItem';
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
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.mr4]}>
                        <View style={[styles.flexRow, styles.flex1, styles.alignItemsCenter, styles.justifyContentBetween, {marginRight: 52}]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                                {canSelectMultiple && (
                                    <PressableWithFeedback
                                        accessibilityLabel={item.text ?? ''}
                                        role={CONST.ROLE.BUTTON}
                                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                        disabled={isDisabled || item.isDisabledCheckbox}
                                        onPress={() => {}}
                                        style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled]}
                                    >
                                        <View style={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}>
                                            {item.isSelected && (
                                                <Icon
                                                    src={Expensicons.Checkmark}
                                                    fill={theme.textLight}
                                                    height={14}
                                                    width={14}
                                                />
                                            )}
                                        </View>
                                    </PressableWithFeedback>
                                )}
                                <View style={[styles.flexShrink1, styles.ph4]}>
                                    <Text style={[styles.textNormalThemeText, {fontWeight: '700'}]}>{reportItem?.reportName}</Text>
                                    <Text style={[styles.textMicroSupporting]}>{`${reportItem.transactions.length} grouped expenses`}</Text>
                                </View>
                            </View>
                            {totalCell}
                        </View>
                        <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION)]}>{actionCell}</View>
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
