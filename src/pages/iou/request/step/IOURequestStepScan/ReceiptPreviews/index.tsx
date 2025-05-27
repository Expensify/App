import React, {useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FlatList from '@components/FlatList';
import * as Expensicons from '@components/Icon/Expensicons';
import Image from '@components/Image';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Receipt} from '@src/types/onyx/Transaction';

type ReceiptWithTransactionID = Receipt & {transactionID: string};

type ReceiptPreviewsProps = {
    submit: () => void;
    setTabSwipeDisabled?: (isDisabled: boolean) => void;
};

function ReceiptPreviews({submit, setTabSwipeDisabled}: ReceiptPreviewsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const INITIAL_RECEIPTS_AMOUNT = 10;
    const [optimisticTransactionsReceipts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: (items) =>
            Object.values(items ?? {})
                .map((transaction) => (transaction?.receipt ? {...transaction?.receipt, transactionID: transaction.transactionID} : undefined))
                .filter((receipt): receipt is ReceiptWithTransactionID => !!receipt),
        canBeMissing: true,
    });
    const receipts = useMemo(() => {
        if (optimisticTransactionsReceipts && optimisticTransactionsReceipts.length >= INITIAL_RECEIPTS_AMOUNT) {
            return optimisticTransactionsReceipts;
        }
        const receiptsWithPlaceholders: Array<ReceiptWithTransactionID | undefined> = [...(optimisticTransactionsReceipts ?? [])];
        while (receiptsWithPlaceholders.length < 10) {
            receiptsWithPlaceholders.push(undefined);
        }
        return receiptsWithPlaceholders;
    }, [optimisticTransactionsReceipts]);

    const renderItem = ({item}: {item: ReceiptWithTransactionID | undefined}) => {
        if (!item) {
            return <View style={styles.receiptPlaceholder} />;
        }

        return (
            <Image
                source={{uri: item.source}}
                style={[styles.receiptPlaceholder, styles.overflowHidden]}
                loadingIconSize="small"
                loadingIndicatorStyles={styles.bgTransparent}
            />
        );
    };

    return (
        <View style={styles.ph4}>
            <FlatList
                data={receipts}
                horizontal
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItem}
                onTouchStart={() => setTabSwipeDisabled?.(true)}
                onTouchEnd={() => setTabSwipeDisabled?.(false)}
                style={styles.pv2}
                contentContainerStyle={{paddingRight: 52}}
            />
            <Button
                large
                style={styles.submitButtonWithShadow}
                innerStyles={[styles.singleAvatarMedium, styles.bgGreenSuccess]}
                icon={Expensicons.ArrowRight}
                iconFill={theme.white}
                onPress={submit}
            />
        </View>
    );
}

export default ReceiptPreviews;
