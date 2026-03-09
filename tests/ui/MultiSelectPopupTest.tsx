import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import Button from '@components/Button';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
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

const DEFAULT_SELECTED_ITEMS = [ITEMS.at(1), ITEMS.at(8)].filter((item): item is PopupItem => !!item);

function renderPopup(value: PopupItem[] = DEFAULT_SELECTED_ITEMS) {
    return render(
        <MultiSelectPopup
            label="common.groupCurrency"
            items={ITEMS}
            value={value}
            closeOverlay={jest.fn()}
            onChange={jest.fn()}
            isSearchable
            shouldMoveSelectedItemsToTopOnOpen
            isVisible
        />,
    );
}

describe('MultiSelectPopup', () => {
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

    it('pins the initially selected items to the top on open', () => {
        renderPopup();

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        expect(initialProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'BRL',
                isSelected: true,
            }),
        );
        expect(initialProps?.data.at(1)).toEqual(
            expect.objectContaining({
                keyForList: 'USD',
                isSelected: true,
            }),
        );
    });

    it('keeps the initially pinned items at the top while live selection changes during the same open cycle', () => {
        renderPopup();

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.onSelectRow?.({
                keyForList: 'CAD',
                isSelected: false,
            });
        });

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'BRL',
                isSelected: true,
            }),
        );
        expect(updatedProps?.data.at(1)).toEqual(
            expect.objectContaining({
                keyForList: 'USD',
                isSelected: true,
            }),
        );
        expect(updatedProps?.data.find((item) => item.keyForList === 'CAD')).toEqual(
            expect.objectContaining({
                keyForList: 'CAD',
                isSelected: true,
            }),
        );
    });

    it('keeps natural filtered ordering while search is active', () => {
        renderPopup();

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('c');
            jest.runAllTimers();
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(searchedProps?.data.at(0)?.keyForList).toBe('CAD');
        expect(searchedProps?.data.at(1)?.keyForList).toBe('CHF');
    });
});
