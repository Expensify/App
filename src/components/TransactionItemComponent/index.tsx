import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
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
    showTooltip,
}: {
    transactionItem: Transaction;
    shouldUseNarrowLayout: boolean;
    isSelected: boolean;
    showTooltip: boolean;
}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const backgroundColor = isSelected ? StyleUtils.getBackgroundColorStyle(theme.buttonHoveredBG) : styles.buttonDefaultBG;

    return (
        <View style={styles.flex1}>
            {shouldUseNarrowLayout ? (
                <View style={[backgroundColor, styles.expenseWidgetRadius, styles.justifyContentEvenly]}>
                    <View style={[styles.flexRow, styles.mt3, styles.mr3, styles.mb3, styles.ml3]}>
                        <View style={[]}>
                            <ReceiptCell
                                transactionItem={transactionItem}
                                isSelected={isSelected}
                            />
                        </View>
                        <View style={[styles.flex2, styles.flexColumn, styles.justifyContentEvenly]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, {maxHeight: variables.fontSizeLabel}]}>
                                <DateCell
                                    transactionItem={transactionItem}
                                    showTooltip={showTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                                <Text style={[styles.expenseWidgetSeparator]}>•</Text>
                                <TypeCell
                                    transactionItem={transactionItem}
                                    showTooltip={showTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                            </View>
                            <View style={[styles.flex1, {maxHeight: variables.fontSizeLarge}]}>
                                <MerchantCell
                                    transactionItem={transactionItem}
                                    showTooltip={showTooltip}
                                    shouldUseNarrowLayout={shouldUseNarrowLayout}
                                />
                            </View>
                        </View>
                        <View style={[styles.flex2, styles.alignItemsEnd, styles.justifyContentEnd]}>
                            <TotalCell
                                transactionItem={transactionItem}
                                showTooltip={showTooltip}
                                shouldUseNarrowLayout={shouldUseNarrowLayout}
                            />
                        </View>
                    </View>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.minHeight3, styles.ml4half, styles.mt0, styles.mb3]}>
                        <CategoryCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />
                        <TagCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />
                    </View>
                </View>
            ) : (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.flex1, backgroundColor, styles.p6, styles.expenseWidgetRadius]}>
                    <View style={[styles.justifyContentBetween, styles.flex1, styles.flexRow, styles.flex1, styles.alignItemsCenter]}>
                        <ReceiptCell
                            transactionItem={transactionItem}
                            isSelected={isSelected}
                        />
                        <TypeCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />
                        <DateCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />

                        <MerchantCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />
                        <CategoryCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />
                        <TagCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />
                        <TotalCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            shouldUseNarrowLayout={shouldUseNarrowLayout}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

TransactionItemComponent.displayName = 'TransactionItemComponent';

export default TransactionItemComponent;
