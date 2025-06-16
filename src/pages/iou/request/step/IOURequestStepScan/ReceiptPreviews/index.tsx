import React, {useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {FlatList as FlatListType} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Button from '@components/Button';
import FlatList from '@components/FlatList';
import * as Expensicons from '@components/Icon/Expensicons';
import Image from '@components/Image';
import {PressableWithFeedback} from '@components/Pressable';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Receipt} from '@src/types/onyx/Transaction';
import SubmitButtonShadow from './SubmitButtonShadow';

type ReceiptWithTransactionID = Receipt & {transactionID: string};

type ReceiptPreviewsProps = {
    /** Submit method */
    submit: (files: ReceiptFile[]) => void;

    /** If the receipts preview should be shown */
    isMultiScanEnabled: boolean;

    /** Method to disable swipe between tabs */
    setTabSwipeDisabled?: (isDisabled: boolean) => void;
};

// TODO: remove the lint disable when submit method will be used in the code below
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ReceiptPreviews({submit, setTabSwipeDisabled, isMultiScanEnabled}: ReceiptPreviewsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const isPreviewsVisible = useSharedValue(false);
    const previewsHeight = styles.receiptPlaceholder.height + styles.pv2.paddingVertical * 2;
    const previewItemWidth = styles.receiptPlaceholder.width + styles.receiptPlaceholder.marginRight;
    const initialReceiptsAmount = useMemo(
        () => (windowWidth - styles.ph4.paddingHorizontal * 2 - styles.singleAvatarMedium.width) / previewItemWidth,
        [windowWidth, styles, previewItemWidth],
    );
    const [optimisticTransactionsReceipts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: (items) =>
            Object.values(items ?? {})
                .map((transaction) => (transaction?.receipt ? {...transaction?.receipt, transactionID: transaction.transactionID} : undefined))
                .filter((receipt): receipt is ReceiptWithTransactionID => !!receipt),
        canBeMissing: true,
    });
    const receipts = useMemo(() => {
        if (optimisticTransactionsReceipts && optimisticTransactionsReceipts.length >= initialReceiptsAmount) {
            return optimisticTransactionsReceipts;
        }
        const receiptsWithPlaceholders: Array<ReceiptWithTransactionID | undefined> = [...(optimisticTransactionsReceipts ?? [])];
        while (receiptsWithPlaceholders.length < initialReceiptsAmount) {
            receiptsWithPlaceholders.push(undefined);
        }
        return receiptsWithPlaceholders;
    }, [initialReceiptsAmount, optimisticTransactionsReceipts]);
    const isScrollEnabled = optimisticTransactionsReceipts ? optimisticTransactionsReceipts.length >= receipts.length : false;
    const flatListRef = useRef<FlatListType<ReceiptWithTransactionID | undefined>>(null);
    const receiptsPhotosLength = optimisticTransactionsReceipts?.length ?? 0;
    const previousReceiptsPhotosLength = usePrevious(receiptsPhotosLength);

    useEffect(() => {
        if (isMultiScanEnabled) {
            isPreviewsVisible.set(true);
        } else {
            isPreviewsVisible.set(false);
        }
    }, [isMultiScanEnabled, isPreviewsVisible]);

    useEffect(() => {
        const shouldScrollToReceipt = receiptsPhotosLength && receiptsPhotosLength > previousReceiptsPhotosLength && receiptsPhotosLength > Math.floor(initialReceiptsAmount);
        if (!shouldScrollToReceipt) {
            return;
        }
        flatListRef.current?.scrollToIndex({index: receiptsPhotosLength - 1});
    }, [receiptsPhotosLength, previousReceiptsPhotosLength, initialReceiptsAmount]);

    const renderItem = ({item}: {item: ReceiptWithTransactionID | undefined}) => {
        if (!item) {
            return <View style={styles.receiptPlaceholder} />;
        }

        return (
            <PressableWithFeedback
                accessible
                accessibilityLabel={translate('common.receipt')}
                accessibilityRole={CONST.ROLE.BUTTON}
                // TODO: open ReceiptViewModal when implemented https://github.com/Expensify/App/issues/61182
                onPress={() => {}}
            >
                <Image
                    source={{uri: item.source}}
                    style={[styles.receiptPlaceholder, styles.overflowHidden]}
                    loadingIconSize="small"
                    loadingIndicatorStyles={styles.bgTransparent}
                />
            </PressableWithFeedback>
        );
    };

    const slideInStyle = useAnimatedStyle(() => {
        return {
            height: withTiming(isPreviewsVisible.get() ? previewsHeight : 0, {
                duration: 300,
            }),
        };
    });

    if (!isMultiScanEnabled) {
        return;
    }

    return (
        <Animated.View style={slideInStyle}>
            <View style={styles.pr4}>
                <FlatList
                    ref={flatListRef}
                    data={receipts}
                    horizontal
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={renderItem}
                    getItemLayout={(data, index) => ({length: previewItemWidth, offset: previewItemWidth * index, index})}
                    onTouchStart={() => setTabSwipeDisabled?.(true)}
                    onTouchEnd={() => setTabSwipeDisabled?.(false)}
                    style={styles.pv2}
                    scrollEnabled={isScrollEnabled}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[{paddingRight: styles.singleAvatarMedium.width}, styles.pl4]}
                />
                <SubmitButtonShadow>
                    <Button
                        large
                        isDisabled={!optimisticTransactionsReceipts?.length}
                        innerStyles={[styles.singleAvatarMedium, styles.bgGreenSuccess]}
                        icon={Expensicons.ArrowRight}
                        iconFill={theme.white}
                        onPress={() => {
                            // TODO: uncomment the submit call when necessary updates for the confirmation page and bulk expense creation are implemented
                            // https://github.com/Expensify/App/issues/61183
                            // https://github.com/Expensify/App/issues/61184
                            // submit(optimisticTransactionsReceipts ?? []);
                        }}
                    />
                </SubmitButtonShadow>
            </View>
        </Animated.View>
    );
}

export default ReceiptPreviews;
