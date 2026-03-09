import {act, render} from '@testing-library/react-native';
import React from 'react';
import type {UseOnyxResult} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SearchFiltersParticipantsSelector from '@components/Search/SearchFiltersParticipantsSelector';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {getEmptyOptions, getValidOptions} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: jest.fn(),
}));
jest.mock('@components/OptionListContextProvider', () => ({
    useOptionsList: jest.fn(),
}));
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails');
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        formatPhoneNumber: (value: string) => value,
    })),
);
jest.mock('@hooks/useOnyx');
jest.mock('@hooks/useReportAttributes');
jest.mock('@hooks/useScreenWrapperTransitionStatus');
jest.mock('@libs/DeviceCapabilities', () => ({
    canUseTouchScreen: jest.fn(() => true),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));
jest.mock('@libs/OptionsListUtils', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@libs/OptionsListUtils');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        ...actual,
        getValidOptions: jest.fn(),
        filterAndOrderOptions: jest.fn((options: {personalDetails: Array<Record<string, unknown>>; recentReports: Array<Record<string, unknown>>}) => ({
            ...options,
            personalDetails: [...options.personalDetails],
            recentReports: [...options.recentReports],
        })),
        formatSectionsFromSearchTerm: jest.fn(() => ({
            section: {
                data: [],
                sectionIndex: 0,
            },
        })),
        getFilteredRecentAttendees: jest.fn(() => []),
    };
});

type Options = ReturnType<typeof getEmptyOptions>;
type SearchOptionData = Options['personalDetails'][number];

function buildOnyxResult<T>(value: T): UseOnyxResult<T> {
    return [value, jest.fn()] as unknown as UseOnyxResult<T>;
}

function buildSearchOption(accountID: number, login: string, text: string, keyForList: string, avatar: string, isSelected = false): SearchOptionData {
    return {
        reportID: '',
        accountID,
        login,
        text,
        displayName: text,
        alternateText: login,
        keyForList,
        icons: [{source: avatar, name: text, type: CONST.ICON_TYPE_AVATAR}],
        isSelected,
        selected: isSelected,
    };
}

function buildOptions(overrides: Partial<Options> = {}): Options {
    return {
        ...getEmptyOptions(),
        ...overrides,
    };
}

describe('SearchFiltersParticipantsSelector', () => {
    const mockedSelectionList = jest.mocked(SelectionListWithSections);
    const mockedUseOptionsList = jest.mocked(useOptionsList);
    const mockedUsePersonalDetails = jest.mocked(usePersonalDetails);
    const mockedUseCurrentUserPersonalDetails = jest.mocked(useCurrentUserPersonalDetails);
    const mockedUseOnyx = jest.mocked(useOnyx);
    const mockedGetValidOptions = jest.mocked(getValidOptions);

    beforeEach(() => {
        jest.clearAllMocks();

        mockedUsePersonalDetails.mockReturnValue(
            Object.fromEntries([
                [
                    1,
                    {
                        accountID: 1,
                        login: 'current@test.com',
                        displayName: 'Current User',
                        avatar: 'avatar-url',
                    },
                ],
                [
                    2,
                    {
                        accountID: 2,
                        login: 'recent@test.com',
                        displayName: 'Recent User',
                        avatar: 'recent-avatar',
                    },
                ],
                [
                    3,
                    {
                        accountID: 3,
                        login: 'contact@test.com',
                        displayName: 'Contact User',
                        avatar: 'contact-avatar',
                    },
                ],
                [
                    4,
                    {
                        accountID: 4,
                        login: 'recent2@test.com',
                        displayName: 'Recent User 2',
                        avatar: 'recent2-avatar',
                    },
                ],
                [
                    5,
                    {
                        accountID: 5,
                        login: 'recent3@test.com',
                        displayName: 'Recent User 3',
                        avatar: 'recent3-avatar',
                    },
                ],
                [
                    6,
                    {
                        accountID: 6,
                        login: 'recent4@test.com',
                        displayName: 'Recent User 4',
                        avatar: 'recent4-avatar',
                    },
                ],
                [
                    7,
                    {
                        accountID: 7,
                        login: 'contact2@test.com',
                        displayName: 'Contact User 2',
                        avatar: 'contact2-avatar',
                    },
                ],
                [
                    8,
                    {
                        accountID: 8,
                        login: 'contact3@test.com',
                        displayName: 'Contact User 3',
                        avatar: 'contact3-avatar',
                    },
                ],
                [
                    9,
                    {
                        accountID: 9,
                        login: 'contact4@test.com',
                        displayName: 'Contact User 4',
                        avatar: 'contact4-avatar',
                    },
                ],
            ]) as ReturnType<typeof usePersonalDetails>,
        );
        mockedUseCurrentUserPersonalDetails.mockReturnValue({
            accountID: 1,
            email: 'current@test.com',
            login: 'current@test.com',
        } as ReturnType<typeof useCurrentUserPersonalDetails>);
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: true});
        jest.mocked(useReportAttributes).mockReturnValue(undefined);
        mockedUseOptionsList.mockReturnValue({
            areOptionsInitialized: true,
            options: {
                reports: [],
                personalDetails: [],
            },
            initializeOptions: jest.fn(),
            resetOptions: jest.fn(),
        } as ReturnType<typeof useOptionsList>);
        mockedUseOnyx.mockImplementation((key) => {
            switch (key) {
                case ONYXKEYS.IS_SEARCHING_FOR_REPORTS:
                    return buildOnyxResult(false);
                case ONYXKEYS.COUNTRY_CODE:
                    return buildOnyxResult(CONST.DEFAULT_COUNTRY_CODE);
                case ONYXKEYS.LOGIN_LIST:
                    return buildOnyxResult({});
                case ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT:
                case ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING:
                case ONYXKEYS.COLLECTION.POLICY:
                    return buildOnyxResult(undefined);
                case ONYXKEYS.NVP_RECENT_ATTENDEES:
                    return buildOnyxResult([]);
                default:
                    return buildOnyxResult(undefined);
            }
        });

        mockedGetValidOptions.mockReturnValue(
            buildOptions({
                currentUserOption: buildSearchOption(1, 'current@test.com', 'Current User', 'current-user', 'avatar-url'),
                recentReports: [
                    buildSearchOption(1, 'current@test.com', 'Current User', 'recent-current', 'avatar-url'),
                    buildSearchOption(2, 'recent@test.com', 'Recent User', 'recent-2', 'recent-avatar'),
                    buildSearchOption(4, 'recent2@test.com', 'Recent User 2', 'recent-4', 'recent2-avatar'),
                    buildSearchOption(5, 'recent3@test.com', 'Recent User 3', 'recent-5', 'recent3-avatar'),
                    buildSearchOption(6, 'recent4@test.com', 'Recent User 4', 'recent-6', 'recent4-avatar'),
                ],
                personalDetails: [
                    buildSearchOption(1, 'current@test.com', 'Current User', 'contact-current', 'avatar-url'),
                    buildSearchOption(3, 'contact@test.com', 'Contact User', 'contact-3', 'contact-avatar'),
                    buildSearchOption(7, 'contact2@test.com', 'Contact User 2', 'contact-7', 'contact2-avatar'),
                    buildSearchOption(8, 'contact3@test.com', 'Contact User 3', 'contact-8', 'contact3-avatar'),
                    buildSearchOption(9, 'contact4@test.com', 'Contact User 4', 'contact-9', 'contact4-avatar'),
                ],
            }),
        );
    });

    it('reopens with a visible selected section, removes duplicates from lower sections, and disables scroll-to-top on select', () => {
        render(
            <SearchFiltersParticipantsSelector
                initialAccountIDs={['1']}
                onFiltersUpdate={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.shouldScrollToTopOnSelect).toBe(false);
        expect(selectionListProps?.sections.at(0)?.data).toEqual([
            expect.objectContaining({
                accountID: 1,
                text: 'Current User',
                alternateText: 'current@test.com',
                icons: [expect.objectContaining({source: 'avatar-url'})],
                isSelected: true,
            }),
        ]);
        expect(selectionListProps?.sections.at(1)?.data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'recent@test.com'})]));
        expect(selectionListProps?.sections.at(1)?.data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'current@test.com'})]));
        expect(selectionListProps?.sections.at(2)?.data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'contact@test.com'})]));
        expect(selectionListProps?.sections.at(2)?.data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'current@test.com'})]));
    });

    it('renders the selected section before the current-user row on reopen when the current user is not selected', () => {
        render(
            <SearchFiltersParticipantsSelector
                initialAccountIDs={['2']}
                onFiltersUpdate={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];

        expect(selectionListProps?.sections.at(0)?.data).toEqual([
            expect.objectContaining({
                accountID: 2,
                login: 'recent@test.com',
                isSelected: true,
            }),
        ]);
        expect(selectionListProps?.sections.at(1)?.data).toEqual([
            expect.objectContaining({
                accountID: 1,
                login: 'current@test.com',
                isSelected: false,
            }),
        ]);
        expect(selectionListProps?.sections.at(2)?.data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'recent@test.com'})]));
        expect(selectionListProps?.sections.at(3)?.data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'recent@test.com'})]));
    });

    it('keeps the special current-user row in place and updates its selected state when toggled', () => {
        render(
            <SearchFiltersParticipantsSelector
                initialAccountIDs={[]}
                onFiltersUpdate={jest.fn()}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        const currentUserRow = initialProps?.sections.at(0)?.data.at(0);
        if (!currentUserRow) {
            throw new Error('Expected current user row to exist');
        }

        expect(currentUserRow).toEqual(
            expect.objectContaining({
                accountID: 1,
                login: 'current@test.com',
                isSelected: false,
                selected: false,
            }),
        );

        act(() => {
            initialProps?.onSelectRow(currentUserRow);
        });

        const selectedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectedProps?.sections.at(0)?.data.at(0)).toEqual(
            expect.objectContaining({
                accountID: 1,
                login: 'current@test.com',
                isSelected: true,
                selected: true,
            }),
        );

        act(() => {
            const selectedCurrentUserRow = selectedProps?.sections.at(0)?.data.at(0);
            if (!selectedCurrentUserRow) {
                throw new Error('Expected selected current user row to exist');
            }
            selectedProps?.onSelectRow(selectedCurrentUserRow);
        });

        const deselectedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(deselectedProps?.sections.at(0)?.data.at(0)).toEqual(
            expect.objectContaining({
                accountID: 1,
                login: 'current@test.com',
                isSelected: false,
                selected: false,
            }),
        );
    });

    it('keeps an initially selected row in the top section but unchecked after deselecting', () => {
        render(
            <SearchFiltersParticipantsSelector
                initialAccountIDs={['1']}
                onFiltersUpdate={jest.fn()}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.onSelectRow({
                reportID: '',
                accountID: 1,
                login: 'current@test.com',
                text: 'Current User',
                alternateText: 'current@test.com',
                keyForList: 'current-user',
                icons: [{source: 'avatar-url', name: 'Current User', type: CONST.ICON_TYPE_AVATAR}],
            });
        });

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps?.sections.at(0)?.data).toEqual([
            expect.objectContaining({
                login: 'current@test.com',
                isSelected: false,
            }),
        ]);
    });
});
