import {renderTabRootScrollComponent} from '@components/Navigation/TabBarBottomContent/TabRootScrollViewMarker';
import useTabRootScrollProps from '@components/Navigation/TabBarBottomContent/useTabRootScrollProps';
import {ScrollOffsetContext} from '@components/ScrollOffsetContextProvider';

import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useThemeStyles from '@hooks/useThemeStyles';

import getPlatform from '@libs/getPlatform';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {FlashListProps, FlashListRef} from '@shopify/flash-list';
import type {ReactElement} from 'react';
import type {LayoutChangeEvent} from 'react-native';

import {useRoute} from '@react-navigation/native';
import {FlashList} from '@shopify/flash-list';
import React, {useContext, useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import type {LHNOptionsListProps, RenderItemProps} from './types';

import LHNTooltipContextProvider from './LHNTooltipContextProvider';
import OptionRowLHNData from './OptionRowLHN';
import OptionRowRendererComponent from './OptionRowRendererComponent';

const keyExtractor = (reportID: string) => `report_${reportID}`;
const platform = getPlatform();
const isWeb = platform === CONST.PLATFORM.WEB;

function LHNOptionsList({
    style,
    contentContainerStyles,
    data,
    onSelectRow,
    optionMode,
    shouldDisableFocusOptions = false,
    onFirstItemRendered = () => {},
    listHeaderComponent,
}: LHNOptionsListProps) {
    const {saveScrollOffset, getScrollOffset, saveScrollIndex, getScrollIndex} = useContext(ScrollOffsetContext);
    const {isOffline} = useNetwork();
    const route = useRoute();
    const styles = useThemeStyles();
    const tabRootScrollProps = useTabRootScrollProps(contentContainerStyles, {hasBottomSafeAreaPadding: true});
    const previousOptionMode = usePrevious(optionMode);

    // Controls the visibility of the educational tooltip based on user scrolling.
    // Hides the tooltip when the user is scrolling and displays it once scrolling stops.
    const triggerScrollEvent = useScrollEventEmitter();

    const flashListRef = useRef<FlashListRef<string>>(null);
    const hasCalledOnLayout = useRef(false);

    const estimatedItemSize = optionMode === CONST.OPTION_MODE.COMPACT ? variables.optionRowHeightCompact : variables.optionRowHeight;
    const extraData = [data.length, optionMode, isOffline];
    const hasListHeader = !!listHeaderComponent;
    const savedScrollIndex = getScrollIndex(route);
    // With a list header, index 0 is left to the list's natural start: FlashList restores an index to the row's offset
    // plus the header's height, so restoring 0 would scroll the header away.
    const minRestorableScrollIndex = hasListHeader ? 1 : 0;
    const initialScrollIndex = isWeb && savedScrollIndex !== undefined && savedScrollIndex >= minRestorableScrollIndex && savedScrollIndex < data.length ? savedScrollIndex : undefined;

    // Kept in a ref rather than state: onScroll is the only reader, and the header's height must never trigger a re-render.
    const listHeaderHeightRef = useRef(0);
    const onListHeaderLayout = (event: LayoutChangeEvent) => {
        listHeaderHeightRef.current = event.nativeEvent.layout.height;
    };

    // When the first item renders we want to call the onFirstItemRendered callback.
    // At this point in time we know that the list is actually displaying items.
    const onLayoutItem = () => {
        if (hasCalledOnLayout.current) {
            return;
        }
        hasCalledOnLayout.current = true;
        onFirstItemRendered();
    };

    /**
     * Function which renders a row in the list
     */
    const renderItem = ({item, index}: RenderItemProps): ReactElement | null => {
        if (!item) {
            return null;
        }
        return (
            <OptionRowLHNData
                reportID={item}
                viewMode={optionMode}
                isOptionFocused={!shouldDisableFocusOptions}
                onSelectRow={onSelectRow}
                onLayout={onLayoutItem}
                testID={index}
            />
        );
    };

    const onScroll: NonNullable<FlashListProps<string>['onScroll']> = (e) => {
        // If the layout measurement is 0, it means the FlashList is not displayed but the onScroll may be triggered with offset value 0.
        // We should ignore this case.
        if (e.nativeEvent.layoutMeasurement.height === 0) {
            return;
        }
        saveScrollOffset(route, e.nativeEvent.contentOffset.y);
        if (isWeb) {
            // The list header is part of the content, so discount its height before converting the offset to a
            // row index. Otherwise the restored index overshoots by however many rows the header covers. The header
            // can be removed without a remount (e.g. on rotation), which leaves its last height in the ref, so only
            // discount it while a header is rendered.
            const listHeaderHeight = hasListHeader ? listHeaderHeightRef.current : 0;
            const rowsOffset = Math.max(e.nativeEvent.contentOffset.y - listHeaderHeight, 0);
            saveScrollIndex(route, Math.floor(rowsOffset / estimatedItemSize));
        }
        triggerScrollEvent();
    };

    const onLayout = () => {
        const offset = getScrollOffset(route);

        if (!(offset && flashListRef.current) || isWeb) {
            return;
        }

        // We need to use requestAnimationFrame to make sure it will scroll properly on iOS.
        requestAnimationFrame(() => {
            if (!(offset && flashListRef.current)) {
                return;
            }
            flashListRef.current.scrollToOffset({offset});
        });
    };

    useEffect(() => {
        if (previousOptionMode === null || previousOptionMode === optionMode || !flashListRef.current) {
            return;
        }

        // If the option mode changes want to scroll to the top of the list because rendered items will have different height.
        flashListRef.current.scrollToOffset({offset: 0});
    }, [previousOptionMode, optionMode]);

    const listHeader = hasListHeader ? <View onLayout={onListHeaderLayout}>{listHeaderComponent}</View> : undefined;

    return (
        <View style={style ?? styles.flex1}>
            <LHNTooltipContextProvider data={data}>
                <FlashList
                    ref={flashListRef}
                    contentInsetAdjustmentBehavior={tabRootScrollProps.contentInsetAdjustmentBehavior}
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="always"
                    CellRendererComponent={OptionRowRendererComponent}
                    contentContainerStyle={StyleSheet.flatten(tabRootScrollProps.contentContainerStyle)}
                    data={data}
                    testID="lhn-options-list"
                    keyExtractor={keyExtractor}
                    renderItem={renderItem}
                    extraData={extraData}
                    onLayout={onLayout}
                    onScroll={onScroll}
                    initialScrollIndex={initialScrollIndex}
                    ListHeaderComponent={listHeader}
                    maintainVisibleContentPosition={{disabled: true}}
                    drawDistance={250}
                    removeClippedSubviews
                    renderScrollComponent={renderTabRootScrollComponent}
                />
            </LHNTooltipContextProvider>
        </View>
    );
}

export default LHNOptionsList;
