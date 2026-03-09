import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import SelectionList from '@components/SelectionList';
import CustomCloseDateSelectionList from '@pages/workspace/companyCards/WorkspaceCompanyCardStatementCloseDateSelectionList/CustomCloseDateSelectionList';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/FormHelpMessage', () => jest.fn(() => null));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/SingleSelectListItem', () => jest.fn(() => null));

const mockUseState = React.useState;

jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        mt3: {},
        ph5: {},
    })),
);

describe('CustomCloseDateSelectionList', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('keeps the initial selected day at the top and suppresses focus-driven scroll while the live selection changes', () => {
        render(
            <CustomCloseDateSelectionList
                initiallySelectedDay={18}
                onConfirmSelectedDay={jest.fn()}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        expect(initialProps).toBeDefined();
        expect(initialProps?.data.at(0)?.keyForList).toBe('18');
        expect(initialProps?.initiallyFocusedItemKey).toBe('18');
        expect(initialProps?.shouldScrollToFocusedIndex).toBe(false);
        expect(initialProps?.shouldScrollToFocusedIndexOnMount).toBe(false);
        expect(initialProps?.shouldUpdateFocusedIndex).toBeUndefined();

        act(() => {
            const targetRow = initialProps?.data.find((item) => item.keyForList === '14');
            if (!targetRow) {
                throw new Error('Expected target row to exist');
            }
            initialProps?.onSelectRow?.(targetRow);
        });

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps).toBeDefined();
        expect(updatedProps?.data.at(0)?.keyForList).toBe('18');
        expect(updatedProps?.initiallyFocusedItemKey).toBe('18');
        expect(updatedProps?.data.find((item) => item.keyForList === '14')?.isSelected).toBe(true);
    });

    it('refreshes the pinned selected day when reopened', () => {
        const {unmount} = render(
            <CustomCloseDateSelectionList
                initiallySelectedDay={18}
                onConfirmSelectedDay={jest.fn()}
            />,
        );
        unmount();
        mockedSelectionList.mockClear();

        render(
            <CustomCloseDateSelectionList
                initiallySelectedDay={24}
                onConfirmSelectedDay={jest.fn()}
            />,
        );

        const reopenedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(reopenedProps?.data.at(0)?.keyForList).toBe('24');
        expect(reopenedProps?.initiallyFocusedItemKey).toBe('24');
    });

    it('keeps natural filtered ordering while search is active', () => {
        render(
            <CustomCloseDateSelectionList
                initiallySelectedDay={18}
                onConfirmSelectedDay={jest.fn()}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('1');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(searchedProps?.data.at(0)?.keyForList).toBe('1');
        expect(searchedProps?.data.findIndex((item) => item.keyForList === '18')).toBeGreaterThan(0);
    });
});
