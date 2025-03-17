import React from 'react';
import type {ViewStyle} from 'react-native';
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

function TransactionItemRow({
    transactionItem,
    shouldUseNarrowLayout,
    isSelected,
    shouldShowTooltip,
    containerStyles,
}: {
    transactionItem: Transaction;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    shouldShowTooltip: boolean;
    containerStyles?: ViewStyle[];
}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const backgroundColor = isSelected ? styles.buttonDefaultBG : styles.highlightBG;

    return (
        <View style={styles.flex1}>
            {shouldUseNarrowLayout ? (
                <Hoverable>
                    {(hovered) => (
                        <View style={containerStyles ?? [hovered ? styles.hoveredComponentBG : backgroundColor, styles.expenseWidgetRadius, styles.justifyContentEvenly]}>
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
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.ml3, styles.mt0, styles.mb3]}>
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
                        </View>
                    )}
                </Hoverable>
            ) : (
                <Hoverable>
                    {(hovered) => (
                        <View style={containerStyles ?? [hovered ? styles.hoveredComponentBG : backgroundColor, styles.p2, styles.expenseWidgetRadius]}>
                            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3]}>
                                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.RECEIPT)]}>
                                    <ReceiptCell
                                        transactionItem={transactionItem}
                                        isSelected
                                    />
                                </View>
                                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)]}>
                                    <TypeCell
                                        transactionItem={transactionItem}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                    />
                                </View>
                                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.DATE, false)]}>
                                    <DateCell
                                        transactionItem={transactionItem}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                    />
                                </View>
                                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.MERCHANT)]}>
                                    <MerchantCell
                                        transactionItem={transactionItem}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                    />
                                </View>
                                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.CATEGORY)]}>
                                    <CategoryCell
                                        transactionItem={transactionItem}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                    />
                                </View>
                                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TAG)]}>
                                    <TagCell
                                        transactionItem={transactionItem}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                    />
                                </View>
                                <View style={[StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT)]}>
                                    <TotalCell
                                        transactionItem={transactionItem}
                                        shouldShowTooltip={shouldShowTooltip}
                                        shouldUseNarrowLayout={shouldUseNarrowLayout}
                                    />
                                </View>
                            </View>
                        </View>
                    )}
                </Hoverable>
            )}
        </View>
    );
}

TransactionItemRow.displayName = 'TransactionItemRow';

export default TransactionItemRow;
