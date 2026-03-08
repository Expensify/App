import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import type {UseOnyxResult} from 'react-native-onyx';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import type {UseSearchSelectorReturn} from '@hooks/useSearchSelector.base';
import Navigation from '@libs/Navigation/Navigation';
import {getEmptyOptions} from '@libs/OptionsListUtils';
import type {Options, SearchOptionData} from '@libs/OptionsListUtils';
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

function buildOnyxResult<T>(value: T): UseOnyxResult<T> {
    return [value, jest.fn()] as unknown as UseOnyxResult<T>;
}

function buildOption(login: string, text: string, keyForList: string, accountID: number, isSelected = false): SearchOptionData {
    return {
        login,
        text,
        alternateText: login,
        displayName: text,
        keyForList,
        accountID,
        reportID: '',
        isSelected,
        selected: isSelected,
        icons: [],
    };
}

function buildOptions(overrides: Partial<Options> = {}): Options {
    return {
        ...getEmptyOptions(),
        ...overrides,
    };
}

function buildSearchSelectorReturn(
    config: Parameters<typeof useSearchSelector>[0],
    overrides: Omit<Partial<UseSearchSelectorReturn>, 'searchOptions' | 'availableOptions'> & {
        searchOptions?: Partial<Options>;
        availableOptions?: Partial<Options>;
    } = {},
): UseSearchSelectorReturn {
    const {searchOptions, availableOptions, ...rest} = overrides;

    return {
        searchTerm: '',
        debouncedSearchTerm: '',
        setSearchTerm: jest.fn(),
        searchOptions: buildOptions(searchOptions),
        availableOptions: buildOptions(availableOptions),
        selectedOptions: config.initialSelected ?? [],
        selectedOptionsForDisplay: config.initialSelected ?? [],
        setSelectedOptions: jest.fn(),
        toggleSelection: (option) => config.onSingleSelect?.(option),
        areOptionsInitialized: true,
        onListEndReached: jest.fn(),
        ...rest,
    };
}

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
                    return buildOnyxResult(false);
                case ONYXKEYS.ACCOUNT:
                    return buildOnyxResult({delegatedAccess: {delegates: []}});
                case ONYXKEYS.COUNTRY_CODE:
                    return buildOnyxResult(CONST.DEFAULT_COUNTRY_CODE);
                case ONYXKEYS.PERSONAL_DETAILS_LIST:
                    return buildOnyxResult({
                        selectedDelegate: {
                            accountID: 1,
                            login: 'selected@test.com',
                            displayName: 'Selected User',
                            avatar: 'avatar-url',
                        },
                    });
                default:
                    return buildOnyxResult(undefined);
            }
        });

        mockedUseSearchSelector.mockImplementation((config) =>
            buildSearchSelectorReturn(config, {
                searchOptions: {
                    recentReports: [
                        buildOption('selected@test.com', 'Selected User', 'selected', 1, true),
                        buildOption('recent@test.com', 'Recent User', 'recent', 2),
                        buildOption('recent2@test.com', 'Recent User 2', 'recent2', 4),
                        buildOption('recent3@test.com', 'Recent User 3', 'recent3', 5),
                        buildOption('recent4@test.com', 'Recent User 4', 'recent4', 6),
                    ],
                    personalDetails: [
                        buildOption('selected@test.com', 'Selected User', 'selected-contact', 1, true),
                        buildOption('contact@test.com', 'Contact User', 'contact', 3),
                        buildOption('contact2@test.com', 'Contact User 2', 'contact2', 7),
                        buildOption('contact3@test.com', 'Contact User 3', 'contact3', 8),
                        buildOption('contact4@test.com', 'Contact User 4', 'contact4', 9),
                    ],
                },
            }),
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
