import React from 'react';
import { View } from 'react-native';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {Transaction} from '@src/types/onyx';
import CategoryCell from './DataCeils/CategoryCell';
import DateCell from './DataCeils/DateCell';
import MerchantCell from './DataCeils/MerchantCell';
import ReceiptCell from './DataCeils/ReceiptCell';
import TagCell from './DataCeils/TagCell';
import TotalCell from './DataCeils/TotalCell';
import TypeCell from './DataCeils/TypeCell';

function TransactionItemComponent({ transactionItem, isLargeScreenWidth }) {
    const styles = useThemeStyles();
    const showTooltip = true;

    const elementStyle = {
        container: {
            flex: 1,
            padding: 10,
            borderRadius: 10,
        },
        row: {
            flex: 1,
            flexDirection: 'row',
        },
        col1: {
            flex: 1,
            margin: 5,
            alignItems: 'center',
            justifyContent: 'center',
        },
        col2: {
            flex: isLargeScreenWidth ? 1 :  3,
            flexDirection: isLargeScreenWidth ? 'row':  'column',
        },
        col3: {
            flex: 2,
            margin: 5,
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        subRow1: {
            flex: 1,
            margin: 5,
            minHeight: 20,
            flexDirection: 'row',
            alignItems: 'center',
        },
        subRow2: {
            flex: 1,
            margin: 5,
            minHeight: 20,
            justifyContent: 'center',
        },
        row2: {
            flex: 1,
            margin: 5,
            minHeight: 20,
            flexDirection: 'row',
            gap: 25,
            alignItems: 'center',
        },
        separator: {
            fontSize: 20,
            marginHorizontal: 8,
            fontStyle: 'bold',
        },
        flex1: { flex: 1 },
        containerLarge: { flexDirection: 'row', alignItems: 'center' },
        rowLarge: { flex: 1, justifyContent: 'space-between' },
        largeCol: { flex: 1, flexDirection: isLargeScreenWidth ? 'row':  'column' },
    };

    const containerStyle = isLargeScreenWidth
        ? [elementStyle.container, elementStyle.containerLarge, { backgroundColor: '#E6E1DA' }]
        : [elementStyle.container, { backgroundColor: '#E6E1DA' }];

    return (
        <View style={styles.flex1}>
            <View style={containerStyle}>
                {isLargeScreenWidth ? (
                    <View style={elementStyle.rowLarge}>
                        <ReceiptCell
                            transactionItem={transactionItem}
                            isLargeScreenWidth={isLargeScreenWidth}
                            showTooltip={showTooltip}
                        />
                        <View style={elementStyle.largeCol}>
                            <DateCell
                                transactionItem={transactionItem}
                                showTooltip={showTooltip}
                                isLargeScreenWidth={isLargeScreenWidth}
                            />
                            <TypeCell
                                transactionItem={transactionItem}
                                showTooltip={showTooltip}
                                isLargeScreenWidth={isLargeScreenWidth}
                            />
                        </View>
                        <MerchantCell
                            transactionItem={transactionItem}
                            showTooltip={showTooltip}
                            isLargeScreenWidth={isLargeScreenWidth}
                        />
                        <TotalCell
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
                    </View>
                ) : (
                    <View>
                        <View style={elementStyle.row}>
                            <View style={elementStyle.col1}>
                                <ReceiptCell
                                    transactionItem={transactionItem}
                                    isLargeScreenWidth={isLargeScreenWidth}
                                    showTooltip={showTooltip}
                                />
                            </View>
                            <View style={elementStyle.col2}>
                                <View style={elementStyle.subRow1}>
                                    <DateCell
                                        transactionItem={transactionItem}
                                        showTooltip={showTooltip}
                                        isLargeScreenWidth={isLargeScreenWidth}
                                    />
                                    <Text style={[elementStyle.separator, styles.textLabelSupporting]}>•</Text>
                                    <TypeCell
                                        transactionItem={transactionItem}
                                        showTooltip={showTooltip}
                                        isLargeScreenWidth={isLargeScreenWidth}
                                    />
                                </View>
                                <View style={elementStyle.subRow2}>
                                    <MerchantCell
                                        transactionItem={transactionItem}
                                        showTooltip={showTooltip}
                                        isLargeScreenWidth={isLargeScreenWidth}
                                    />
                                </View>
                            </View>
                            <View style={elementStyle.col3}>
                                <TotalCell
                                    transactionItem={transactionItem}
                                    showTooltip={showTooltip}
                                    isLargeScreenWidth={isLargeScreenWidth}
                                />
                            </View>
                        </View>
                        <View style={elementStyle.row2}>
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
                )}
            </View>
        </View>
    );
}


TransactionItemComponent.displayName = 'TransactionItemComponent';

export default TransactionItemComponent;
