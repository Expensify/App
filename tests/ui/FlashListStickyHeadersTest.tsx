import {act, render, screen} from '@testing-library/react-native';

import type {FlashListProps} from '@shopify/flash-list';
import type {StickyHeaderRef} from '@shopify/flash-list/dist/recyclerview/components/StickyHeaders';
import type {RecyclerViewManager} from '@shopify/flash-list/dist/recyclerview/RecyclerViewManager';

import {StickyHeaders} from '@shopify/flash-list/dist/recyclerview/components/StickyHeaders';
import React from 'react';
import {Animated, View} from 'react-native';

// Keep FlashList's real sticky-index and Animated interpolation logic. Only replace its host wrappers.
jest.mock('@shopify/flash-list/dist/recyclerview/components/CompatView', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const {View: NativeView} = jest.requireActual<typeof import('react-native')>('react-native');
    return {
        CompatAnimatedView: (props: React.ComponentProps<typeof View>) =>
            ReactLocal.createElement(NativeView, {
                ...props,
                testID: 'sticky-overlay',
            }),
    };
});

jest.mock('@shopify/flash-list/dist/recyclerview/ViewHolder', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const {View: NativeView} = jest.requireActual<typeof import('react-native')>('react-native');
    return {
        ViewHolder: () => ReactLocal.createElement(NativeView, {testID: 'sticky-copy'}),
    };
});

type Item = {key: string};

function setup({hideWhenInactive = true, hideRelatedCell = false, inverted = false, stickyHeaderIndices = [0]} = {}) {
    const data: Item[] = [{key: 'header'}, {key: 'row'}, {key: 'other-header'}];
    const props: FlashListProps<Item> = {
        data,
        stickyHeaderConfig: {hideWhenInactive, hideRelatedCell},
    };
    const layout = {x: 0, y: 0, width: 300, height: 48};
    const managerState = {
        props,
        firstItemOffset: 120,
        getDataLength: () => data.length,
        getLastScrollOffset: jest.fn(() => 280),
        getEngagedIndices: () => ({startIndex: 0, endIndex: 2}),
        getLayout: () => layout,
        tryGetLayout: (index: number) => (index < 0 ? undefined : layout),
    };
    const stickyHeaderRef: React.RefObject<StickyHeaderRef> = {
        current: {reportScrollEvent: jest.fn(), reportLayout: jest.fn()},
    };
    const scrollY = new Animated.Value(400);
    const onChangeStickyIndex = jest.fn();
    render(
        <StickyHeaders
            extraData={undefined}
            data={data}
            stickyHeaderIndices={stickyHeaderIndices}
            stickyHeaderOffset={0}
            stickyHeaderRef={stickyHeaderRef}
            recyclerViewManager={managerState as unknown as RecyclerViewManager<Item>}
            scrollY={scrollY}
            renderItem={() => null}
            onChangeStickyIndex={onChangeStickyIndex}
            inverted={inverted}
        />,
    );
    return {
        scrollY,
        stickyHeaderRef,
        managerState,
        layout,
        onChangeStickyIndex,
    };
}

function getOverlayOpacity() {
    // AnimatedNode's JSON representation evaluates its interpolation without a native host.
    const style = JSON.parse(JSON.stringify(screen.getByTestId('sticky-overlay').props.style)) as {opacity?: number};
    return style.opacity;
}

describe('FlashList native sticky-header release patch', () => {
    it('hides the stale overlay when native scroll returns above its boundary before JS receives the event', () => {
        const {scrollY, onChangeStickyIndex} = setup();
        expect(screen.getByTestId('sticky-copy')).toBeTruthy();
        expect(getOverlayOpacity()).toBe(1);
        onChangeStickyIndex.mockClear();

        // Move the native-driven value without updating the manager or dispatching reportScrollEvent.
        act(() => scrollY.setValue(0));
        expect(screen.getByTestId('sticky-copy')).toBeTruthy();
        expect(onChangeStickyIndex).not.toHaveBeenCalled();
        expect(getOverlayOpacity()).toBe(0);

        act(() => scrollY.setValue(120));
        expect(getOverlayOpacity()).toBe(1);
    });

    it('refreshes the boundary after page-header and item layout changes without waiting for scrolling', () => {
        const {scrollY, stickyHeaderRef, managerState, layout} = setup();
        act(() => scrollY.setValue(150));
        expect(getOverlayOpacity()).toBe(1);

        act(() => {
            managerState.firstItemOffset = 180;
            stickyHeaderRef.current?.reportLayout();
        });
        expect(getOverlayOpacity()).toBe(0);

        act(() => {
            layout.y = 40;
            stickyHeaderRef.current?.reportLayout();
            scrollY.setValue(200);
        });
        expect(getOverlayOpacity()).toBe(0);
        act(() => scrollY.setValue(220));
        expect(getOverlayOpacity()).toBe(1);
    });

    it.each([{hideWhenInactive: false}, {hideRelatedCell: true}, {inverted: true}, {stickyHeaderIndices: [0, 2]}])(
        'preserves the existing overlay behavior outside the supported opt-in: %j',
        (options) => {
            const {scrollY} = setup(options);
            act(() => scrollY.setValue(0));
            expect(getOverlayOpacity()).toBeUndefined();
        },
    );
});
