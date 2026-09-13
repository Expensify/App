import type * as LegendListModule from '@legendapp/list/react-native';
import type React from 'react';
import type {ScrollViewProps, View as ReactNativeView} from 'react-native';

export default function setupMockLegendList() {
    jest.mock('@legendapp/list/react-native', () => {
        const ReactActual = jest.requireActual<typeof React>('react');
        const {ScrollView, View} = jest.requireActual<{ScrollView: React.ComponentType<ScrollViewProps>; View: typeof ReactNativeView}>('react-native');
        const LegendListActual = jest.requireActual<typeof LegendListModule>('@legendapp/list/react-native');

        type MockLegendListProps = LegendListModule.LegendListProps<unknown>;

        /**
         * LegendList relies on native layout measurements that Jest does not produce. Render every item in a
         * ScrollView so tests can exercise list content and callbacks without depending on another virtualized list.
         */
        const MockLegendList = ReactActual.forwardRef<unknown, MockLegendListProps>(
            (
                {
                    children,
                    data,
                    extraData,
                    getItemType,
                    ItemSeparatorComponent,
                    keyExtractor,
                    ListEmptyComponent,
                    ListFooterComponent,
                    ListFooterComponentStyle,
                    ListHeaderComponent,
                    ListHeaderComponentStyle,
                    maintainVisibleContentPosition: _maintainVisibleContentPosition,
                    onEndReached,
                    onEndReachedThreshold = 0.5,
                    onLoad,
                    onScroll,
                    onStartReached,
                    onStartReachedThreshold = 0.5,
                    recycleItems: _recycleItems,
                    renderItem,
                    ...scrollViewProps
                },
                ref,
            ) => {
                const onLoadRef = ReactActual.useRef(onLoad);
                const listMetricsRef = ReactActual.useRef<{contentLength: number; scroll: number; scrollLength: number} | undefined>(undefined);
                const reachedEdgesRef = ReactActual.useRef({end: false, start: false});
                onLoadRef.current = onLoad;

                ReactActual.useEffect(() => {
                    onLoadRef.current?.({elapsedTimeInMs: 0});
                }, []);

                ReactActual.useImperativeHandle(
                    ref,
                    () => ({
                        clearCaches: jest.fn(),
                        flashScrollIndicators: jest.fn(),
                        getAnimatableRef: () => null,
                        getNativeScrollRef: () => null,
                        getScrollableNode: () => null,
                        getScrollResponder: () => null,
                        getState: () => ({
                            data: data ?? [],
                            elementAtIndex: () => undefined,
                            endBuffered: (data?.length ?? 0) - 1,
                            startBuffered: 0,
                            ...listMetricsRef.current,
                        }),
                        reportContentInset: jest.fn(),
                        scrollIndexIntoView: jest.fn(() => Promise.resolve()),
                        scrollItemIntoView: jest.fn(() => Promise.resolve()),
                        scrollToEnd: jest.fn(() => Promise.resolve()),
                        scrollToIndex: jest.fn(() => Promise.resolve()),
                        scrollToItem: jest.fn(() => Promise.resolve()),
                        scrollToOffset: jest.fn(() => Promise.resolve()),
                        setItemSize: jest.fn(),
                        setScrollProcessingEnabled: jest.fn(),
                        setVisibleContentAnchorOffset: jest.fn(),
                    }),
                    [data],
                );

                const handleScroll: NonNullable<ScrollViewProps['onScroll']> = (event) => {
                    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
                    const isHorizontal = scrollViewProps.horizontal === true;
                    const offset = isHorizontal ? contentOffset.x : contentOffset.y;
                    const contentLength = isHorizontal ? contentSize.width : contentSize.height;
                    const visibleLength = isHorizontal ? layoutMeasurement.width : layoutMeasurement.height;
                    const distanceFromEnd = contentLength - visibleLength - offset;
                    const isWithinEndThreshold = distanceFromEnd <= visibleLength * (onEndReachedThreshold ?? 0.5);
                    const isWithinStartThreshold = offset <= visibleLength * (onStartReachedThreshold ?? 0.5);
                    listMetricsRef.current = {
                        contentLength,
                        scroll: offset,
                        scrollLength: visibleLength,
                    };
                    onScroll?.(event);

                    if (!isWithinEndThreshold) {
                        reachedEdgesRef.current.end = false;
                    } else if (!reachedEdgesRef.current.end) {
                        reachedEdgesRef.current.end = true;
                        onEndReached?.({distanceFromEnd});
                    }
                    if (!isWithinStartThreshold) {
                        reachedEdgesRef.current.start = false;
                    } else if (!reachedEdgesRef.current.start) {
                        reachedEdgesRef.current.start = true;
                        onStartReached?.({distanceFromStart: offset});
                    }
                };

                const renderedItems = data?.flatMap((item, index) => {
                    if (!renderItem) {
                        return [];
                    }

                    const itemKey = keyExtractor?.(item, index) ?? String(index);
                    const safeExtraData: unknown = extraData;
                    const itemElement = ReactActual.createElement(View, {key: itemKey}, renderItem({data, extraData: safeExtraData, index, item, type: getItemType?.(item, index)}));
                    if (!ItemSeparatorComponent || index === data.length - 1) {
                        return [itemElement];
                    }

                    return [itemElement, ReactActual.createElement(ItemSeparatorComponent, {key: `${itemKey}-separator`, leadingItem: item})];
                });
                const header = ReactActual.isValidElement(ListHeaderComponent) ? ListHeaderComponent : ListHeaderComponent && ReactActual.createElement(ListHeaderComponent);
                const footer = ReactActual.isValidElement(ListFooterComponent) ? ListFooterComponent : ListFooterComponent && ReactActual.createElement(ListFooterComponent);
                const empty = ReactActual.isValidElement(ListEmptyComponent) ? ListEmptyComponent : ListEmptyComponent && ReactActual.createElement(ListEmptyComponent);
                let content = children;
                if (data) {
                    content = data.length > 0 ? renderedItems : empty;
                }

                return ReactActual.createElement(
                    ScrollView,
                    {...scrollViewProps, onScroll: handleScroll},
                    header && ReactActual.createElement(View, {style: ListHeaderComponentStyle}, header),
                    content,
                    footer && ReactActual.createElement(View, {style: ListFooterComponentStyle}, footer),
                );
            },
        );
        const LegendList = jest.fn((props: MockLegendListProps & {ref?: React.Ref<unknown>}) => ReactActual.createElement(MockLegendList, props));

        const useRecyclingState = <T>(valueOrInitializer: T | (() => T)) => ReactActual.useState(valueOrInitializer);

        return {
            ...LegendListActual,
            LegendList,
            useAdaptiveRender: () => 'normal',
            useAdaptiveRenderChange: jest.fn(),
            useIsLastItem: () => false,
            useListScrollSize: () => ({height: 0, width: 0}),
            useRecyclingEffect: jest.fn(),
            useRecyclingState,
            useSyncLayout: () => jest.fn(),
            useViewability: jest.fn(),
            useViewabilityAmount: jest.fn(),
        };
    });

    jest.mock('@legendapp/list/reanimated', () => ({
        AnimatedLegendList: jest.requireMock<typeof LegendListModule>('@legendapp/list/react-native').LegendList,
    }));
}
