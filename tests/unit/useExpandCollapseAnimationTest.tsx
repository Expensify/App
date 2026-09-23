import {act, renderHook, waitFor} from '@testing-library/react-native';

import type {LayoutChangeEvent} from 'react-native';

import * as Reanimated from 'react-native-reanimated';

import useExpandCollapseAnimation from '@hooks/useExpandCollapseAnimation';

import createMock from '../utils/createMock';

function getLayoutEvent(height: number): LayoutChangeEvent {
    return createMock<LayoutChangeEvent>({nativeEvent: {layout: {x: 0, y: 0, width: 0, height}}});
}

describe('useExpandCollapseAnimation', () => {
    let withTimingSpy: jest.SpyInstance;

    beforeEach(() => {
        withTimingSpy = jest.spyOn(Reanimated, 'withTiming');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('does not animate when an already expanded row is measured for the first time', () => {
        // Given a row that mounts already expanded, the way a recycled list cell does when it scrolls back into view
        const {result} = renderHook(() => useExpandCollapseAnimation(true, true));
        withTimingSpy.mockClear();

        // When the freshly mounted content reports its height
        act(() => {
            result.current.onLayout(getLayoutEvent(120));
        });

        // Then the height is applied directly, so scrolling the list never replays the expand animation
        expect(withTimingSpy).not.toHaveBeenCalled();
    });

    it('animates an expand the user asked for', () => {
        // Given a collapsed row that has never been measured
        const {result, rerender} = renderHook(({isExpanded}) => useExpandCollapseAnimation(isExpanded, isExpanded), {initialProps: {isExpanded: false}});

        // When the user expands it and the content is measured for the first time
        rerender({isExpanded: true});
        withTimingSpy.mockClear();
        act(() => {
            result.current.onLayout(getLayoutEvent(120));
        });

        // Then the expand is animated up to the measured height
        expect(withTimingSpy).toHaveBeenCalledWith(120, expect.anything(), expect.anything());
    });

    it('animates a collapse the user asked for', async () => {
        // Given an expanded row that has already been measured
        const {result, rerender} = renderHook(({isExpanded}) => useExpandCollapseAnimation(isExpanded, isExpanded), {initialProps: {isExpanded: true}});
        act(() => {
            result.current.onLayout(getLayoutEvent(120));
        });
        withTimingSpy.mockClear();

        // When the user collapses it
        rerender({isExpanded: false});

        // Then the collapse is animated down to zero height, and the content unmounts once it finishes
        await waitFor(() => {
            expect(withTimingSpy).toHaveBeenCalledWith(0, expect.anything(), expect.anything());
        });
        expect(result.current.isRendered).toBe(false);
    });

    it('does not animate when a recycled row is measured again for a different group', () => {
        // Given an expanded, measured row whose cell FlashList then recycles for another group
        const {result, rerender} = renderHook(({resetKey}) => useExpandCollapseAnimation(true, true, resetKey), {initialProps: {resetKey: 'group-1'}});
        act(() => {
            result.current.onLayout(getLayoutEvent(120));
        });
        rerender({resetKey: 'group-2'});
        withTimingSpy.mockClear();

        // When the recycled cell measures the new group's content
        act(() => {
            result.current.onLayout(getLayoutEvent(240));
        });

        // Then the new height is applied directly instead of animating
        expect(withTimingSpy).not.toHaveBeenCalled();
    });
});
