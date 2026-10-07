import {fireEvent, render, screen} from '@testing-library/react-native';

import DeferredSearchAutocompleteList from '@components/Search/DeferredSearchAutocompleteList';
import type {SearchAutocompleteListProps} from '@components/Search/SearchAutocompleteList';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

import type {LayoutChangeEvent} from 'react-native';

import React from 'react';
import {View} from 'react-native';

// jest.mock factories can't reference imported bindings, but `mock`-prefixed locals are allowed.
const MockView = View;

const mockIsFocusedUntilTransitionEnd = jest.fn(() => true);

jest.mock('@hooks/useIsFocusedUntilTransitionEnd', () => ({
    __esModule: true,
    default: () => mockIsFocusedUntilTransitionEnd(),
}));

// Stand in for the two children so the test only exercises which one the wrapper picks.
jest.mock('@components/OptionsListSkeletonView', () => ({
    __esModule: true,
    default: ({onLayout}: {onLayout?: (event: LayoutChangeEvent) => void}) => (
        <MockView
            testID="options-list-skeleton"
            onLayout={onLayout}
        />
    ),
}));

jest.mock('@components/Search/SearchAutocompleteList', () => ({
    __esModule: true,
    default: () => <MockView testID="search-autocomplete-list" />,
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: jest.fn(),
}));

jest.mock('@libs/telemetry/activeSpans', () => ({
    endSpan: jest.fn(),
}));

const mockedRunAfterTransitions = jest.mocked(TransitionTracker.runAfterTransitions);

const listProps: SearchAutocompleteListProps = {
    autocompleteQueryValue: '',
    handleSearch: jest.fn(),
    onListItemPress: jest.fn(),
};

function layOutSkeleton() {
    fireEvent(screen.getByTestId('options-list-skeleton'), 'layout', {nativeEvent: {layout: {width: 300, height: 400, x: 0, y: 0}}});
}

beforeEach(() => {
    jest.clearAllMocks();
    mockIsFocusedUntilTransitionEnd.mockReturnValue(true);
    // A transition that never completes: anything gating on it would stay on the skeleton forever.
    mockedRunAfterTransitions.mockReturnValue({cancel: jest.fn()});
});

describe('DeferredSearchAutocompleteList', () => {
    it('swaps the skeleton for the list on layout, without waiting for the navigation transition, and back on blur', () => {
        const {rerender} = render(<DeferredSearchAutocompleteList {...listProps} />);

        expect(screen.queryByTestId('search-autocomplete-list')).not.toBeOnTheScreen();

        layOutSkeleton();

        expect(screen.getByTestId('search-autocomplete-list')).toBeOnTheScreen();
        expect(mockedRunAfterTransitions).not.toHaveBeenCalled();

        mockIsFocusedUntilTransitionEnd.mockReturnValue(false);
        rerender(<DeferredSearchAutocompleteList {...listProps} />);

        expect(screen.getByTestId('options-list-skeleton')).toBeOnTheScreen();
    });
});
