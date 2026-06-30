import type {FlashListRef, ListRenderItem, ListRenderItemInfo} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ViewToken} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsFocusedRef from '@hooks/useIsFocusedRef';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import shouldAdjustScroll from '@libs/shouldAdjustScroll';
import {compareByRBR} from '@libs/TransactionPreviewUtils';
import {getCreated} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import type {MoneyRequestReportPreviewStyleType} from './types';

const MAX_PREVIEWS_NUMBER = 10;

const ITEM_LAYOUT_TYPE = {
    PREVIEW: 'preview',
    SHOW_MORE: 'showMore',
};

type UseReportPreviewCarouselParams = {
    /** Transactions that belong to the previewed report */
    transactions: Transaction[];

    /** Violations for the previewed transactions, used to sort RBR transactions first */
    transactionViolations: Parameters<typeof compareByRBR>[2];

    /** The previewed IOU report */
    iouReport: OnyxEntry<Report>;

    /** The policy the previewed report belongs to */
    policy: OnyxEntry<Policy>;

    /** Whether the access placeholder is shown (no carousel transactions in that case) */
    shouldShowAccessPlaceHolder: boolean;

    /** Computed preview styles, used to size the carousel items */
    reportPreviewStyles: MoneyRequestReportPreviewStyleType;

    /** The measured width of the preview */
    currentWidth: number;

    /** IDs of newly added transactions, used to scroll them into view */
    newTransactionIDs?: Set<string>;

    /** Renders a single transaction preview item */
    renderTransactionItem: ListRenderItem<Transaction>;
};

/**
 * Owns all transaction-carousel state, refs, effects and derived values for the money request report preview.
 * The shell passes the returned list props to the carousel body and the arrow controls to the header.
 */
function useReportPreviewCarousel({
    transactions,
    transactionViolations,
    iouReport,
    policy,
    shouldShowAccessPlaceHolder,
    reportPreviewStyles,
    currentWidth,
    newTransactionIDs,
    renderTransactionItem,
}: UseReportPreviewCarouselParams) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const isFocusedRef = useIsFocusedRef();

    const carouselTransactions = useMemo(() => {
        if (shouldShowAccessPlaceHolder) {
            return [];
        }
        const sorted = [...transactions].sort((a, b) => {
            const rbrComparison = compareByRBR(a, b, transactionViolations, currentUserDetails?.login ?? '', currentUserDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID, iouReport, policy);
            if (rbrComparison !== 0) {
                return rbrComparison;
            }
            // Tiebreak by date (ascending — oldest first) so position is stable across RBR state changes
            return localeCompare(getCreated(a), getCreated(b));
        });
        return sorted.slice(0, MAX_PREVIEWS_NUMBER + 1);
    }, [shouldShowAccessPlaceHolder, transactions, transactionViolations, currentUserDetails?.login, currentUserDetails?.accountID, iouReport, policy, localeCompare]);
    const prevCarouselTransactionLength = useRef(0);

    useEffect(() => {
        return () => {
            prevCarouselTransactionLength.current = carouselTransactions.length;
        };
    }, [carouselTransactions.length]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentVisibleItems, setCurrentVisibleItems] = useState([0]);
    const [footerWidth, setFooterWidth] = useState(0);

    // optimisticIndex - value for index we are scrolling to with an arrow button or undefined after scroll is completed
    // value ensures that disabled state is applied instantly and not overridden by onViewableItemsChanged when scrolling
    // undefined makes arrow buttons react on currentIndex changes when scrolling manually
    const [optimisticIndex, setOptimisticIndex] = useState<number | undefined>(undefined);
    const carouselRef = useRef<FlashListRef<Transaction> | null>(null);

    // Expose a callback ref instead of the ref object so the ref does not flow through the hook's return value
    // (React Compiler forbids reading/passing refs during render).
    const setCarouselRef = useCallback((node: FlashListRef<Transaction> | null) => {
        carouselRef.current = node;
    }, []);
    const prevTransactionCountForScroll = useRef(carouselTransactions.length);
    const [carouselKey, setCarouselKey] = useState(0);

    // Reset carousel when transitioning from empty to non-empty data.
    // scrollToOffset doesn't clear RecyclerListView's internal layout cache on iOS mobile web,
    // so we force a full re-mount via key to prevent new items from rendering off-screen.
    useEffect(() => {
        if (carouselTransactions.length > 0 && prevTransactionCountForScroll.current === 0) {
            setCurrentIndex(0);
            setOptimisticIndex(undefined);
            setCarouselKey((prev) => prev + 1);
        }
        prevTransactionCountForScroll.current = carouselTransactions.length;
    }, [carouselTransactions.length]);

    const visibleItemsOnEndCount = useMemo(() => {
        const lastItemWidth = transactions.length > MAX_PREVIEWS_NUMBER ? footerWidth : reportPreviewStyles.transactionPreviewCarouselStyle.width;
        const lastItemWithGap = lastItemWidth + styles.gap2.gap;
        const itemWithGap = reportPreviewStyles.transactionPreviewCarouselStyle.width + styles.gap2.gap;
        return Math.floor((currentWidth - 2 * styles.pl2.paddingLeft - lastItemWithGap) / itemWithGap) + 1;
    }, [transactions.length, footerWidth, reportPreviewStyles.transactionPreviewCarouselStyle.width, styles.gap2.gap, styles.pl2.paddingLeft, currentWidth]);
    const viewabilityConfig = useMemo(() => {
        return {itemVisiblePercentThreshold: 100};
    }, []);

    const carouselTransactionsRef = useRef(carouselTransactions);

    useEffect(() => {
        carouselTransactionsRef.current = carouselTransactions;
    }, [carouselTransactions]);

    useEffect(() => {
        const index = carouselTransactions.findIndex((transaction) => newTransactionIDs?.has(transaction.transactionID));

        if (index < 0) {
            return;
        }
        const newTransaction = carouselTransactions.at(index);
        setTimeout(() => {
            if (!isFocusedRef.current) {
                return;
            }

            // If the new transaction is not available at the index it was on before the delay, avoid the scrolling
            // because we are scrolling to either a wrong or unavailable transaction (which can cause crash).
            if (newTransaction?.transactionID !== carouselTransactionsRef.current.at(index)?.transactionID) {
                return;
            }

            carouselRef.current?.scrollToIndex({
                index,
                viewOffset: -2 * styles.gap2.gap,
                animated: true,
            });
        }, CONST.PENDING_TRANSACTION_SCROLL_DELAY);

        // We only want to scroll to a new transaction when the set of new transaction IDs changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newTransactionIDs]);

    const onViewableItemsChanged = useCallback(({viewableItems}: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
        const newIndex = viewableItems.at(0)?.index;
        if (typeof newIndex === 'number') {
            setCurrentIndex(newIndex);
        }
        const viewableItemsIndexes = viewableItems.map((item) => item.index).filter((item): item is number => item !== null);
        setCurrentVisibleItems(viewableItemsIndexes);
    }, []);

    const snapOffsets = carouselTransactions.map((_, index) => index * (reportPreviewStyles.transactionPreviewCarouselStyle.width + styles.transactionsCarouselGap.width));

    const handleChange = (index: number) => {
        if (index > carouselTransactions.length - visibleItemsOnEndCount) {
            const lastScrollableIndex = carouselTransactions.length - visibleItemsOnEndCount;
            setOptimisticIndex(lastScrollableIndex);
            carouselRef.current?.scrollToOffset({
                offset: snapOffsets.at(lastScrollableIndex) ?? 0,
                animated: true,
            });
            return;
        }
        if (index < 0) {
            setOptimisticIndex(0);
            carouselRef.current?.scrollToTop({animated: true});
            return;
        }
        if (index === carouselTransactions.length - visibleItemsOnEndCount) {
            setOptimisticIndex(index);
            carouselRef.current?.scrollToEnd({animated: true});
            return;
        }
        setOptimisticIndex(index);
        carouselRef.current?.scrollToOffset({
            offset: snapOffsets.at(index) ?? 0,
            animated: true,
        });
    };

    const renderItem = (itemInfo: ListRenderItemInfo<Transaction>) => {
        if (itemInfo.index > MAX_PREVIEWS_NUMBER - 1) {
            return (
                <View
                    style={[styles.p5, styles.justifyContentCenter]}
                    onLayout={(e) => setFooterWidth(e.nativeEvent.layout.width)}
                >
                    {/* Uses the theme link color (textBlue) instead of a hardcoded blue600 so the label respects dark mode and matches other links.
                    Dark-mode appearance (blue300) still to be verified in a follow-up. */}
                    <Text style={styles.textBlue}>
                        +{transactions.length - MAX_PREVIEWS_NUMBER} {translate('common.more').toLowerCase()}
                    </Text>
                </View>
            );
        }
        return renderTransactionItem(itemInfo);
    };

    useEffect(() => {
        if (
            optimisticIndex === undefined ||
            optimisticIndex !== currentIndex ||
            // currentIndex is still the same as target (f.ex. 0), but not yet scrolled to the far left
            (currentVisibleItems.at(0) !== optimisticIndex && optimisticIndex !== undefined) ||
            // currentIndex reached, but not scrolled to the end
            (optimisticIndex === carouselTransactions.length - visibleItemsOnEndCount && currentVisibleItems.length !== visibleItemsOnEndCount)
        ) {
            return;
        }
        // Clears the transient optimistic index once the FlashList scroll (an external system) catches up to the
        // arrow-driven target, so the arrows fall back to reacting to the real scroll position.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOptimisticIndex(undefined);
    }, [carouselTransactions.length, currentIndex, currentVisibleItems, currentVisibleItems.length, optimisticIndex, visibleItemsOnEndCount]);

    const adjustScroll = useCallback(() => {
        // Workaround for a known React Native bug on Android (https://github.com/facebook/react-native/issues/27504):
        // When the FlatList is scrolled to the end and the last item is deleted, a blank space is left behind.
        // To fix this, we detect when onEndReached is triggered due to an item deletion,
        // and programmatically scroll to the end to fill the space.
        if (carouselTransactions.length >= prevCarouselTransactionLength.current || !shouldAdjustScroll) {
            return;
        }
        prevCarouselTransactionLength.current = carouselTransactions.length;
        carouselRef.current?.scrollToEnd();
    }, [carouselTransactions.length]);

    const renderSeparator = () => <View style={styles.transactionsCarouselGap} />;

    const getItemType = (_item: Transaction, index: number) => {
        return index === MAX_PREVIEWS_NUMBER ? ITEM_LAYOUT_TYPE.SHOW_MORE : ITEM_LAYOUT_TYPE.PREVIEW;
    };

    const goToPrevious = () => handleChange(currentIndex - 1);
    const goToNext = () => handleChange(currentIndex + 1);
    const isPreviousDisabled = optimisticIndex !== undefined ? optimisticIndex === 0 : currentIndex === 0 && currentVisibleItems.at(0) === 0;
    const isNextDisabled = optimisticIndex ? optimisticIndex + visibleItemsOnEndCount >= carouselTransactions.length : currentVisibleItems.at(-1) === carouselTransactions.length - 1;

    return {
        carouselTransactions,
        carouselKey,
        setCarouselRef,
        snapOffsets,
        renderItem,
        getItemType,
        renderSeparator,
        viewabilityConfig,
        onViewableItemsChanged,
        adjustScroll,
        goToPrevious,
        goToNext,
        isPreviousDisabled,
        isNextDisabled,
    };
}

export default useReportPreviewCarousel;
