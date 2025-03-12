import React from 'react';
import {View} from 'react-native';
import Hoverable from '@components/Hoverable';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useHover from '@hooks/useHover';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';
import CategoryCell from './DataCeils/CategoryCell';
import DateCell from './DataCeils/DateCell';
import MerchantCell from './DataCeils/MerchantCell';
import ReceiptCell from './DataCeils/ReceiptCell';
import TagCell from './DataCeils/TagCell';
import TotalCell from './DataCeils/TotalCell';
import TypeCell from './DataCeils/TypeCell';

function TransactionItemComponent({
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
                                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.minHeight5, styles.maxHeight5]}>
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
                                        {/* </View> */}
                                    </View>
                                </View>
                            </View>
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.minHeight3, styles.ml3, styles.mt0, styles.mb3]}>
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
                        <View style={[hovered ? styles.hoveredComponentBG : backgroundColor, styles.p2, styles.expenseWidgetRadius]}>
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

TransactionItemComponent.displayName = 'TransactionItemComponent';

export default TransactionItemComponent;
