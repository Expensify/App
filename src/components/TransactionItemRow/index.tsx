import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';
import Checkbox from '@components/Checkbox';
import Hoverable from '@components/Hoverable';
import type {TransactionWithOptionalHighlight} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';
import type {TableColumnSize} from '@components/Search/types';
import Text from '@components/Text';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import CategoryCell from './DataCells/CategoryCell';
import ChatBubbleCell from './DataCells/ChatBubbleCell';
import DateCell from './DataCells/DateCell';
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
}: {
    transactionItem: TransactionWithOptionalHighlight;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
    dateColumnSize: TableColumnSize;
    shouldShowChatBubbleComponent?: boolean;
    onCheckboxPress: (transactionID: string) => void;
}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();

    const hasCategoryOrTag = !!transactionItem.category || !!transactionItem.tag;

    const isDateColumnWide = dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE;

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: transactionItem.shouldBeHighlighted ?? false,
        borderRadius: variables.componentBorderRadius,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    const {selectionMode} = useMobileSelectionMode();

    return (
        <View style={[styles.flex1]}>
            {shouldUseNarrowLayout ? (
                <Animated.View style={[animatedHighlightStyle]}>
                    <Hoverable>
                        {(hovered) => (
                            <View style={[styles.expenseWidgetRadius, styles.justifyContentEvenly, styles.gap3, hovered && styles.hoveredComponentBG, isSelected && styles.buttonDefaultBG]}>
                                <View style={[styles.flexRow, styles.mt3, styles.mr3, styles.ml3]}>
                                    {!!selectionMode?.isEnabled && (
                                        <View style={[styles.mr2, styles.justifyContentCenter]}>
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
                                                transactionItem={transactionItem}
                                                shouldShowTooltip={shouldShowTooltip}
                                                shouldUseNarrowLayout={shouldUseNarrowLayout}
                                            />
                                            <Text style={[styles.textMicroSupporting]}> • </Text>
                                            <TypeCell
                                                transactionItem={transactionItem}
                                                shouldShowTooltip={shouldShowTooltip}
                                                shouldUseNarrowLayout={shouldUseNarrowLayout}
                                            />
                                        </View>
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
                        )}
                    </Hoverable>
                </Animated.View>
            ) : (
                <Animated.View style={[animatedHighlightStyle]}>
                    <Hoverable>
                        {(hovered) => (
                            <View style={[styles.p3, styles.gap2, styles.expenseWidgetRadius, hovered && styles.hoveredComponentBG, isSelected && styles.buttonDefaultBG]}>
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
                                            transactionItem={transactionItem}
                                            shouldShowTooltip={shouldShowTooltip}
                                            shouldUseNarrowLayout={shouldUseNarrowLayout}
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
                        )}
                    </Hoverable>
                </Animated.View>
            )}
        </View>
    );
}

TransactionItemRow.displayName = 'TransactionItemRow';

export default TransactionItemRow;
