import React, {useMemo} from 'react';
import {View} from 'react-native';
import FlatList from '@components/FlatList';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Image from '@components/Image';
import {PressableWithFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Receipt} from '@src/types/onyx/Transaction';

type ReceiptWithTransactionID = Receipt & {transactionID: string};

type ReceiptPreviewsProps = {
    submit: () => void;
    setTabSwipeDisabled?: (isDisabled: boolean) => void;
};

function ReceiptPreviews({submit, setTabSwipeDisabled}: ReceiptPreviewsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
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
            <PressableWithFeedback
                role={CONST.ROLE.BUTTON}
                wrapperStyle={{position: 'absolute', right: 0, top: 8}}
                accessibilityLabel={translate('common.submit')}
                onPress={submit}
            >
                <Icon
                    height={72}
                    width={84}
                    src={Expensicons.ArrowRightWithGradient}
                />
            </PressableWithFeedback>
            {/* <Button */}
            {/*     large */}
            {/*     style={{position: 'absolute', right: 16, top: 8}} */}
            {/*     innerStyles={[styles.singleAvatarMedium, styles.bgGreenSuccess]} */}
            {/*     icon={Expensicons.ArrowRight} */}
            {/*     iconFill={theme.white} */}
            {/*     onPress={submit} */}
            {/* /> */}
        </View>
    );
}

export default ReceiptPreviews;
