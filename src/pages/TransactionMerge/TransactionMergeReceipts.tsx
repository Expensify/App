import React from 'react';
import {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RadioButton from '@components/RadioButton';
import ReportActionItemImage from '@components/ReportActionItem/ReportActionItemImage';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

type TransactionMergeReceiptsProps = {
    transactions: Transaction[];
    selectedReceiptID: number | undefined;
    onSelect: (receiptID: number | undefined) => void;
};

function TransactionMergeReceipts({transactions, selectedReceiptID, onSelect}: TransactionMergeReceiptsProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.justifyContentBetween]}>
            {transactions.map((transaction, index) => {
                const receiptURIs = getThumbnailAndImageURIs(transaction);
                return (
                    <View
                        key={transaction.transactionID}
                        style={[styles.flexColumn, styles.alignItemsCenter, styles.w100, styles.mb2]}
                    >
                        <PressableWithFeedback
                            onPress={() => onSelect(transaction.receipt?.receiptID)}
                            wrapperStyle={[styles.w100]}
                            style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.mergeTransactionReceiptThumbnail]}
                            accessibilityRole={CONST.ROLE.RADIO}
                            accessibilityLabel={`Select receipt for transaction ${transaction.transactionID}`}
                        >
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.w100, styles.mb5]}>
                                <Text style={[styles.headerText]}>Receipt {index + 1}</Text>
                                <RadioButton
                                    isChecked={selectedReceiptID === transaction.receipt?.receiptID}
                                    onPress={() => onSelect(transaction.receipt?.receiptID)}
                                    accessibilityLabel={`Select receipt for transaction ${transaction.transactionID}`}
                                />
                            </View>
                            <View style={[styles.mergeTransactionReceiptImage]}>
                                <ReportActionItemImage
                                    thumbnail={receiptURIs.thumbnail}
                                    fileExtension={receiptURIs.fileExtension}
                                    isThumbnail={receiptURIs.isThumbnail}
                                    image={receiptURIs.image}
                                    isLocalFile={receiptURIs.isLocalFile}
                                    filename={receiptURIs.filename}
                                    transaction={transaction}
                                    readonly
                                />
                            </View>
                        </PressableWithFeedback>
                    </View>
                );
            })}
        </View>
    );
}

export default TransactionMergeReceipts;
