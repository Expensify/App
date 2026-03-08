import {act, render} from '@testing-library/react-native';
import React from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import SearchFiltersParticipantsSelector from '@components/Search/SearchFiltersParticipantsSelector';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import {getValidOptions} from '@libs/OptionsListUtils';
import type * as OptionsListUtils from '@libs/OptionsListUtils';
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
    const actual = jest.requireActual<typeof OptionsListUtils>('@libs/OptionsListUtils');

    return {
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
        } as ReturnType<typeof useOptionsList>);
        mockedUseOnyx.mockImplementation((key) => {
            switch (key) {
                case ONYXKEYS.IS_SEARCHING_FOR_REPORTS:
                    return [false, jest.fn()] as ReturnType<typeof useOnyx>;
                case ONYXKEYS.COUNTRY_CODE:
                    return [CONST.DEFAULT_COUNTRY_CODE, jest.fn()] as ReturnType<typeof useOnyx>;
                case ONYXKEYS.LOGIN_LIST:
                    return [{}, jest.fn()] as ReturnType<typeof useOnyx>;
                case ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT:
                case ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING:
                case ONYXKEYS.COLLECTION.POLICY:
                    return [undefined, jest.fn()] as ReturnType<typeof useOnyx>;
                case ONYXKEYS.NVP_RECENT_ATTENDEES:
                    return [[], jest.fn()] as ReturnType<typeof useOnyx>;
                default:
                    return [undefined, jest.fn()] as ReturnType<typeof useOnyx>;
            }
        });

        mockedGetValidOptions.mockReturnValue({
            currentUserOption: {
                accountID: 1,
                login: 'current@test.com',
                text: 'Current User',
                alternateText: 'current@test.com',
                keyForList: 'current-user',
                icons: [{source: 'avatar-url', name: 'Current User', type: CONST.ICON_TYPE_AVATAR}],
            },
            recentReports: [
                {
                    accountID: 1,
                    login: 'current@test.com',
                    text: 'Current User',
                    alternateText: 'current@test.com',
                    keyForList: 'recent-current',
                    icons: [{source: 'avatar-url', name: 'Current User', type: CONST.ICON_TYPE_AVATAR}],
                },
                {
                    accountID: 2,
                    login: 'recent@test.com',
                    text: 'Recent User',
                    alternateText: 'recent@test.com',
                    keyForList: 'recent-2',
                    icons: [{source: 'recent-avatar', name: 'Recent User', type: CONST.ICON_TYPE_AVATAR}],
                },
                {
                    accountID: 4,
                    login: 'recent2@test.com',
                    text: 'Recent User 2',
                    alternateText: 'recent2@test.com',
                    keyForList: 'recent-4',
                    icons: [{source: 'recent2-avatar', name: 'Recent User 2', type: CONST.ICON_TYPE_AVATAR}],
                },
                {
                    accountID: 5,
                    login: 'recent3@test.com',
                    text: 'Recent User 3',
                    alternateText: 'recent3@test.com',
                    keyForList: 'recent-5',
                    icons: [{source: 'recent3-avatar', name: 'Recent User 3', type: CONST.ICON_TYPE_AVATAR}],
                },
                {
                    accountID: 6,
                    login: 'recent4@test.com',
                    text: 'Recent User 4',
                    alternateText: 'recent4@test.com',
                    keyForList: 'recent-6',
                    icons: [{source: 'recent4-avatar', name: 'Recent User 4', type: CONST.ICON_TYPE_AVATAR}],
                },
            ],
            personalDetails: [
                {
                    accountID: 1,
                    login: 'current@test.com',
                    text: 'Current User',
                    alternateText: 'current@test.com',
                    keyForList: 'contact-current',
                    icons: [{source: 'avatar-url', name: 'Current User', type: CONST.ICON_TYPE_AVATAR}],
                },
                {
                    accountID: 3,
                    login: 'contact@test.com',
                    text: 'Contact User',
                    alternateText: 'contact@test.com',
                    keyForList: 'contact-3',
                    icons: [{source: 'contact-avatar', name: 'Contact User', type: CONST.ICON_TYPE_AVATAR}],
                },
                {
                    accountID: 7,
                    login: 'contact2@test.com',
                    text: 'Contact User 2',
                    alternateText: 'contact2@test.com',
                    keyForList: 'contact-7',
                    icons: [{source: 'contact2-avatar', name: 'Contact User 2', type: CONST.ICON_TYPE_AVATAR}],
                },
                {
                    accountID: 8,
                    login: 'contact3@test.com',
                    text: 'Contact User 3',
                    alternateText: 'contact3@test.com',
                    keyForList: 'contact-8',
                    icons: [{source: 'contact3-avatar', name: 'Contact User 3', type: CONST.ICON_TYPE_AVATAR}],
                },
                {
                    accountID: 9,
                    login: 'contact4@test.com',
                    text: 'Contact User 4',
                    alternateText: 'contact4@test.com',
                    keyForList: 'contact-9',
                    icons: [{source: 'contact4-avatar', name: 'Contact User 4', type: CONST.ICON_TYPE_AVATAR}],
                },
            ],
            userToInvite: null,
            headerMessage: '',
        });
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
            selectedProps?.onSelectRow(selectedProps?.sections.at(0)?.data.at(0));
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
