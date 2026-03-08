import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Button from '@components/Button';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import SelectionList from '@components/SelectionList';

jest.useFakeTimers();

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/Button', () => jest.fn(() => null));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useResponsiveLayout', () =>
    jest.fn(() => ({
        isSmallScreenWidth: false,
    })),
);
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        pv4: {},
        gap2: {},
        textLabel: {},
        textSupporting: {},
        ph5: {},
        pv1: {},
        flexRow: {},
        flex1: {},
        getSelectionListPopoverHeight: () => ({}),
    })),
);
jest.mock('@hooks/useWindowDimensions', () =>
    jest.fn(() => ({
        windowHeight: 1000,
    })),
);

type PopupItem = {
    text: string;
    value: string;
};

const ITEMS: PopupItem[] = [
    {text: 'AUD - A$', value: 'AUD'},
    {text: 'BRL - BR$', value: 'BRL'},
    {text: 'CAD - C$', value: 'CAD'},
    {text: 'CHF - CHF', value: 'CHF'},
    {text: 'EUR - EUR', value: 'EUR'},
    {text: 'GBP - GBP', value: 'GBP'},
    {text: 'JPY - JPY', value: 'JPY'},
    {text: 'MXN - MX$', value: 'MXN'},
    {text: 'USD - US$', value: 'USD'},
    {text: 'ZAR - R', value: 'ZAR'},
];

function renderPopup(value: PopupItem | null = ITEMS.at(1) ?? null) {
    return render(
        <SingleSelectPopup
            label="common.groupCurrency"
            items={ITEMS}
            value={value}
            closeOverlay={jest.fn()}
            onChange={jest.fn()}
            isSearchable
            searchPlaceholder="common.groupCurrency"
            isVisible
        />,
    );
}

describe('SingleSelectPopup', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const mockedButton = jest.mocked(Button);

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockedButton.mockClear();
        jest.clearAllTimers();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('pins the initially selected item to the top and disables focus-driven scrolling', () => {
        renderPopup();

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        expect(initialProps?.data.at(0)).toEqual(
            expect.objectContaining({
                value: 'BRL',
                isSelected: true,
            }),
        );
        expect(initialProps?.shouldUpdateFocusedIndex).toBe(false);
        expect(initialProps?.shouldScrollToFocusedIndex).toBe(false);
        expect(initialProps?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(initialProps?.initiallyFocusedItemKey).toBe('BRL');
    });

    it('keeps the initial focus target stable and does not reorder while the selected item changes during the same open cycle', () => {
        renderPopup();

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.onSelectRow?.({
                keyForList: 'CAD',
            });
        });

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps?.initiallyFocusedItemKey).toBe('BRL');
        expect(updatedProps?.data.at(0)).toEqual(
            expect.objectContaining({
                value: 'BRL',
                isSelected: false,
            }),
        );
        expect(updatedProps?.data.find((item) => item.value === 'CAD')).toEqual(
            expect.objectContaining({
                value: 'CAD',
                isSelected: true,
            }),
        );
    });

    it('refreshes the pinned item when reopened with a different selected value', () => {
        const {unmount} = renderPopup();
        unmount();
        mockedSelectionList.mockClear();

        renderPopup(ITEMS.at(4) ?? null);

        const reopenedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(reopenedProps?.data.at(0)).toEqual(
            expect.objectContaining({
                value: 'EUR',
                isSelected: true,
            }),
        );
        expect(reopenedProps?.initiallyFocusedItemKey).toBe('EUR');
    });

    it('keeps natural filtered ordering while search is active', () => {
        renderPopup();

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('c');
            jest.runAllTimers();
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(searchedProps?.data.at(0)?.value).toBe('CAD');
        expect(searchedProps?.data.at(1)?.value).toBe('CHF');
    });
});
