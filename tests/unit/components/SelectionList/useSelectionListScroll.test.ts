import {renderHook} from '@testing-library/react-native';

import useSelectionListScroll from '@components/SelectionList/hooks/useSelectionListScroll';

import Log from '@libs/Log';

import type {FlashListRef} from '@shopify/flash-list';
import type {RefObject} from 'react';

type MockItem = {keyForList: string};

function createListRef(scrollToIndex: jest.Mock | null): RefObject<Pick<FlashListRef<MockItem>, 'scrollToIndex'> | null> {
    if (scrollToIndex === null) {
        return {current: null};
    }
    return {current: {scrollToIndex}};
}

describe('useSelectionListScroll', () => {
    const data: MockItem[] = [{keyForList: 'a'}, {keyForList: 'b'}, {keyForList: 'c'}];

    it('scrolls to a valid index (animated by default)', () => {
        const scrollToIndex = jest.fn();
        const listRef = createListRef(scrollToIndex);
        const {result} = renderHook(() => useSelectionListScroll(listRef, data));

        result.current.scrollToIndex(1);

        expect(scrollToIndex).toHaveBeenCalledWith({index: 1, animated: true});
    });

    it('respects the animated argument', () => {
        const scrollToIndex = jest.fn();
        const listRef = createListRef(scrollToIndex);
        const {result} = renderHook(() => useSelectionListScroll(listRef, data));

        result.current.scrollToIndex(2, false);

        expect(scrollToIndex).toHaveBeenCalledWith({index: 2, animated: false});
    });

    it('ignores a negative index', () => {
        const scrollToIndex = jest.fn();
        const listRef = createListRef(scrollToIndex);
        const {result} = renderHook(() => useSelectionListScroll(listRef, data));

        result.current.scrollToIndex(-1);

        expect(scrollToIndex).not.toHaveBeenCalled();
    });

    it('ignores an index past the end of the data', () => {
        const scrollToIndex = jest.fn();
        const listRef = createListRef(scrollToIndex);
        const {result} = renderHook(() => useSelectionListScroll(listRef, data));

        result.current.scrollToIndex(data.length);

        expect(scrollToIndex).not.toHaveBeenCalled();
    });

    it('no-ops when the list ref is not attached', () => {
        const listRef = createListRef(null);
        const {result} = renderHook(() => useSelectionListScroll(listRef, data));

        expect(() => result.current.scrollToIndex(0)).not.toThrow();
    });

    it('logs a warning when FlashList throws, without rethrowing', () => {
        const warnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => {});
        const scrollToIndex = jest.fn(() => {
            throw new Error('layout not ready');
        });
        const listRef = createListRef(scrollToIndex);
        const {result} = renderHook(() => useSelectionListScroll(listRef, data));

        expect(() => result.current.scrollToIndex(0)).not.toThrow();
        expect(warnSpy).toHaveBeenCalledTimes(1);

        warnSpy.mockRestore();
    });

    it('debouncedScrollToIndex scrolls on the leading edge', () => {
        const scrollToIndex = jest.fn();
        const listRef = createListRef(scrollToIndex);
        const {result} = renderHook(() => useSelectionListScroll(listRef, data));

        result.current.debouncedScrollToIndex(1);

        expect(scrollToIndex).toHaveBeenCalledWith({index: 1, animated: true});
    });
});
