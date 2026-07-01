import {render, screen} from '@testing-library/react-native';
import React from 'react';
import type ReactNative from 'react-native';
import {View} from 'react-native';
import SelectionListEmptyState from '@components/SelectionList/components/SelectionListEmptyState';

jest.mock('@components/OptionsListSkeletonView', () => {
    const ReactLocal = jest.requireActual<typeof React>('react');
    const RN = jest.requireActual<typeof ReactNative>('react-native');
    return function MockOptionsListSkeletonView() {
        return ReactLocal.createElement(RN.View, {testID: 'options-list-skeleton'});
    };
});

describe('SelectionListEmptyState', () => {
    it('renders the loading skeleton while loading with no custom placeholder', () => {
        render(
            <SelectionListEmptyState
                shouldShowLoadingPlaceholder
                shouldShowListEmptyContent
                listEmptyContent={<View testID="empty" />}
                context="Test"
            />,
        );
        expect(screen.getByTestId('options-list-skeleton')).toBeTruthy();
        expect(screen.queryByTestId('empty')).toBeNull();
    });

    it('renders the custom loading placeholder instead of the skeleton when provided', () => {
        render(
            <SelectionListEmptyState
                shouldShowLoadingPlaceholder
                customLoadingPlaceholder={<View testID="custom-loading" />}
                shouldShowListEmptyContent
                listEmptyContent={<View testID="empty" />}
                context="Test"
            />,
        );
        expect(screen.getByTestId('custom-loading')).toBeTruthy();
        expect(screen.queryByTestId('options-list-skeleton')).toBeNull();
    });

    it('renders the empty content when not loading', () => {
        render(
            <SelectionListEmptyState
                shouldShowLoadingPlaceholder={false}
                shouldShowListEmptyContent
                listEmptyContent={<View testID="empty" />}
                context="Test"
            />,
        );
        expect(screen.getByTestId('empty')).toBeTruthy();
        expect(screen.queryByTestId('options-list-skeleton')).toBeNull();
    });

    it('renders nothing when not loading and empty content is disabled', () => {
        const {toJSON} = render(
            <SelectionListEmptyState
                shouldShowLoadingPlaceholder={false}
                shouldShowListEmptyContent={false}
                listEmptyContent={<View testID="empty" />}
                context="Test"
            />,
        );
        expect(screen.queryByTestId('empty')).toBeNull();
        expect(toJSON()).toBeNull();
    });
});
