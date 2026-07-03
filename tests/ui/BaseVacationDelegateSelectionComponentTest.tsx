import BaseVacationDelegateSelectionComponent from '@components/BaseVacationDelegateSelectionComponent';
import SelectionList from '@components/SelectionList/SelectionListWithSections';

import type useInitialSelection from '@hooks/useInitialSelection';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';

import type * as OptionsListUtils from '@libs/OptionsListUtils';

import type * as ReactNavigation from '@react-navigation/native';

import {render} from '@testing-library/react-native';
import React from 'react';

type SearchSelectorConfig = Parameters<typeof usePersonalDetailSearchSelector>[0];

const mockDelegateDetails = {
    accountID: 1,
    avatar: '',
    displayName: 'Vacation Delegate',
    login: 'delegate@example.com',
};
const mockContactDetails = {
    accountID: 3,
    avatar: '',
    displayName: 'Contact User',
    login: 'contact@example.com',
};
const getMockSearchSelectorValue = () => ({
    searchTerm: '',
    debouncedSearchTerm: '',
    setSearchTerm: jest.fn(),
    availableOptions: {
        recentOptions: [
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
});
let mockSearchSelectorValue = getMockSearchSelectorValue();
let mockSearchSelectorConfig: SearchSelectorConfig | undefined;

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
jest.mock('@hooks/usePersonalDetailSearchSelector', () =>
    jest.fn((config: SearchSelectorConfig) => {
        mockSearchSelectorConfig = config;
        return mockSearchSelectorValue;
    }),
);
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
jest.mock('@libs/OptionsListUtils', () => {
    const actualOptionsListUtils: typeof OptionsListUtils = jest.requireActual('@libs/OptionsListUtils');

    return {
        ...actualOptionsListUtils,
        getHeaderMessage: jest.fn(() => ''),
    };
});
jest.mock('@libs/PersonalDetailsUtils', () => ({
    getPersonalDetailByEmail: jest.fn((email: string) => {
        if (email === mockDelegateDetails.login) {
            return mockDelegateDetails;
        }
        if (email === mockContactDetails.login) {
            return mockContactDetails;
        }
        return undefined;
    }),
}));

describe('BaseVacationDelegateSelectionComponent', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const mockedUsePersonalDetailSearchSelector = jest.mocked(usePersonalDetailSearchSelector);

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockedUsePersonalDetailSearchSelector.mockClear();
        mockSearchSelectorValue = getMockSearchSelectorValue();
        mockSearchSelectorConfig = undefined;
    });

    it('pins the initial vacation delegate to the top on open', () => {
        mockSearchSelectorValue = {
            ...mockSearchSelectorValue,
            availableOptions: {
                ...mockSearchSelectorValue.availableOptions,
                personalDetails: [
                    {
                        text: 'Contact User',
                        alternateText: 'contact@example.com',
                        login: 'contact@example.com',
                        keyForList: 'contact@example.com',
                        accountID: 3,
                    },
                    {
                        text: mockDelegateDetails.displayName,
                        alternateText: mockDelegateDetails.login,
                        login: mockDelegateDetails.login,
                        keyForList: mockDelegateDetails.login,
                        accountID: mockDelegateDetails.accountID,
                    },
                ],
            },
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
        expect(selectionListProps?.sections.flatMap((section) => section.data).filter((item) => item.login === mockDelegateDetails.login)).toHaveLength(1);
        expect(mockSearchSelectorConfig?.excludeLogins?.[mockDelegateDetails.login]).not.toBe(true);
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

    it('pins the selected delegate when it matches the search result', () => {
        mockSearchSelectorValue = {
            ...mockSearchSelectorValue,
            searchTerm: 'Contact',
            debouncedSearchTerm: 'Contact',
            availableOptions: {
                ...mockSearchSelectorValue.availableOptions,
                recentOptions: [],
                personalDetails: [
                    {
                        text: mockContactDetails.displayName,
                        alternateText: mockContactDetails.login,
                        login: mockContactDetails.login,
                        keyForList: mockContactDetails.login,
                        accountID: mockContactDetails.accountID,
                    },
                ],
            },
        };

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
                vacationDelegate={{delegate: mockContactDetails.login}}
                onSelectRow={jest.fn()}
                headerTitle="Vacation delegate"
                cannotSetDelegateMessage="Cannot set delegate"
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections.at(0)?.title).toBeUndefined();
        expect(selectionListProps?.sections.at(0)?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: `vacationDelegate-${mockContactDetails.login}`,
                isSelected: true,
            }),
        );
        expect(selectionListProps?.sections.flatMap((section) => section.data).filter((item) => item.login === mockContactDetails.login)).toHaveLength(1);
        expect(selectionListProps?.searchValueForFocusSync).toBe('Contact');
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
