import React from 'react';
import {View} from 'react-native';
import Hoverable from '@components/Hoverable';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';
import CategoryCell from './DataCells/CategoryCell';
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
}: {
    transactionItem: Transaction;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const backgroundColor = isSelected ? styles.buttonDefaultBG : styles.highlightBG;
    const hasCategoryOrTag = !!transactionItem.category || !!transactionItem.tag;

    return (
        <View style={styles.flex1}>
            {shouldUseNarrowLayout ? (
                <Hoverable>
                    {(hovered) => (
                        <View style={[hovered ? styles.hoveredComponentBG : backgroundColor, styles.expenseWidgetRadius, styles.justifyContentEvenly]}>
                            <View style={[styles.flexRow, styles.mt3, styles.mr3, styles.mb3, styles.ml3]}>
                                <View style={[styles.mr3]}>
                                    <ReceiptCell
                                        transactionItem={transactionItem}
                                        isSelected
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
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.ml3, styles.mt0, hasCategoryOrTag && styles.mb2]}>
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
                            <TransactionItemRowRBR
                                containerStyles={[styles.ml3, styles.mt0, styles.mb2]}
                                transaction={transactionItem}
                            />
                        </View>
                    )}
                </Hoverable>
            ) : (
                <Hoverable>
                    {(hovered) => (
                        <View style={[hovered ? styles.hoveredComponentBG : backgroundColor, styles.p2, styles.expenseWidgetRadius, styles.gap2]}>
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.RECEIPT)]}>
                                    <ReceiptCell
                                        transactionItem={transactionItem}
                                        isSelected
                                    />
                                </View>
                                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)]}>
                                    <TypeCell
                                        transactionItem={transactionItem}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                    />
                                </View>
                                <View style={[StyleUtils.getReportTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE)]}>
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
            )}
        </View>
    );
}

TransactionItemRow.displayName = 'TransactionItemRow';

export default TransactionItemRow;
