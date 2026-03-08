import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import UserSelectPopup from '@components/Search/FilterDropdowns/UserSelectPopup';
import SelectionList from '@components/SelectionList';
import usePersonalDetailOptions from '@hooks/usePersonalDetailOptions';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/Button', () => jest.fn(() => null));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails', () =>
    jest.fn(() => ({
        email: 'current@test.com',
    })),
);
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        formatPhoneNumber: (value: string) => value,
    })),
);
jest.mock('@hooks/useOnyx', () =>
    jest.fn((key: string) => {
        if (key === 'countryCode') {
            return [1];
        }
        if (key === 'loginList') {
            return [{}];
        }
        if (key === 'isSearchingForReports') {
            return [false];
        }
        return [undefined];
    }),
);
jest.mock('@hooks/usePersonalDetailOptions', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        shouldUseNarrowLayout: false,
    })),
);
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        getUserSelectionListPopoverHeight: () => ({}),
        pt4: {},
        pb2: {},
        flexRow: {},
        gap2: {},
        mh5: {},
        mb4: {},
        flex1: {},
    })),
);
jest.mock('@hooks/useWindowDimensions', () =>
    jest.fn(() => ({
        windowHeight: 800,
    })),
);

function buildOption(accountID: number): OptionData {
    return {
        accountID,
        keyForList: String(accountID),
        login: `user${accountID}@test.com`,
        text: `User ${String(accountID).padStart(2, '0')}`,
        alternateText: `user${accountID}@test.com`,
        icons: [],
    };
}

describe('UserSelectPopup', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const mockedUsePersonalDetailOptions = jest.mocked(usePersonalDetailOptions);

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockedUsePersonalDetailOptions.mockReturnValue({
            currentOption: undefined,
            isLoading: false,
            options: Array.from({length: 10}, (_, index) => buildOption(index + 1)),
        });
    });

    function renderPopup(value: string[] = ['2', '5'], isSearchable?: boolean) {
        return render(
            <UserSelectPopup
                value={value}
                closeOverlay={jest.fn()}
                onChange={jest.fn()}
                isVisible
                isSearchable={isSearchable}
            />,
        );
    }

    it('pins initially selected users on open and disables scroll-to-top-on-select', () => {
        renderPopup();

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps).toBeDefined();
        expect(selectionListProps?.data.slice(0, 2).map((item) => item.accountID)).toEqual([2, 5]);
        expect(selectionListProps?.shouldScrollToTopOnSelect).toBe(false);
    });

    it('keeps a newly selected user in place during the same open cycle', () => {
        renderPopup();

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        const targetIndex = initialProps?.data.findIndex((item) => item.accountID === 8) ?? -1;
        expect(targetIndex).toBeGreaterThanOrEqual(0);

        act(() => {
            const targetRow = initialProps?.data.at(targetIndex);
            if (!targetRow) {
                throw new Error('Expected target row to exist');
            }
            initialProps?.onSelectRow?.(targetRow);
        });

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        const updatedIndex = updatedProps?.data.findIndex((item) => item.accountID === 8) ?? -1;
        expect(updatedIndex).toBe(targetIndex);
        expect(updatedProps?.data.find((item) => item.accountID === 8)?.isSelected).toBe(true);
        expect(updatedProps?.data.slice(0, 2).map((item) => item.accountID)).toEqual([2, 5]);
    });

    it('keeps deselected initial users pinned but unchecked', () => {
        renderPopup();

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        expect(initialProps?.data.at(0)?.accountID).toBe(2);
        expect(initialProps?.data.at(0)?.isSelected).toBe(true);

        act(() => {
            const selectedRow = initialProps?.data.at(0);
            if (!selectedRow) {
                throw new Error('Expected initially selected row to exist');
            }
            initialProps?.onSelectRow?.(selectedRow);
        });

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps?.data.at(0)?.accountID).toBe(2);
        expect(updatedProps?.data.at(0)?.isSelected).toBe(false);
    });

    it('keeps filtered results in natural order while search is active', () => {
        renderPopup(['2', '5'], true);

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('user 0');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(searchedProps?.data.at(0)?.accountID).toBe(1);
        expect(searchedProps?.data.findIndex((item) => item.accountID === 2)).toBeGreaterThan(0);
    });

    it('keeps preselected users when options hydrate after the popup becomes visible', () => {
        mockedUsePersonalDetailOptions.mockReturnValueOnce({
            currentOption: undefined,
            isLoading: true,
            options: undefined,
        });

        const {rerender} = render(
            <UserSelectPopup
                value={['2', '5']}
                closeOverlay={jest.fn()}
                onChange={jest.fn()}
                isVisible
            />,
        );

        const loadingProps = mockedSelectionList.mock.lastCall?.[0];
        expect(loadingProps?.shouldShowLoadingPlaceholder).toBe(true);

        mockedUsePersonalDetailOptions.mockReturnValue({
            currentOption: undefined,
            isLoading: false,
            options: Array.from({length: 10}, (_, index) => buildOption(index + 1)),
        });

        rerender(
            <UserSelectPopup
                value={['2', '5']}
                closeOverlay={jest.fn()}
                onChange={jest.fn()}
                isVisible
            />,
        );

        const hydratedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(hydratedProps?.shouldShowLoadingPlaceholder).toBe(false);
        expect(hydratedProps?.data.slice(0, 2).map((item) => item.accountID)).toEqual([2, 5]);
        expect(hydratedProps?.data.find((item) => item.accountID === 2)?.isSelected).toBe(true);
        expect(hydratedProps?.data.find((item) => item.accountID === 5)?.isSelected).toBe(true);
    });
});
