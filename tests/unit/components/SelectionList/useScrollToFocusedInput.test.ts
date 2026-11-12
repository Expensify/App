import {act, renderHook} from '@testing-library/react-native';

import useScrollToFocusedInput from '@components/SelectionList/hooks/useScrollToFocusedInput/index.native';

import type {FlashListRef} from '@shopify/flash-list';
import type {ComponentRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, View} from 'react-native';

import createMock from '../../../utils/createMock';

type MeasureInWindowCallback = (x: number, y: number, width: number, height: number) => void;

const LIST_TOP = 100;
const LIST_HEIGHT = 500;
const SCROLL_OFFSET = 300;
const PADDING = 16;

/** A view that reports this position in the window */
function createViewAt(y: number, height: number) {
    return {measureInWindow: (callback: MeasureInWindowCallback) => callback(0, y, 375, height)};
}

describe('useScrollToFocusedInput (native)', () => {
    describe('scrollToReveal', () => {
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

        it('pulls a view that was scrolled above the list back to just below its top', () => {
            // Given a field the user scrolled past, now sitting above the visible part of the list
            const {scrollToOffset, scrollToReveal} = renderScrolledList();

            // When it is revealed
            scrollToReveal(createViewAt(20, 60));

            // Then the list scrolls up until the field sits the padding below the top of the list, so it isn't pressed against the header
            expect(scrollToOffset).toHaveBeenCalledWith({offset: SCROLL_OFFSET + 20 - (LIST_TOP + PADDING), animated: true});
        });

        it('brings up a view that sits below the list until its bottom is in view', () => {
            // Given a field whose bottom is below the visible part of the list
            const {scrollToOffset, scrollToReveal} = renderScrolledList();

            // When it is revealed
            scrollToReveal(createViewAt(560, 60));

            // Then the list scrolls down until the field's bottom sits the padding above the bottom of the list, so the footer doesn't cover it
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
