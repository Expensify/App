import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, ReportListItemProps, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSearchParams} from '@libs/SearchUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import ExpenseItemHeaderNarrow from './ExpenseItemHeaderNarrow';
import TransactionListItem from './TransactionListItem';
import TransactionListItemRow from './TransactionListItemRow';

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
    const {isLargeScreenWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();

    const listItemPressableStyle = [styles.selectionListPressableItemWrapper, styles.pv3, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive];

    const handleOnButtonPress = () => {
        onSelectRow(item);
    };

    const openReportInRHP = (transactionItem: TransactionListItemType) => {
        const searchParams = getSearchParams();
        const currentQuery = searchParams && `query` in searchParams ? (searchParams?.query as string) : CONST.TAB_SEARCH.ALL;
        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(currentQuery, transactionItem.transactionThreadReportID));
    };

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
            onPress={handleOnButtonPress}
            small
            pressOnEnter
            style={[styles.p0]}
        />
    );

    if (!reportItem?.reportName && reportItem.transactions.length > 1) {
        return null;
    }

    const participantFrom = reportItem.transactions[0].from;
    const participantTo = reportItem.transactions[0].to;

    // These values should come as part of the item via SearchUtils.getSections() but ReportListItem is not yet 100% handled
    // This will be simplified in future once sorting of ReportListItem is done
    const participantFromDisplayName = participantFrom?.name ?? participantFrom?.displayName ?? participantFrom?.login ?? '';
    const participantToDisplayName = participantTo?.name ?? participantTo?.displayName ?? participantTo?.login ?? '';

    if (reportItem.transactions.length === 1) {
        const transactionItem = reportItem.transactions[0];

        return (
            <TransactionListItem
                item={transactionItem as unknown as TItem}
                isFocused={isFocused}
                showTooltip={showTooltip}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                onSelectRow={() => openReportInRHP(transactionItem)}
                onDismissError={onDismissError}
                shouldPreventDefaultFocusOnSelectRow={shouldPreventDefaultFocusOnSelectRow}
                onFocus={onFocus}
                shouldSyncFocus={shouldSyncFocus}
            />
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
            {(hovered?: boolean) => (
                <View style={styles.flex1}>
                    {!isLargeScreenWidth && (
                        <ExpenseItemHeaderNarrow
                            participantFrom={participantFrom}
                            participantFromDisplayName={participantFromDisplayName}
                            participantTo={participantTo}
                            participantToDisplayName={participantToDisplayName}
                            buttonText={translate('common.view')}
                            onButtonPress={handleOnButtonPress}
                        />
                    )}
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                        <View style={[styles.flexRow, styles.flex1, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex2]}>
                                <View style={[styles.flexShrink1]}>
                                    <Text style={[styles.reportListItemTitle]}>{reportItem?.reportName}</Text>
                                    <Text style={[styles.textMicroSupporting]}>{`${reportItem.transactions.length} ${translate('search.groupedExpenses')}`}</Text>
                                </View>
                            </View>
                            <View style={[styles.flexRow, styles.flex1, styles.justifyContentEnd]}>{totalCell}</View>
                        </View>
                        {/** styles.reportListItemActionButtonMargin added here to move the action button by the type column distance */}
                        {isLargeScreenWidth && (
                            <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH_TABLE_COLUMNS.ACTION), styles.reportListItemActionButtonMargin]}>{actionCell}</View>
                        )}
                    </View>
                    <View style={[styles.mt3, styles.reportListItemSeparator]} />
                    {reportItem.transactions.map((transaction) => (
                        <TransactionListItemRow
                            item={transaction}
                            showTooltip={showTooltip}
                            onButtonPress={() => {
                                openReportInRHP(transaction);
                            }}
                            showItemHeaderOnNarrowLayout={false}
                            containerStyle={styles.mt3}
                            isHovered={hovered}
                        />
                    ))}
                </View>
            )}
        </BaseListItem>
    );
}

ReportListItem.displayName = 'ReportListItem';

export default ReportListItem;
