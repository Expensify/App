import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type Transaction from '@src/types/onyx/Transaction';
import variables from '@styles/variables';
import CategoryCell from './DataCeils/CategoryCell';
import DateCell from './DataCeils/DateCell';
import MerchantCell from './DataCeils/MerchantCell';
import ReceiptCell from './DataCeils/ReceiptCell';
import TagCell from './DataCeils/TagCell';
import TotalCell from './DataCeils/TotalCell';
import TypeCell from './DataCeils/TypeCell';

function TransactionItemComponent({transactionItem, isLargeScreenWidth, isSelected}: {transactionItem: Transaction; isLargeScreenWidth: boolean; isSelected: boolean}) {
    const styles = useThemeStyles();
    const showTooltip = true;
    const StyleUtils = useStyleUtils();
    const theme = useTheme();
    const backgroundColor = isSelected ? StyleUtils.getBackgroundColorStyle(theme.buttonHoveredBG) : styles.buttonDefaultBG;

    return (
        <View style={styles.flex1}>
            {!isLargeScreenWidth ? (
                <View style={[backgroundColor, styles.expenseWidgetRadius, styles.expenseWidgetMargin]}>
                    <View style={[styles.flexRow]}>
                        <View style={[]}>
                            <ReceiptCell
                                transactionItem={transactionItem}
                                isSelected={isSelected}
                            />
                        </View>
                        <View style={[styles.flex2, styles.flexColumn,styles.justifyContentEvenly]}>
                            <View style={[styles.flexRow, styles.alignItemsCenter, {maxHeight:variables.fontSizeLabel}]}>
                                <DateCell
                                    transactionItem={transactionItem}
                                    showTooltip={showTooltip}
                                    isLargeScreenWidth={isLargeScreenWidth}
                                />
                                <Text style={[styles.expenseWidgetSeparator]}>•</Text>
                                <TypeCell
                                    transactionItem={transactionItem}
                                    showTooltip={showTooltip}
                                    isLargeScreenWidth={isLargeScreenWidth}
                                />
                            </View>
                            <View style={[styles.flex1,{maxHeight:variables.fontSizeLarge}]}>
                                <MerchantCell
                                    transactionItem={transactionItem}
                                    showTooltip={showTooltip}
                                    isLargeScreenWidth={isLargeScreenWidth}
                                />
                            </View>
                        </View>
                        <View style={[styles.flex2, styles.alignItemsCenter, styles.justifyContentEnd]}>
                            <TotalCell
                                transactionItem={transactionItem}
                                showTooltip={showTooltip}
                                isLargeScreenWidth={isLargeScreenWidth}
                            />
                        </View>
                    </View>
                    <View style={[ styles.flexRow, styles.alignItemsCenter, styles.gap6,styles.minHeight3,styles.ml1]}>
                        <CategoryCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                        <TagCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
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
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                        <DateCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />

                        <MerchantCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                        <CategoryCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                        <TagCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                        <TotalCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

TransactionItemComponent.displayName = 'TransactionItemComponent';

export default TransactionItemComponent;
