import {render, screen} from '@testing-library/react-native';

import SearchWithNavigationDeferredMount from '@components/Search/SearchWithNavigationDeferredMount';

import type {ComponentProps, ComponentType} from 'react';

import React from 'react';

import createMock from '../utils/createMock';

type ReactActual = {
    createElement: typeof React.createElement;
    useEffect: typeof React.useEffect;
};

type ReactNativeActual = {
    View: ComponentType<{testID: string}>;
};

let mockSearchMountCount = 0;

jest.mock(
    '@components/NavigationDeferredMount',
    () =>
        function NavigationDeferredMountMock() {
            const {createElement} = jest.requireActual<ReactActual>('react');
            const {View} = jest.requireActual<ReactNativeActual>('react-native');
            return createElement(View, {testID: 'navigation-deferred-mount'});
        },
);

jest.mock(
    '@components/Search/index',
    () =>
        function SearchMock() {
            const {createElement, useEffect} = jest.requireActual<ReactActual>('react');
            const {View} = jest.requireActual<ReactNativeActual>('react-native');
            useEffect(() => {
                mockSearchMountCount += 1;
            }, []);
            return createElement(View, {testID: 'search'});
        },
);

jest.mock('@components/Skeletons/SearchRowSkeleton', () => () => null);
jest.mock('@hooks/useIsInPreloadedTab', () => () => false);
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: true}));
jest.mock('@hooks/useSearchListContentContainerStyle', () => () => undefined);
jest.mock('@hooks/useThemeStyles', () => () => ({flex1: {}}));

const SEARCH_PROPS = createMock<ComponentProps<typeof SearchWithNavigationDeferredMount>>({});

describe('SearchWithNavigationDeferredMount', () => {
    beforeEach(() => {
        mockSearchMountCount = 0;
    });

    it('defers Search when it fills a page that shows no results yet', () => {
        // Given a Search page with no previous results on screen
        // When its content mounts
        render(<SearchWithNavigationDeferredMount {...SEARCH_PROPS} />);

        // Then Search waits behind the deferred mount, which shows a skeleton until the navigation transition ends
        expect(screen.getByTestId('navigation-deferred-mount')).toBeOnTheScreen();
        expect(screen.queryByTestId('search')).not.toBeOnTheScreen();
    });

    it('mounts Search at once, and keeps it mounted, when it replaces results that are on screen', () => {
        // Given previous results that unmount in the commit that mounts the new content
        // When the new content mounts as their replacement
        const view = render(
            <SearchWithNavigationDeferredMount
                {...SEARCH_PROPS}
                isReplacingContent
            />,
        );

        // Then Search is in that commit, since a deferred mount would leave the list empty until it hydrates
        expect(screen.getByTestId('search')).toBeOnTheScreen();
        expect(screen.queryByTestId('navigation-deferred-mount')).not.toBeOnTheScreen();

        // When the next render no longer reports a replacement, as the page does once the new hash is the previous one
        view.rerender(
            <SearchWithNavigationDeferredMount
                {...SEARCH_PROPS}
                isReplacingContent={false}
            />,
        );

        // Then Search is not moved behind the deferred mount, which would remount it
        expect(screen.getByTestId('search')).toBeOnTheScreen();
        expect(mockSearchMountCount).toBe(1);
    });
});
