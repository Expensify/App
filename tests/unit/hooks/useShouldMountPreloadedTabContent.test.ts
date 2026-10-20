import {renderHook} from '@testing-library/react-native';

import useShouldMountPreloadedTabContent from '@hooks/useShouldMountPreloadedTabContent';

import React from 'react';

/** Renders the hook and records its value on every render, so a test can see the renders a transition settles past. */
function renderRecordingHook(initialIsInPreloadedTab: boolean) {
    const values: boolean[] = [];
    const hook = renderHook(
        ({isInPreloadedTab}: {isInPreloadedTab: boolean}) => {
            const shouldMount = useShouldMountPreloadedTabContent(isInPreloadedTab);
            values.push(shouldMount);
            return shouldMount;
        },
        {initialProps: {isInPreloadedTab: initialIsInPreloadedTab}},
    );
    return {...hook, values};
}

describe('useShouldMountPreloadedTabContent', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('mounts the screens of a tab that was not preloaded on its first render', () => {
        // Given a tab the user opened directly, with no idle preload
        // When the tab navigator renders
        const {values} = renderRecordingHook(false);

        // Then its screens mount right away, exactly as before the preload existed
        expect(values.at(0)).toBe(true);
        expect(values).not.toContain(false);
    });

    it('mounts the screens of a preloaded tab in a later transition render', () => {
        // Given a tab the idle preload just added in the background
        // When the tab navigator renders and its effects run
        const {values, result} = renderRecordingHook(true);

        // Then the first render leaves the screens out, so the preload dispatch itself stays cheap, and a following
        // low-priority render mounts them, which React can split up and pause for user input
        expect(values.at(0)).toBe(false);
        expect(result.current).toBe(true);
    });

    it('mounts the screens right away when the preloaded tab is opened first', () => {
        // Given a preloaded tab whose background mount has not run yet, held here so the user can beat it
        jest.spyOn(React, 'startTransition').mockImplementation(() => {});
        const {values, rerender} = renderRecordingHook(true);
        expect(values.at(-1)).toBe(false);

        // When the user opens the tab, so it is no longer a preloaded tab
        rerender({isInPreloadedTab: false});

        // Then the screens render on that same urgent render instead of waiting for the background one
        expect(values.at(-1)).toBe(true);
    });
});
