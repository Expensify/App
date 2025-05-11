import React, {useMemo} from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import Checkbox from '@components/Checkbox';
import type {TransactionWithOptionalHighlight} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import type {TableColumnSize} from '@components/Search/types';
import DateCell from '@components/SelectionList/Search/DateCell';
import Text from '@components/Text';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useHover from '@hooks/useHover';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getMerchant, getCreated as getTransactionCreated, isPartialMerchant} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import CategoryCell from './DataCells/CategoryCell';
import ChatBubbleCell from './DataCells/ChatBubbleCell';
import MerchantCell from './DataCells/MerchantCell';
import ReceiptCell from './DataCells/ReceiptCell';
import TagCell from './DataCells/TagCell';
import TotalCell from './DataCells/TotalCell';
import TypeCell from './DataCells/TypeCell';
import TransactionItemRowRBR from './TransactionItemRowRBR';

function TransactionItemRow({
    transactionItem,
    shouldUseNarrowLayout,
    isSelected,
    shouldShowTooltip,
    dateColumnSize,
    shouldShowChatBubbleComponent = false,
    onCheckboxPress,
    shouldShowCheckbox = false,
}: {
    transactionItem: TransactionWithOptionalHighlight;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
    dateColumnSize: TableColumnSize;
    shouldShowChatBubbleComponent?: boolean;
    onCheckboxPress: (transactionID: string) => void;
    shouldShowCheckbox: boolean;
}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const hasCategoryOrTag = !!transactionItem.category || !!transactionItem.tag;
    const createdAt = getTransactionCreated(transactionItem);

    const isDateColumnWide = dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: transactionItem.shouldBeHighlighted ?? false,
        borderRadius: variables.componentBorderRadius,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    const {hovered, bind: bindHover} = useHover();
    const bgActiveStyles = useMemo(() => {
        if (isSelected) {
            return styles.activeComponentBG;
        }

        if (hovered) {
            return styles.hoveredComponentBG;
        }
    }, [hovered, isSelected, styles.activeComponentBG, styles.hoveredComponentBG]);

    const merchantName = getMerchant(transactionItem);
    const isMerchantEmpty = isPartialMerchant(merchantName);

    return (
        <View
            style={[styles.flex1]}
            onMouseLeave={bindHover.onMouseLeave}
            onMouseEnter={bindHover.onMouseEnter}
        >
            {shouldUseNarrowLayout ? (
                <Animated.View style={[animatedHighlightStyle]}>
                    <View style={[styles.expenseWidgetRadius, styles.justifyContentEvenly, styles.gap3, bgActiveStyles]}>
                        <View style={[styles.flexRow, styles.mt3, styles.mr3, styles.ml3]}>
                            {shouldShowCheckbox && (
                                <View style={[styles.mr3, styles.justifyContentCenter]}>
                                    <Checkbox
                                        onPress={() => {
                                            onCheckboxPress(transactionItem.transactionID);
                                        }}
                                        accessibilityLabel={CONST.ROLE.CHECKBOX}
                                        isChecked={isSelected}
                                    />
                                </View>
                            )}
                            <View style={[styles.mr3]}>
                                <ReceiptCell
                                    transactionItem={transactionItem}
                                    isSelected={isSelected}
                                />
                            </View>
                            <View style={[styles.flex2, styles.flexColumn, styles.justifyContentEvenly]}>
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.minHeight5, styles.maxHeight5]}>
                                    <DateCell
                                        created={createdAt}
                                        showTooltip={shouldShowTooltip}
                                        isLargeScreenWidth={!shouldUseNarrowLayout}
                                    />
                                    <Text style={[styles.textMicroSupporting]}> • </Text>
                                    <TypeCell
                                        transactionItem={transactionItem}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                    />
                                    {isMerchantEmpty && (
                                        <View style={[styles.mlAuto]}>
                                            <TotalCell
                                                transactionItem={transactionItem}
                                                shouldShowTooltip={shouldShowTooltip}
                                                shouldUseNarrowLayout={shouldUseNarrowLayout}
                                            />
                                        </View>
                                    )}
                                </View>
                                {!isMerchantEmpty && (
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                                        <MerchantCell
                                            transactionItem={transactionItem}
                                            shouldShowTooltip={shouldShowTooltip}
                                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                                        />
                                        <TotalCell
                                            transactionItem={transactionItem}
                                            shouldShowTooltip={shouldShowTooltip}
                                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                        <View style={[styles.flexRow, styles.justifyContentBetween, styles.mh3, styles.mb3]}>
                            <View style={[styles.flexColumn, styles.gap2]}>
                                {hasCategoryOrTag && (
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
                                        <CategoryCell
                                            transactionItem={transactionItem}
                                            shouldShowTooltip={shouldShowTooltip}
                                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                                        />
                                        <TagCell
                                            transactionItem={transactionItem}
                                            shouldShowTooltip={shouldShowTooltip}
                                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                                        />
                                    </View>
                                )}
                                <TransactionItemRowRBR transaction={transactionItem} />
                            </View>
                            {shouldShowChatBubbleComponent && <ChatBubbleCell transaction={transactionItem} />}
                        </View>
                    </View>
                </Animated.View>
            ) : (
                <Animated.View style={[animatedHighlightStyle]}>
                    <View style={[styles.p3, styles.gap2, styles.expenseWidgetRadius, bgActiveStyles]}>
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                            <View style={[styles.mr1]}>
                                <Checkbox
                                    onPress={() => {
                                        onCheckboxPress(transactionItem.transactionID);
                                    }}
                                    accessibilityLabel={CONST.ROLE.CHECKBOX}
                                    isChecked={isSelected}
                                />
                            </View>
                            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.RECEIPT)]}>
                                <ReceiptCell
                                    transactionItem={transactionItem}
                                    isSelected={isSelected}
                                />
                            </View>
                            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)]}>
                                <TypeCell
                                    transactionItem={transactionItem}
                                    shouldShowTooltip={shouldShowTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                            </View>
                            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, isDateColumnWide)]}>
                                <DateCell
                                    created={createdAt}
                                    showTooltip={shouldShowTooltip}
                                    isLargeScreenWidth={!shouldUseNarrowLayout}
                                />
                            </View>
                            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)]}>
                                <MerchantCell
                                    transactionItem={transactionItem}
                                    shouldShowTooltip={shouldShowTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                            </View>
                            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CATEGORY)]}>
                                <CategoryCell
                                    transactionItem={transactionItem}
                                    shouldShowTooltip={shouldShowTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                            </View>
                            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAG)]}>
                                <TagCell
                                    transactionItem={transactionItem}
                                    shouldShowTooltip={shouldShowTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                            </View>
                            <View style={[StyleUtils.getReportTableColumnStyles(CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS)]}>
                                {shouldShowChatBubbleComponent && <ChatBubbleCell transaction={transactionItem} />}
                            </View>
                            <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT)]}>
                                <TotalCell
                                    transactionItem={transactionItem}
                                    shouldShowTooltip={shouldShowTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                            </View>
                        </View>
                        <TransactionItemRowRBR transaction={transactionItem} />
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

TransactionItemRow.displayName = 'TransactionItemRow';

export default TransactionItemRow;
