import {act, render, screen} from '@testing-library/react-native';

import type {ViewHolderCollectionProps} from '@shopify/flash-list/dist/recyclerview/ViewHolderCollection';

import {ViewHolderCollection} from '@shopify/flash-list/dist/recyclerview/ViewHolderCollection';
import React from 'react';
import {Platform} from 'react-native';

jest.mock('@shopify/flash-list/dist/recyclerview/ViewHolder', () => ({
    ViewHolder: ({index}: {index: number}) => {
        const {Text: NativeText} = jest.requireActual<{Text: React.ComponentType<{testID?: string; children?: React.ReactNode}>}>('react-native');
        return <NativeText testID="flash-list-row">{index}</NativeText>;
    },
}));

jest.mock('@shopify/flash-list/dist/recyclerview/components/CompatView', () => ({
    CompatView: ({children}: {children: React.ReactNode}) => {
        const {View: NativeView} = jest.requireActual<{View: React.ComponentType<{children?: React.ReactNode}>}>('react-native');
        return <NativeView>{children}</NativeView>;
    },
}));

jest.mock('@shopify/flash-list/dist/recyclerview/RecyclerViewContextProvider', () => ({
    useRecyclerViewContext: () => undefined,
}));

function getRenderedIndices(): number[] {
    return screen.getAllByTestId('flash-list-row').map((row) => {
        const index: unknown = row.props.children;
        if (typeof index !== 'number') {
            throw new Error('Expected a numeric row index');
        }
        return index;
    });
}

describe('FlashList web DOM ordering', () => {
    const originalPlatform = Platform.OS;

    beforeEach(() => {
        jest.useFakeTimers();
        Platform.OS = 'web';
    });

    afterEach(() => {
        Platform.OS = originalPlatform;
        jest.useRealTimers();
    });

    it('sorts an inserted row when the list does not scroll or recycle', () => {
        // Given a short list whose render stack keeps the same Map while indices shift for a new member
        const renderStack = new Map<string, {index: number}>([
            ['first', {index: 0}],
            ['second', {index: 1}],
            ['third', {index: 2}],
        ]);
        const baseProps: Omit<ViewHolderCollectionProps<string>, 'data'> = {
            renderStack,
            getLayout: (index) => ({x: 0, y: index * 40, width: 200, height: 40}),
            refHolder: new Map(),
            onSizeChanged: () => undefined,
            renderItem: () => null,
            extraData: undefined,
            viewHolderCollectionRef: null,
            getChildContainerLayout: () => ({width: 200, height: 400}),
            onCommitLayoutEffect: () => undefined,
            onCommitEffect: () => undefined,
            horizontal: false,
            getAdjustmentMargin: () => 0,
            currentStickyIndex: -1,
            hideStickyHeaderRelatedCell: false,
            isInLastRow: () => false,
            inverted: false,
            isScrollingProgrammatically: () => false,
            isScrolling: () => false,
            runAfterProgrammaticScroll: () => undefined,
            getLastScrollTime: () => 0,
        };
        const {rerender} = render(
            <ViewHolderCollection
                {...baseProps}
                data={['first', 'second', 'third']}
            />,
        );
        act(() => jest.advanceTimersByTime(1000));
        const second = renderStack.get('second');
        const third = renderStack.get('third');
        if (!second || !third) {
            throw new Error('Expected the original rows to be present');
        }
        second.index = 2;
        third.index = 3;
        renderStack.set('inserted', {index: 1});

        // When data grows without changing the render stack identity or scrolling
        rerender(
            <ViewHolderCollection
                {...baseProps}
                data={['first', 'inserted', 'second', 'third']}
            />,
        );
        expect(getRenderedIndices()).toEqual([0, 2, 3, 1]);
        act(() => jest.advanceTimersByTime(1000));

        // Then the deferred sort restores DOM order to match the visible order
        expect(getRenderedIndices()).toEqual([0, 1, 2, 3]);
    });
});
