import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import Navigation from '@libs/Navigation/Navigation';
import {getUrlWithParams} from '@libs/Url';
import {AddDelegatePage} from '@pages/settings/Security/AddDelegate/AddDelegatePage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});
jest.mock('@components/DelegateNoAccessWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useOnyx');
jest.mock('@hooks/useSearchSelector');
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        flex1: {},
        w100: {},
        pRelative: {},
    })),
);
jest.mock('@libs/actions/Report', () => ({
    searchUserInServer: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
}));

type MockedUseSearchSelector = jest.MockedFunction<typeof useSearchSelector>;
type MockedUseOnyx = jest.MockedFunction<typeof useOnyx>;

describe('AddDelegatePage', () => {
    const mockedSelectionListWithSections = jest.mocked(SelectionListWithSections);
    const mockedUseSearchSelector = useSearchSelector as MockedUseSearchSelector;
    const mockedUseOnyx = useOnyx as MockedUseOnyx;
    const mockedNavigate = jest.mocked(Navigation.navigate);

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseOnyx.mockImplementation((key) => {
            switch (key) {
                case ONYXKEYS.IS_SEARCHING_FOR_REPORTS:
                    return [false, jest.fn()] as ReturnType<typeof useOnyx>;
                case ONYXKEYS.ACCOUNT:
                    return [{delegatedAccess: {delegates: []}}, jest.fn()] as ReturnType<typeof useOnyx>;
                case ONYXKEYS.COUNTRY_CODE:
                    return [CONST.DEFAULT_COUNTRY_CODE, jest.fn()] as ReturnType<typeof useOnyx>;
                case ONYXKEYS.PERSONAL_DETAILS_LIST:
                    return [
                        {
                            selectedDelegate: {
                                accountID: 1,
                                login: 'selected@test.com',
                                displayName: 'Selected User',
                                avatar: 'avatar-url',
                            },
                        },
                        jest.fn(),
                    ] as ReturnType<typeof useOnyx>;
                default:
                    return [undefined, jest.fn()] as ReturnType<typeof useOnyx>;
            }
        });

        mockedUseSearchSelector.mockImplementation((config) =>
            ({
                searchTerm: '',
                debouncedSearchTerm: '',
                setSearchTerm: jest.fn(),
                searchOptions: {
                    recentReports: [
                        {
                            login: 'selected@test.com',
                            text: 'Selected User',
                            keyForList: 'selected',
                            accountID: 1,
                            isSelected: true,
                        },
                        {
                            login: 'recent@test.com',
                            text: 'Recent User',
                            keyForList: 'recent',
                            accountID: 2,
                        },
                        {
                            login: 'recent2@test.com',
                            text: 'Recent User 2',
                            keyForList: 'recent2',
                            accountID: 4,
                        },
                        {
                            login: 'recent3@test.com',
                            text: 'Recent User 3',
                            keyForList: 'recent3',
                            accountID: 5,
                        },
                        {
                            login: 'recent4@test.com',
                            text: 'Recent User 4',
                            keyForList: 'recent4',
                            accountID: 6,
                        },
                    ],
                    personalDetails: [
                        {
                            login: 'selected@test.com',
                            text: 'Selected User',
                            keyForList: 'selected-contact',
                            accountID: 1,
                            isSelected: true,
                        },
                        {
                            login: 'contact@test.com',
                            text: 'Contact User',
                            keyForList: 'contact',
                            accountID: 3,
                        },
                        {
                            login: 'contact2@test.com',
                            text: 'Contact User 2',
                            keyForList: 'contact2',
                            accountID: 7,
                        },
                        {
                            login: 'contact3@test.com',
                            text: 'Contact User 3',
                            keyForList: 'contact3',
                            accountID: 8,
                        },
                        {
                            login: 'contact4@test.com',
                            text: 'Contact User 4',
                            keyForList: 'contact4',
                            accountID: 9,
                        },
                    ],
                    userToInvite: null,
                    currentUserOption: null,
                },
                availableOptions: {
                    recentReports: [],
                    personalDetails: [],
                    userToInvite: null,
                    currentUserOption: null,
                },
                selectedOptions: config.initialSelected ?? [],
                selectedOptionsForDisplay: config.initialSelected ?? [],
                setSelectedOptions: jest.fn(),
                toggleSelection: (option) => config.onSingleSelect?.(option),
                areOptionsInitialized: true,
                contactState: undefined,
                onListEndReached: jest.fn(),
            }) as ReturnType<typeof useSearchSelector>,
        );
    });

    it('seeds the selected delegate from route params and shows it in the top section', () => {
        render(
            <AddDelegatePage
                route={{key: '', name: '', params: {login: 'selected@test.com'}} as never}
                navigation={{} as never}
            />,
        );

        expect(mockedUseSearchSelector).toHaveBeenCalledWith(
            expect.objectContaining({
                initialSelected: [expect.objectContaining({login: 'selected@test.com'})],
                prioritizeSelectedOnToggle: false,
            }),
        );

        const selectionListProps = mockedSelectionListWithSections.mock.lastCall?.[0];
        expect(selectionListProps?.sections[0].data).toEqual([expect.objectContaining({login: 'selected@test.com', isSelected: true})]);
        expect(selectionListProps?.sections[1].data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'recent@test.com'})]));
        expect(selectionListProps?.sections[1].data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'selected@test.com'})]));
        expect(selectionListProps?.sections[2].data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'contact@test.com'})]));
        expect(selectionListProps?.sections[2].data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'selected@test.com'})]));
    });

    it('navigates to the delegate role page with an add-delegate backTo route that preserves the selected login', () => {
        render(
            <AddDelegatePage
                route={{key: '', name: '', params: {}} as never}
                navigation={{} as never}
            />,
        );

        const selectionListProps = mockedSelectionListWithSections.mock.lastCall?.[0];

        act(() => {
            selectionListProps?.onSelectRow({
                login: 'pick@test.com',
                text: 'Pick User',
                keyForList: 'pick',
                accountID: 10,
            });
        });

        expect(mockedNavigate).toHaveBeenCalledWith(
            ROUTES.SETTINGS_DELEGATE_ROLE.getRoute('pick@test.com', undefined, getUrlWithParams(ROUTES.SETTINGS_ADD_DELEGATE, {login: 'pick@test.com'})),
        );
    });
});
