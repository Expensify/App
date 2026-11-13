import {act, renderHook} from '@testing-library/react-native';

import useScrollToFocusedInput from '@components/SelectionList/hooks/useScrollToFocusedInput/index.native';
import type * as WebScrollToFocusedInputModule from '@components/SelectionList/hooks/useScrollToFocusedInput/index.ts';

import type {FlashListRef} from '@shopify/flash-list';
import type {ComponentRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, View} from 'react-native';

import createMock from '../../../utils/createMock';

type MeasureInWindowCallback = (x: number, y: number, width: number, height: number) => void;

const LIST_TOP = 100;
const LIST_HEIGHT = 500;
const SCROLL_OFFSET = 300;
const PADDING = 16;

describe('useScrollToFocusedInput (native)', () => {
    describe('scrollToReveal', () => {
        /** A view that reports this position in the window */
        function createViewAt(y: number, height: number) {
            return {measureInWindow: (callback: MeasureInWindowCallback) => callback(0, y, 375, height)};
        }

        function renderScrolledList() {
            // A scrolled list inside a container that also holds a footer below it, so the container is taller than the visible part of the list
            const scrollToOffset = jest.fn();
            const scroller = {...createViewAt(LIST_TOP, LIST_HEIGHT), scrollTo: jest.fn()};
            const {result} = renderHook(() =>
                useScrollToFocusedInput({current: {scrollToOffset, getNativeScrollRef: () => createMock<ReturnType<FlashListRef<unknown>['getNativeScrollRef']>>(scroller)}}, false),
            );
            result.current.containerRef.current = createMock<ComponentRef<typeof View>>(createViewAt(LIST_TOP, LIST_HEIGHT + 200));
            act(() => result.current.trackScrollOffset(createMock<NativeSyntheticEvent<NativeScrollEvent>>({nativeEvent: {contentOffset: {y: SCROLL_OFFSET}}})));
            return {scrollToOffset, scrollToReveal: result.current.scrollToReveal};
        }

        it('brings up a view that sits below the list until its bottom is in view', () => {
            // Given a field whose bottom is below the visible part of the list, but above the bottom of the container
            const {scrollToOffset, scrollToReveal} = renderScrolledList();

            // When it is revealed
            scrollToReveal(createViewAt(560, 60));

            // Then the list scrolls from where it is until the field's bottom sits the padding above the bottom of the list, so the footer doesn't cover it
            expect(scrollToOffset).toHaveBeenCalledWith({offset: SCROLL_OFFSET + 560 + 60 - (LIST_TOP + LIST_HEIGHT - PADDING), animated: true});
        });

        it('leaves the list where it is when the view is already in sight', () => {
            // Given a field that is already in the visible part of the list
            const {scrollToOffset, scrollToReveal} = renderScrolledList();

            // When it is revealed
            scrollToReveal(createViewAt(300, 60));

            // Then the list doesn't move, so a visible error never makes the form jump
            expect(scrollToOffset).not.toHaveBeenCalled();
        });
    });
});

describe('useScrollToFocusedInput (web)', () => {
    const useWebScrollToFocusedInput = jest.requireActual<typeof WebScrollToFocusedInputModule>('@components/SelectionList/hooks/useScrollToFocusedInput/index.ts').default;

    /** An element that reports this position in the window */
    function createElementAt(top: number, height: number) {
        const element = document.createElement('div');
        jest.spyOn(element, 'getBoundingClientRect').mockReturnValue(createMock<DOMRect>({top, height}));
        return element;
    }

    function renderScrolledList() {
        const scrollToOffset = jest.fn();
        const scroller = createElementAt(LIST_TOP, LIST_HEIGHT);
        scroller.scrollTop = SCROLL_OFFSET;
        const {result} = renderHook(() => useWebScrollToFocusedInput({current: {scrollToOffset, getNativeScrollRef: jest.fn().mockReturnValue(scroller)}}, false));
        return {scrollToOffset, scrollToReveal: result.current.scrollToReveal};
    }

    it('scrolls the list by the same rule as native, from its current scroll position', () => {
        // Given a scrolled list and a field the user scrolled past, now above the visible part of the list
        const {scrollToOffset, scrollToReveal} = renderScrolledList();

        // When it is revealed
        scrollToReveal(createElementAt(20, 60));

        // Then the list scrolls up until the field sits the padding below the top of the list, the same as on native
        expect(scrollToOffset).toHaveBeenCalledWith({offset: SCROLL_OFFSET + 20 - (LIST_TOP + PADDING), animated: true});
    });

    it('leaves the list where it is when the view is already in sight', () => {
        // Given a field that is already in the visible part of the list
        const {scrollToOffset, scrollToReveal} = renderScrolledList();

        // When it is revealed
        scrollToReveal(createElementAt(300, 60));

        // Then the list doesn't move
        expect(scrollToOffset).not.toHaveBeenCalled();
    });
});
