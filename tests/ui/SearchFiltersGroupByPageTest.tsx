import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import type {UseOnyxResult} from 'react-native-onyx';
import Button from '@components/Button';
import SelectionList from '@components/SelectionList';
import useOnyx from '@hooks/useOnyx';
import {SearchFiltersGroupByPage} from '@pages/Search/SearchAdvancedFiltersPage/SearchFiltersGroupByPage';
import CONST from '@src/CONST';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/Button', () => jest.fn(() => null));
jest.mock('@components/FixedFooter', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useOnyx');
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        flex1: {},
        mtAuto: {},
        mt4: {},
    })),
);
jest.mock('@libs/actions/Search', () => ({
    updateAdvancedFilters: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));

describe('SearchFiltersGroupByPage', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const mockedButton = jest.mocked(Button);
    const mockedUseOnyx = jest.mocked(useOnyx);
    let mockGroupBy: string | undefined;

    const buildOnyxResult = <T,>(value: NonNullable<T> | undefined): UseOnyxResult<T> => [value, {status: 'loaded'}];

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockedButton.mockClear();
        mockGroupBy = CONST.SEARCH.GROUP_BY.MERCHANT;
        mockedUseOnyx.mockImplementation(() => buildOnyxResult({groupBy: mockGroupBy}) as ReturnType<typeof useOnyx>);
    });

    it('pins the saved group by value to the top on reopen', () => {
        render(<SearchFiltersGroupByPage />);

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: CONST.SEARCH.GROUP_BY.MERCHANT,
                isSelected: true,
            }),
        );
    });

    it('keeps the originally pinned row at the top while a different row is selected during the same mount', () => {
        render(<SearchFiltersGroupByPage />);

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        const initiallyPinnedRow = initialProps?.data.at(0);

        act(() => {
            initialProps?.onSelectRow({
                keyForList: CONST.SEARCH.GROUP_BY.TAG,
            });
        });

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: CONST.SEARCH.GROUP_BY.MERCHANT,
                isSelected: false,
            }),
        );
        expect(updatedProps?.data.find((item) => item.keyForList === CONST.SEARCH.GROUP_BY.TAG)).toEqual(
            expect.objectContaining({
                keyForList: CONST.SEARCH.GROUP_BY.TAG,
                isSelected: true,
            }),
        );
        expect(initiallyPinnedRow?.keyForList).toBe(CONST.SEARCH.GROUP_BY.MERCHANT);
    });

    it('keeps the originally pinned row at the top but unchecked after reset', () => {
        render(<SearchFiltersGroupByPage />);

        const resetButtonProps = mockedButton.mock.calls.find(([props]) => props.text === 'common.reset')?.[0];

        act(() => {
            resetButtonProps?.onPress?.();
        });

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: CONST.SEARCH.GROUP_BY.MERCHANT,
                isSelected: false,
            }),
        );
    });

    it('keeps the natural order when there is no saved group by value', () => {
        mockGroupBy = undefined;

        render(<SearchFiltersGroupByPage />);

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: CONST.SEARCH.GROUP_BY.FROM,
                isSelected: false,
            }),
        );
    });
});
