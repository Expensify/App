import React, {useCallback, useMemo, useRef} from 'react';
import {ActivityIndicator, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import AnimatedCollapsible from '@components/AnimatedCollapsible';
import type {AnimatedCollapsibleHandle} from '@components/AnimatedCollapsible';
import Button from '@components/Button';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import type {SearchGroupBy} from '@components/Search/types';
import type {
    ListItem,
    TransactionCardGroupListItemType,
    TransactionGroupListItemProps,
    TransactionGroupListItemType,
    TransactionListItemType,
    TransactionMemberGroupListItemType,
    TransactionReportGroupListItemType,
} from '@components/SelectionList/types';
import Text from '@components/Text';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {search} from '@libs/actions/Search';
import {getReportIDForTransaction} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSections} from '@libs/SearchUIUtils';
import variables from '@styles/variables';
import {setActiveTransactionThreadIDs} from '@userActions/TransactionThreadNavigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import CardListItemHeader from './CardListItemHeader';
import MemberListItemHeader from './MemberListItemHeader';
import ReportListItemHeader from './ReportListItemHeader';

function TransactionGroupListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onCheckboxPress,
    onSelectRow,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    groupBy,
    accountID,
    isOffline,
}: TransactionGroupListItemProps<TItem>) {
    const groupItem = item as unknown as TransactionGroupListItemType;
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [transactionsSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${groupItem.transactionsQueryJSON?.hash}`, {canBeMissing: true});
    const transactionsSnapshotMetadata = useMemo(() => {
        return transactionsSnapshot?.search;
    }, [transactionsSnapshot]);
    const isGroupByReports = groupBy === CONST.SEARCH.GROUP_BY.REPORTS;
    const transactions = useMemo(() => {
        if (isGroupByReports) {
            return groupItem.transactions;
        }
        if (!transactionsSnapshot?.data) {
            return [];
        }
        return getSections(CONST.SEARCH.DATA_TYPES.EXPENSE, transactionsSnapshot?.data, transactionsSnapshot?.search, accountID, formatPhoneNumber) as TransactionListItemType[];
    }, [isGroupByReports, transactionsSnapshot?.data, transactionsSnapshot?.search, accountID, formatPhoneNumber, groupItem.transactions]);
    const collapsibleRef = useRef<AnimatedCollapsibleHandle>(null);
    const prevTransactionsLength = usePrevious(transactions.length);
    const shouldForceExpand = prevTransactionsLength === 0 && transactions.length > 0 && !isGroupByReports;

    const isEmpty = transactions.length === 0;
    // Currently only the transaction report groups have transactions where the empty view makes sense
    const shouldDisplayEmptyView = isEmpty && isGroupByReports;
    const isDisabledOrEmpty = isEmpty || isDisabled;
    const shouldDisplayShowMoreButton = !isGroupByReports && !!transactionsSnapshotMetadata?.hasMoreResults;
    const shouldDisplayLoadingIndicator = !isGroupByReports && !!transactionsSnapshotMetadata?.isLoading;
    const {isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();

    const {amountColumnSize, dateColumnSize, taxAmountColumnSize} = useMemo(() => {
        const isAmountColumnWide = transactions.some((transaction) => transaction.isAmountColumnWide);
        const isTaxAmountColumnWide = transactions.some((transaction) => transaction.isTaxAmountColumnWide);
        const shouldShowYearForSomeTransaction = transactions.some((transaction) => transaction.shouldShowYear);
        return {
            amountColumnSize: isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            taxAmountColumnSize: isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            dateColumnSize: shouldShowYearForSomeTransaction ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        };
    }, [transactions]);

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    const pressableStyle = [styles.transactionGroupListItemStyle, item.isSelected && styles.activeComponentBG];

    const openReportInRHP = (transactionItem: TransactionListItemType) => {
        const backTo = Navigation.getActiveRoute();

        const reportID = getReportIDForTransaction(transactionItem);
        const siblingTransactionThreadIDs = transactions.map(getReportIDForTransaction);

        // When opening the transaction thread in RHP we need to find every other ID for the rest of transactions
        // to display prev/next arrows in RHP for navigation
        setActiveTransactionThreadIDs(siblingTransactionThreadIDs).then(() => {
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}));
        });
    };

    const sampleTransaction = transactions.at(0);
    const {COLUMNS} = CONST.REPORT.TRANSACTION_LIST;

    const columns = [
        COLUMNS.RECEIPT,
        COLUMNS.TYPE,
        COLUMNS.DATE,
        COLUMNS.MERCHANT,
        COLUMNS.FROM,
        COLUMNS.TO,
        ...(sampleTransaction?.shouldShowCategory ? [COLUMNS.CATEGORY] : []),
        ...(sampleTransaction?.shouldShowTag ? [COLUMNS.TAG] : []),
        ...(sampleTransaction?.shouldShowTax ? [COLUMNS.TAX] : []),
        COLUMNS.TOTAL_AMOUNT,
        COLUMNS.ACTION,
    ] satisfies Array<ValueOf<typeof COLUMNS>>;

    const getHeader = useMemo(() => {
        const headers: Record<SearchGroupBy, React.JSX.Element> = {
            [CONST.SEARCH.GROUP_BY.REPORTS]: (
                <ReportListItemHeader
                    report={groupItem as TransactionReportGroupListItemType}
                    onSelectRow={onSelectRow}
                    onCheckboxPress={onCheckboxPress}
                    isDisabled={isDisabledOrEmpty}
                    isFocused={isFocused}
                    canSelectMultiple={canSelectMultiple}
                />
            ),
            [CONST.SEARCH.GROUP_BY.FROM]: (
                <MemberListItemHeader
                    member={groupItem as TransactionMemberGroupListItemType}
                    onSelectRow={onSelectRow}
                    onCheckboxPress={onCheckboxPress}
                    isDisabled={isDisabledOrEmpty}
                    canSelectMultiple={canSelectMultiple}
                />
            ),
            [CONST.SEARCH.GROUP_BY.CARD]: (
                <CardListItemHeader
                    card={groupItem as TransactionCardGroupListItemType}
                    onSelectRow={onSelectRow}
                    onCheckboxPress={onCheckboxPress}
                    isDisabled={isDisabledOrEmpty}
                    isFocused={isFocused}
                    canSelectMultiple={canSelectMultiple}
                />
            ),
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: (
                // Will be implemented as part of https://github.com/Expensify/App/pull/66078
                <View />
            ),
        };

        if (!groupBy) {
            return null;
        }

        return headers[groupBy];
    }, [groupItem, onSelectRow, onCheckboxPress, isDisabledOrEmpty, isFocused, canSelectMultiple, groupBy]);

    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);

    const onPress = useCallback(() => {
        if (groupBy === CONST.SEARCH.GROUP_BY.REPORTS || transactions.length === 0) {
            onSelectRow(item);
            return;
        }
        collapsibleRef?.current?.handleToggle();
    }, [groupBy, item, onSelectRow, transactions.length]);

    const onLongPress = useCallback(() => {
        onLongPressRow?.(item);
    }, [item, onLongPressRow]);

    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onLongPress={onLongPress}
                onPress={onPress}
                disabled={isDisabled && !item.isSelected}
                accessibilityLabel={item.text ?? ''}
                role={getButtonRole(true)}
                isNested
                hoverStyle={[!item.isDisabled && styles.hoveredComponentBG, item.isSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                onMouseDown={(e) => e.preventDefault()}
                id={item.keyForList ?? ''}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                ]}
                onFocus={onFocus}
                wrapperStyle={[styles.mb2, styles.mh5, animatedHighlightStyle, styles.userSelectNone]}
            >
                <View style={styles.flex1}>
                    <AnimatedCollapsible
                        ref={collapsibleRef}
                        header={getHeader}
                        onPress={isEmpty && !shouldDisplayEmptyView ? onPress : undefined}
                        shouldForceExpand={shouldForceExpand}
                    >
                        {shouldDisplayEmptyView ? (
                            <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.mnh13]}>
                                <Text
                                    style={[styles.textLabelSupporting]}
                                    numberOfLines={1}
                                >
                                    {translate('search.moneyRequestReport.emptyStateTitle')}
                                </Text>
                            </View>
                        ) : (
                            <>
                                {transactions.map((transaction) => (
                                    <TransactionItemRow
                                        key={transaction.transactionID}
                                        report={transaction.report}
                                        transactionItem={transaction}
                                        isSelected={!!transaction.isSelected}
                                        dateColumnSize={dateColumnSize}
                                        amountColumnSize={amountColumnSize}
                                        taxAmountColumnSize={taxAmountColumnSize}
                                        shouldShowTooltip={showTooltip}
                                        shouldUseNarrowLayout={!isLargeScreenWidth}
                                        shouldShowCheckbox={!!canSelectMultiple}
                                        onCheckboxPress={() => onCheckboxPress?.(transaction as unknown as TItem)}
                                        columns={columns}
                                        onButtonPress={() => {
                                            openReportInRHP(transaction);
                                        }}
                                        style={[styles.noBorderRadius, shouldUseNarrowLayout ? [styles.p3, styles.pt2] : [styles.ph3, styles.pv1Half]]}
                                        isReportItemChild
                                        isInSingleTransactionReport={transactions.length === 1}
                                    />
                                ))}
                                {shouldDisplayShowMoreButton && !shouldDisplayLoadingIndicator && (
                                    <View style={[styles.w100, styles.flexRow, styles.pl10]}>
                                        <Button
                                            text={translate('common.showMore')}
                                            onPress={() => {
                                                if (!!isOffline || !groupItem.transactionsQueryJSON) {
                                                    return;
                                                }
                                                search({
                                                    queryJSON: groupItem.transactionsQueryJSON,
                                                    searchKey: undefined,
                                                    offset: (transactionsSnapshotMetadata?.offset ?? 0) + CONST.SEARCH.RESULTS_PAGE_SIZE,
                                                    shouldCalculateTotals: true,
                                                });
                                            }}
                                            link
                                            shouldUseDefaultHover={false}
                                            isNested
                                            medium
                                            innerStyles={[styles.ph3]}
                                            textStyles={[styles.fontSizeNormal]}
                                        />
                                    </View>
                                )}
                                {shouldDisplayLoadingIndicator && (
                                    <View style={[styles.pl10, styles.pt3]}>
                                        <ActivityIndicator
                                            color={theme.spinner}
                                            size={25}
                                            style={[styles.pl3, styles.alignItemsStart]}
                                        />
                                    </View>
                                )}
                            </>
                        )}
                    </AnimatedCollapsible>
                </View>
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

TransactionGroupListItem.displayName = 'TransactionGroupListItem';

export default TransactionGroupListItem;
