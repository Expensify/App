import setLegendListItemZIndex from '@components/LegendList/setLegendListItemZIndex';

import useThemeStyles from '@hooks/useThemeStyles';

import type {LegendListRef, LegendListRenderItemProps} from '@legendapp/list/react-native';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {LegendList} from '@legendapp/list/react-native';
import React, {useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import type DraggableListProps from './types';
import type {DraggableListRef} from './types';

import {getDragTargetIndex, reorderItems} from './utils';

const AUTOSCROLL_EDGE_SIZE = 60;
const AUTOSCROLL_STEP = 20;
const ACTIVE_ITEM_Z_INDEX = 999;

type SharedNumber = ReturnType<typeof useSharedValue<number>>;

type DraggableRowProps = {
    activeIndex: SharedNumber;
    children: React.ReactNode;
    disabled: boolean;
    index: number;
    onDragCancel: (index: number) => void;
    onDragEnd: (index: number, translationY: number) => void;
    onDragUpdate: (index: number, translationY: number) => void;
    onLayout: (index: number, event: LayoutChangeEvent) => void;
    translationY: SharedNumber;
};

function DraggableRow({activeIndex, children, disabled, index, onDragCancel, onDragEnd, onDragUpdate, onLayout, translationY}: DraggableRowProps) {
    const gesture = useMemo(
        () =>
            Gesture.Pan()
                .enabled(!disabled)
                .manualActivation(true)
                .onTouchesMove((_event, stateManager) => {
                    if (activeIndex.get() !== index) {
                        return;
                    }
                    stateManager.activate();
                })
                .onUpdate((event) => scheduleOnRN(onDragUpdate, index, event.translationY))
                .onEnd((event, success) => {
                    if (!success) {
                        return;
                    }
                    scheduleOnRN(onDragEnd, index, event.translationY);
                })
                .onFinalize(() => scheduleOnRN(onDragCancel, index))
                .withTestId(`draggable-list-row-${index}`),
        [activeIndex, disabled, index, onDragCancel, onDragEnd, onDragUpdate],
    );
    const animatedStyle = useAnimatedStyle(() => {
        if (activeIndex.get() !== index) {
            return {zIndex: 0};
        }
        return {transform: [{translateY: translationY.get()}], zIndex: 1};
    });

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                onLayout={(event) => onLayout(index, event)}
                style={animatedStyle}
                testID={`draggable-list-row-layout-${index}`}
            >
                {children}
            </Animated.View>
        </GestureDetector>
    );
}

function DraggableList<T>({
    ref,
    data,
    renderItem,
    keyExtractor,
    onDragEnd,
    isItemDragDisabled,
    ListFooterComponent,
    disableScroll = false,
}: DraggableListProps<T> & {ref?: React.Ref<DraggableListRef>}) {
    const styles = useThemeStyles();
    const listRef = useRef<LegendListRef>(null);
    const measuredItemSizesRef = useRef<Array<number | undefined>>([]);
    const targetIndexRef = useRef<number | null>(null);
    const scrollOffsetRef = useRef(0);
    const initialScrollOffsetRef = useRef(0);
    const viewportSizeRef = useRef(0);
    const contentSizeRef = useRef(0);
    const activeItemIndexRef = useRef<number | null>(null);
    const lastGestureTranslationRef = useRef(0);
    const autoscrollFrameRef = useRef<number | null>(null);
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
    const activeIndex = useSharedValue(-1);
    const translationY = useSharedValue(0);
    const listExtraData = {activeItemIndex, isItemDragDisabled, renderItem};

    useImperativeHandle(ref, () => ({
        scrollToEnd: (options) => {
            listRef.current?.scrollToEnd(options);
        },
    }));

    useEffect(() => {
        measuredItemSizesRef.current = [];
    }, [data]);

    useEffect(
        () => () => {
            if (autoscrollFrameRef.current === null) {
                return;
            }
            cancelAnimationFrame(autoscrollFrameRef.current);
        },
        [],
    );

    const stopAutoscroll = () => {
        if (autoscrollFrameRef.current === null) {
            return;
        }
        cancelAnimationFrame(autoscrollFrameRef.current);
        autoscrollFrameRef.current = null;
    };

    const getItemLayouts = () => {
        const listState = listRef.current?.getState();
        let fallbackOffset = 0;
        return data.map((_item, index) => {
            const measuredSize = measuredItemSizesRef.current.at(index);
            const stateSize = listState?.sizeAtIndex?.(index);
            const size = stateSize && stateSize > 0 ? stateSize : (measuredSize ?? 0);
            const stateOffset = listState?.positionAtIndex?.(index);
            const offset = typeof stateOffset === 'number' && Number.isFinite(stateOffset) ? stateOffset : fallbackOffset;
            fallbackOffset = offset + size;
            return size > 0 ? {offset, size} : undefined;
        });
    };

    const startDrag = (index: number) => {
        if (activeItemIndexRef.current !== null) {
            return;
        }
        const item = data.at(index);
        if (item === undefined || (isItemDragDisabled?.(item) ?? false)) {
            return;
        }
        initialScrollOffsetRef.current = scrollOffsetRef.current;
        targetIndexRef.current = index;
        activeItemIndexRef.current = index;
        lastGestureTranslationRef.current = 0;
        activeIndex.set(index);
        translationY.set(0);
        setLegendListItemZIndex(listRef.current, index, ACTIVE_ITEM_Z_INDEX);
        setActiveItemIndex(index);
    };

    const updateDragPosition = (index: number, gestureTranslationY: number) => {
        if (activeItemIndexRef.current !== index) {
            return;
        }
        const scrollDelta = scrollOffsetRef.current - initialScrollOffsetRef.current;
        translationY.set(gestureTranslationY + scrollDelta);
        const itemLayouts = getItemLayouts();
        targetIndexRef.current = getDragTargetIndex(itemLayouts, index, gestureTranslationY + scrollDelta);

        if (disableScroll) {
            return;
        }
        const activeLayout = itemLayouts.at(index);
        const listState = listRef.current?.getState();
        const viewportSize = viewportSizeRef.current > 0 ? viewportSizeRef.current : (listState?.scrollLength ?? 0);
        const contentSize = contentSizeRef.current > 0 ? contentSizeRef.current : (listState?.contentLength ?? 0);
        if (!activeLayout || viewportSize <= 0) {
            return;
        }

        const centerInViewport = activeLayout.offset + activeLayout.size / 2 + gestureTranslationY - initialScrollOffsetRef.current;
        const maxOffset = Math.max(0, contentSize - viewportSize);
        let nextOffset = scrollOffsetRef.current;
        if (centerInViewport < AUTOSCROLL_EDGE_SIZE) {
            nextOffset = Math.max(0, nextOffset - AUTOSCROLL_STEP);
        } else if (centerInViewport > viewportSize - AUTOSCROLL_EDGE_SIZE) {
            nextOffset = Math.min(maxOffset, nextOffset + AUTOSCROLL_STEP);
        }
        if (nextOffset === scrollOffsetRef.current) {
            return;
        }

        listRef.current?.scrollToOffset({offset: nextOffset, animated: false});
        // iOS does not emit intermediate scroll events for every programmatic step, so keep the
        // feedback loop moving with the offset we just requested.
        scrollOffsetRef.current = nextOffset;
    };

    const runAutoscrollFrame = () => {
        const index = activeItemIndexRef.current;
        if (index === null) {
            autoscrollFrameRef.current = null;
            return;
        }
        updateDragPosition(index, lastGestureTranslationRef.current);
        autoscrollFrameRef.current = requestAnimationFrame(runAutoscrollFrame);
    };

    const updateDrag = (index: number, gestureTranslationY: number) => {
        lastGestureTranslationRef.current = gestureTranslationY;
        updateDragPosition(index, gestureTranslationY);
        if (autoscrollFrameRef.current === null) {
            autoscrollFrameRef.current = requestAnimationFrame(runAutoscrollFrame);
        }
    };

    const resetDrag = () => {
        stopAutoscroll();
        const activeIndexToReset = activeItemIndexRef.current;
        if (activeIndexToReset !== null) {
            setLegendListItemZIndex(listRef.current, activeIndexToReset, 0);
        }
        activeItemIndexRef.current = null;
        activeIndex.set(-1);
        translationY.set(0);
        targetIndexRef.current = null;
        setActiveItemIndex(null);
    };

    const finishDrag = (index: number, gestureTranslationY: number) => {
        updateDrag(index, gestureTranslationY);
        const targetIndex = targetIndexRef.current ?? index;
        resetDrag();

        if (targetIndex === index) {
            return;
        }
        onDragEnd?.({data: reorderItems(data, index, targetIndex)});
    };

    const cancelDrag = (index: number) => {
        if (activeItemIndexRef.current !== index) {
            return;
        }
        resetDrag();
    };

    const recordItemLayout = (index: number, event: LayoutChangeEvent) => {
        measuredItemSizesRef.current[index] = event.nativeEvent.layout.height;
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        viewportSizeRef.current = event.nativeEvent.layoutMeasurement.height;
        contentSizeRef.current = event.nativeEvent.contentSize.height;
    };

    const handleListLayout = (event: LayoutChangeEvent) => {
        viewportSizeRef.current = event.nativeEvent.layout.height;
    };

    const handleContentSizeChange = (_width: number, height: number) => {
        contentSizeRef.current = height;
    };

    const renderRow = ({item, index}: LegendListRenderItemProps<T>) => {
        const content = renderItem({
            item,
            getIndex: () => index,
            isActive: activeItemIndex === index,
            drag: () => startDrag(index),
        });

        return (
            <DraggableRow
                activeIndex={activeIndex}
                disabled={isItemDragDisabled?.(item) ?? false}
                index={index}
                onDragCancel={cancelDrag}
                onDragEnd={finishDrag}
                onDragUpdate={updateDrag}
                onLayout={recordItemLayout}
                translationY={translationY}
            >
                {content}
            </DraggableRow>
        );
    };

    return (
        <View style={styles.flex1}>
            <LegendList
                ref={listRef}
                data={data}
                extraData={listExtraData}
                renderItem={renderRow}
                keyExtractor={keyExtractor}
                recycleItems={false}
                scrollEnabled={!disableScroll}
                onScroll={handleScroll}
                onLayout={handleListLayout}
                onContentSizeChange={handleContentSizeChange}
                scrollEventThrottle={16}
                contentContainerStyle={styles.flexGrow1}
                ListFooterComponent={ListFooterComponent}
                ListFooterComponentStyle={styles.flex1}
                alwaysRender={activeItemIndex === null ? undefined : {indices: [activeItemIndex]}}
                testID="draggable-list"
            />
        </View>
    );
}

export default DraggableList;
