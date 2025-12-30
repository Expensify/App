import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RadioButton from '@components/RadioButton';
import ReportActionItemImage from '@components/ReportActionItem/ReportActionItemImage';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportIDForExpense, getTransactionThreadReportID} from '@libs/MergeTransactionUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getThumbnailAndImageURIs} from '@libs/ReceiptUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';
import type {Receipt} from '@src/types/onyx/Transaction';

type TransactionMergeReceiptsProps = {
    transactions: Transaction[];
    selectedReceiptID: number | undefined;
    onSelect: (receipt: Receipt | undefined) => void;
};

function TransactionMergeReceipts({transactions, selectedReceiptID, onSelect}: TransactionMergeReceiptsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Zoom']);

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.justifyContentBetween]}>
            {transactions.map((transaction, index) => {
                const receiptURIs = getThumbnailAndImageURIs(transaction);
                const isSelected = selectedReceiptID === transaction.receipt?.receiptID;
                return (
                    <View
                        key={transaction.transactionID}
                        style={[styles.flexColumn, styles.alignItemsCenter, styles.w100, styles.mb2]}
                    >
                        <PressableWithFeedback
                            onPress={() => onSelect(transaction.receipt)}
                            wrapperStyle={styles.w100}
                            hoverStyle={styles.hoveredComponentBG}
                            style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.mergeTransactionReceiptThumbnail]}
                            accessibilityRole={CONST.ROLE.RADIO}
                            accessibilityLabel={`${translate('transactionMerge.receiptPage.pageTitle')} ${transaction.transactionID}`}
                        >
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.w100, styles.mb5]}>
                                <Text style={[styles.headerText]}>
                                    {translate('common.receipt')} {index + 1}
                                </Text>
                                <RadioButton
                                    isChecked={isSelected}
                                    onPress={() => onSelect(transaction.receipt)}
                                    accessibilityLabel={`${translate('transactionMerge.receiptPage.pageTitle')} ${transaction.transactionID}`}
                                    shouldUseNewStyle
                                />
                            </View>
                            <View style={[styles.mergeTransactionReceiptImage, styles.pRelative]}>
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
                                <View style={[styles.pAbsolute, styles.b2, styles.r2]}>
                                    <Button
                                        innerStyles={[styles.arrowIcon]}
                                        icon={expensifyIcons.Zoom}
                                        onPress={() => {
                                            Navigation.navigate(
                                                ROUTES.TRANSACTION_RECEIPT.getRoute(
                                                    getTransactionThreadReportID(transaction) ?? transaction.reportID ?? getReportIDForExpense(transaction),
                                                    transaction.transactionID,
                                                    true,
                                                ),
                                            );
                                        }}
                                    />
                                </View>
                            </View>
                        </PressableWithFeedback>
                    </View>
                );
            })}
        </View>
    );
}

export default TransactionMergeReceipts;
