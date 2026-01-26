import {transactionDraftReceiptsSelector} from '@selectors/TransactionDraft';
import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';
import type {FlatList as FlatListType} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Button from '@components/Button';
import FlatList from '@components/FlatList';
import Image from '@components/Image';
import {PressableWithFeedback} from '@components/Pressable';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Receipt} from '@src/types/onyx/Transaction';
import SubmitButtonShadow from './SubmitButtonShadow';

type ReceiptWithTransactionID = Receipt & {transactionID: string};

type ReceiptPreviewsProps = {
    /** Submit method */
    submit: () => void;

    /** If the receipts preview should be shown */
    isMultiScanEnabled: boolean;
};

function ReceiptPreviews({submit, isMultiScanEnabled}: ReceiptPreviewsProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {windowWidth} = useWindowDimensions();
    const isPreviewsVisible = useSharedValue(false);
    const previewsHeight = styles.receiptPlaceholder.height + styles.pv2.paddingVertical * 2;
    const previewItemWidth = styles.receiptPlaceholder.width + styles.receiptPlaceholder.marginRight;
    const initialReceiptsAmount = (windowWidth - styles.ph4.paddingHorizontal * 2 - styles.singleAvatarMedium.width) / previewItemWidth;
    const [optimisticTransactionsReceipts] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, {
        selector: transactionDraftReceiptsSelector,
        canBeMissing: true,
    });
    const receipts = (() => {
        if (optimisticTransactionsReceipts && optimisticTransactionsReceipts.length >= initialReceiptsAmount) {
            return optimisticTransactionsReceipts;
        }
        const receiptsWithPlaceholders: Array<ReceiptWithTransactionID | undefined> = [...(optimisticTransactionsReceipts ?? [])];
        while (receiptsWithPlaceholders.length < initialReceiptsAmount) {
            receiptsWithPlaceholders.push(undefined);
        }
        return receiptsWithPlaceholders;
    })();
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
        const hasRemovedReceipt = receiptsPhotosLength < previousReceiptsPhotosLength;

        if (hasRemovedReceipt) {
            flatListRef.current?.scrollToOffset({offset: 0, animated: true});
        }
    }, [receiptsPhotosLength, previousReceiptsPhotosLength]);

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
                onPress={() => Navigation.navigate(ROUTES.MONEY_REQUEST_RECEIPT_VIEW.getRoute(item.transactionID, Navigation.getActiveRoute()))}
            >
                <Image
                    source={typeof item.source === 'string' ? {uri: item.source} : item.source}
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
                        icon={icons.ArrowRight}
                        iconFill={theme.white}
                        onPress={submit}
                    />
                </SubmitButtonShadow>
            </View>
        </Animated.View>
    );
}

export default ReceiptPreviews;
