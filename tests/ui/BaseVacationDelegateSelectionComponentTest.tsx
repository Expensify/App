import type * as ReactNavigation from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import React from 'react';
import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';
import SelectionList from '@components/SelectionList/SelectionListWithSections';
import type useInitialSelection from '@hooks/useInitialSelection';

const mockDelegateDetails = {
    accountID: 1,
    avatar: '',
    displayName: 'Vacation Delegate',
    login: 'delegate@example.com',
};
let mockSearchSelectorValue = {
    searchTerm: '',
    debouncedSearchTerm: '',
    setSearchTerm: jest.fn(),
    availableOptions: {
        recentReports: [
            {
                text: 'Recent User',
                alternateText: 'recent@example.com',
                login: 'recent@example.com',
                keyForList: 'recent@example.com',
                accountID: 2,
            },
        ],
        personalDetails: [
            {
                text: 'Contact User',
                alternateText: 'contact@example.com',
                login: 'contact@example.com',
                keyForList: 'contact@example.com',
                accountID: 3,
            },
        ],
        userToInvite: null,
    },
    areOptionsInitialized: true,
    onListEndReached: jest.fn(),
};

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/BlockingViews/FullPageOfflineBlockingView', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/DelegatorList', () => jest.fn(() => null));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/UserListItem', () => jest.fn(() => null));
jest.mock('@hooks/useInitialSelection', () => jest.requireActual<{default: typeof useInitialSelection}>('@hooks/useInitialSelection').default);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({FallbackAvatar: 'fallback-avatar'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useOnyx', () => jest.fn((key: string) => (key === 'countryCode' ? ['US'] : [false])));
jest.mock('@hooks/useSearchSelector', () => jest.fn(() => mockSearchSelectorValue));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        flex1: {},
        mt6: {},
        pRelative: {},
        w100: {},
    })),
);
jest.mock('@libs/actions/Report', () => ({
    searchUserInServer: jest.fn(),
}));
jest.mock('@libs/LocalePhoneNumber', () => ({
    formatPhoneNumber: jest.fn((value: string) => value),
}));
jest.mock('@libs/OptionsListUtils', () => ({
    getHeaderMessage: jest.fn(() => ''),
}));
jest.mock('@libs/PersonalDetailsUtils', () => ({
    getPersonalDetailByEmail: jest.fn((email: string) => (email === mockDelegateDetails.login ? mockDelegateDetails : undefined)),
}));

describe('BaseVacationDelegateSelectionComponent', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockSearchSelectorValue = {
            ...mockSearchSelectorValue,
            searchTerm: '',
            debouncedSearchTerm: '',
            setSearchTerm: jest.fn(),
        };
    });

    it('pins the initial vacation delegate to the top on open', () => {
        render(
            <BaseVacationDelegateSelectionComponent
                vacationDelegate={{delegate: mockDelegateDetails.login}}
                onSelectRow={jest.fn()}
                headerTitle="Vacation delegate"
                cannotSetDelegateMessage="Cannot set delegate"
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections.at(0)?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: `vacationDelegate-${mockDelegateDetails.login}`,
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe(`vacationDelegate-${mockDelegateDetails.login}`);
        expect(selectionListProps?.searchValueForFocusSync).toBe('');
        expect(selectionListProps?.initialScrollIndex).toBe(0);
        expect(selectionListProps?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the initial delegate pinned while the live selected delegate changes in place', () => {
        const {rerender} = render(
            <BaseVacationDelegateSelectionComponent
                vacationDelegate={{delegate: mockDelegateDetails.login}}
                onSelectRow={jest.fn()}
                headerTitle="Vacation delegate"
                cannotSetDelegateMessage="Cannot set delegate"
            />,
        );

        rerender(
            <BaseVacationDelegateSelectionComponent
                vacationDelegate={{delegate: 'contact@example.com'}}
                onSelectRow={jest.fn()}
                headerTitle="Vacation delegate"
                cannotSetDelegateMessage="Cannot set delegate"
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections.at(0)?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: `vacationDelegate-${mockDelegateDetails.login}`,
                isSelected: false,
            }),
        );
        expect(selectionListProps?.sections.at(2)?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'contact@example.com',
                isSelected: true,
            }),
        );
    });

    it('keeps natural sections while search is active', () => {
        mockSearchSelectorValue = {
            ...mockSearchSelectorValue,
            searchTerm: 'Recent',
            debouncedSearchTerm: 'Recent',
        };

        render(
            <BaseVacationDelegateSelectionComponent
                vacationDelegate={{delegate: mockDelegateDetails.login}}
                onSelectRow={jest.fn()}
                headerTitle="Vacation delegate"
                cannotSetDelegateMessage="Cannot set delegate"
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections.at(0)?.title).toBe('common.recents');
        expect(selectionListProps?.sections.at(0)?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'recent@example.com',
            }),
        );
        expect(selectionListProps?.sections.some((section) => section.data.some((item) => item.keyForList === `vacationDelegate-${mockDelegateDetails.login}`))).toBe(false);
        expect(selectionListProps?.searchValueForFocusSync).toBe('Recent');
    });

    it('does not show the selection list when active delegations block delegate changes', () => {
        render(
            <BaseVacationDelegateSelectionComponent
                vacationDelegate={{delegate: mockDelegateDetails.login, delegatorFor: ['delegator@example.com']}}
                onSelectRow={jest.fn()}
                headerTitle="Vacation delegate"
                cannotSetDelegateMessage="Cannot set delegate"
            />,
        );

        expect(mockedSelectionList).not.toHaveBeenCalled();
    });
});
