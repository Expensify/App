import React from 'react';
import {View} from 'react-native';
import DateCell from '@components/SelectionListWithSections/Search/DateCell';
import Text from '@components/Text';
import CategoryCell from '@components/TransactionItemRow/DataCells/CategoryCell';
import MerchantOrDescriptionCell from '@components/TransactionItemRow/DataCells/MerchantCell';
import ReceiptCell from '@components/TransactionItemRow/DataCells/ReceiptCell';
import TagCell from '@components/TransactionItemRow/DataCells/TagCell';
import TotalCell from '@components/TransactionItemRow/DataCells/TotalCell';
import TypeCell from '@components/TransactionItemRow/DataCells/TypeCell';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCreated, getDescription, getMerchant} from '@libs/TransactionUtils';
import type {Transaction} from '@src/types/onyx';

type RulePreviewTransactionProps = {
    transaction: Transaction;
};

function RulePreviewTransaction({transaction}: RulePreviewTransactionProps) {
    const styles = useThemeStyles();

    const merchant = getMerchant(transaction);
    const createdAt = getCreated(transaction);
    const hasCategoryOrTag = !!transaction.category || !!transaction.tag;
    const merchantOrDescription = merchant ?? getDescription(transaction);

    return (
        <View style={[styles.expenseWidgetRadius, styles.justifyContentEvenly, styles.overflowHidden, styles.highlightBG, styles.p3, styles.mb2]}>
            <View style={[styles.flexRow]}>
                <ReceiptCell
                    transactionItem={transaction}
                    style={styles.mr3}
                    isSelected={false}
                />
                <View style={[styles.flex2, styles.flexColumn, styles.justifyContentEvenly]}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.minHeight5, styles.maxHeight5]}>
                        <DateCell
                            showTooltip
                            isLargeScreenWidth={false}
                            date={createdAt}
                        />
                        <Text style={[styles.textMicroSupporting]}> • </Text>
                        <TypeCell
                            shouldShowTooltip
                            shouldUseNarrowLayout
                            transactionItem={transaction}
                        />
                        {!merchantOrDescription && (
                            <View style={[styles.mlAuto]}>
                                <TotalCell
                                    shouldShowTooltip
                                    shouldUseNarrowLayout
                                    transactionItem={transaction}
                                />
                            </View>
                        )}
                    </View>
                    {!!merchantOrDescription && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.gap2]}>
                            <MerchantOrDescriptionCell
                                shouldShowTooltip
                                shouldUseNarrowLayout
                                merchantOrDescription={merchantOrDescription}
                                isDescription={!merchant}
                            />
                            <TotalCell
                                shouldShowTooltip
                                shouldUseNarrowLayout
                                transactionItem={transaction}
                            />
                        </View>
                    )}
                </View>
            </View>
            <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsStart]}>
                <View style={[styles.flexColumn, styles.flex1]}>
                    {hasCategoryOrTag && (
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mt2, styles.minHeight4]}>
                            <CategoryCell
                                shouldShowTooltip
                                shouldUseNarrowLayout
                                transactionItem={transaction}
                            />
                            <TagCell
                                shouldShowTooltip
                                shouldUseNarrowLayout
                                transactionItem={transaction}
                            />
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
export default RulePreviewTransaction;
