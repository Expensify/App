import {render} from '@testing-library/react-native';
import React from 'react';
import type {UseOnyxResult} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useInitialSelectionRef from '@hooks/useInitialSelectionRef';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSearchSelector from '@hooks/useSearchSelector';
import useUserToInviteReports from '@hooks/useUserToInviteReports';
import type {SearchOptionData} from '@libs/OptionsListUtils';
import {MoneyRequestAttendeeSelector} from '@pages/iou/request/MoneyRequestAttendeeSelector';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: jest.fn(),
}));
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails');
jest.mock('@hooks/useInitialSelectionRef');
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
    })),
);
jest.mock('@hooks/useOnyx');
jest.mock('@hooks/usePolicy');
jest.mock('@hooks/useReportAttributes');
jest.mock('@hooks/useScreenWrapperTransitionStatus');
jest.mock('@hooks/useSearchSelector');
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        ph1: {},
        mb2: {},
    })),
);
jest.mock('@hooks/useUserToInviteReports');
jest.mock('@libs/actions/Report', () => ({
    searchUserInServer: jest.fn(),
}));
jest.mock('@libs/DeviceCapabilities', () => ({
    canUseTouchScreen: jest.fn(() => true),
}));

type MockedUseOnyx = jest.MockedFunction<typeof useOnyx>;
type MockedUseSearchSelector = jest.MockedFunction<typeof useSearchSelector>;

function buildOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

function buildOption(login: string, accountID: number, isSelected = false): SearchOptionData {
    return {
        reportID: '',
        login,
        text: login,
        displayName: login,
        alternateText: login,
        keyForList: login,
        accountID,
        isSelected,
        selected: isSelected,
        icons: [],
    };
}

function buildSearchSelectorResult(config: Parameters<typeof useSearchSelector>[0], overrides: Partial<ReturnType<typeof useSearchSelector>> = {}): ReturnType<typeof useSearchSelector> {
    const emptyOptions = {
        recentReports: [],
        personalDetails: [],
        workspaceChats: [],
        selfDMChat: null,
        userToInvite: null,
        currentUserOption: null,
    };

    return {
        searchTerm: '',
        debouncedSearchTerm: '',
        setSearchTerm: jest.fn(),
        searchOptions: emptyOptions,
        availableOptions: emptyOptions,
        selectedOptions: config.initialSelected ?? [],
        selectedOptionsForDisplay: config.initialSelected ?? [],
        setSelectedOptions: jest.fn(),
        toggleSelection: jest.fn(),
        areOptionsInitialized: true,
        contactState: undefined,
        onListEndReached: jest.fn(),
        ...overrides,
    };
}

function buildAttendee(overrides: Partial<Attendee> = {}): Attendee {
    return {
        accountID: CONST.DEFAULT_NUMBER_ID,
        login: '',
        email: '',
        displayName: '',
        avatarUrl: '',
        selected: true,
        iouType: CONST.IOU.TYPE.SUBMIT,
        ...overrides,
    };
}

describe('MoneyRequestAttendeeSelector', () => {
    const mockedSelectionList = jest.mocked(SelectionListWithSections);
    const mockedUseOnyx = useOnyx as MockedUseOnyx;
    const mockedUseSearchSelector = useSearchSelector as MockedUseSearchSelector;
    const mockedUseInitialSelectionRef = jest.mocked(useInitialSelectionRef);
    let latestSearchSelectorConfig: Parameters<typeof useSearchSelector>[0] | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        latestSearchSelectorConfig = undefined;

        jest.mocked(useCurrentUserPersonalDetails).mockReturnValue({
            accountID: 123,
            email: 'current@test.com',
            login: 'current@test.com',
        } as ReturnType<typeof useCurrentUserPersonalDetails>);
        jest.mocked(usePersonalDetails).mockReturnValue(
            Object.fromEntries([
                [
                    1,
                    {
                        accountID: 1,
                        login: 'selected@test.com',
                        displayName: 'Selected User',
                        avatar: 'avatar-url',
                        firstName: 'Selected',
                        lastName: 'User',
                    },
                ],
            ]) as unknown as ReturnType<typeof usePersonalDetails>,
        );
        mockedUseInitialSelectionRef.mockImplementation((selection) => selection);
        jest.mocked(usePolicy).mockReturnValue(undefined);
        jest.mocked(useReportAttributes).mockReturnValue(undefined);
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: true});
        jest.mocked(useUserToInviteReports).mockReturnValue({userToInviteExpenseReport: undefined, userToInviteChatReport: undefined});

        mockedUseOnyx.mockImplementation((key) => {
            switch (key) {
                case ONYXKEYS.COUNTRY_CODE:
                    return buildOnyxResult(CONST.DEFAULT_COUNTRY_CODE);
                case ONYXKEYS.NVP_ACTIVE_POLICY_ID:
                    return buildOnyxResult('policyID');
                case ONYXKEYS.NVP_RECENT_ATTENDEES:
                    return buildOnyxResult([]);
                case ONYXKEYS.IS_SEARCHING_FOR_REPORTS:
                    return buildOnyxResult(false);
                case ONYXKEYS.LOGIN_LIST:
                    return buildOnyxResult({});
                default:
                    return buildOnyxResult(undefined);
            }
        });

        mockedUseSearchSelector.mockImplementation((config) => {
            latestSearchSelectorConfig = config;

            return buildSearchSelectorResult(config, {
                searchOptions: {
                    recentReports: [
                        buildOption('selected@test.com', 1, true),
                        {
                            ...buildOption('recent1@test.com', 2),
                            text: 'Recent User 1',
                            displayName: 'Recent User 1',
                            alternateText: 'recent1@test.com',
                        },
                        buildOption('recent2@test.com', 3),
                        buildOption('recent3@test.com', 4),
                        buildOption('recent4@test.com', 5),
                    ],
                    personalDetails: [
                        {
                            ...buildOption('recent1@test.com', 2, true),
                            text: 'Recent User 1',
                            displayName: 'Recent User 1',
                            alternateText: 'recent1@test.com',
                        },
                        buildOption('contact1@test.com', 6),
                        buildOption('contact2@test.com', 7),
                        buildOption('contact3@test.com', 8),
                        buildOption('contact4@test.com', 9),
                    ],
                    workspaceChats: [],
                    selfDMChat: null,
                    userToInvite: null,
                    currentUserOption: null,
                },
                availableOptions: {
                    recentReports: [],
                    personalDetails: [],
                    workspaceChats: [],
                    selfDMChat: null,
                    userToInvite: null,
                    currentUserOption: null,
                },
            });
        });
    });

    it('passes canonical initialSelected options to the hook and renders a hydrated top section without duplicates', () => {
        render(
            <MoneyRequestAttendeeSelector
                attendees={[
                    buildAttendee({
                        accountID: 1,
                        login: 'selected@test.com',
                        email: 'selected@test.com',
                        displayName: 'Selected User',
                    }),
                ]}
                onFinish={jest.fn()}
                onAttendeesAdded={jest.fn()}
                iouType={CONST.IOU.TYPE.SUBMIT}
                action={CONST.IOU.ACTION.CREATE}
            />,
        );

        expect(mockedUseSearchSelector).toHaveBeenCalledWith(
            expect.objectContaining({
                prioritizeSelectedOnToggle: false,
                initialSelectedKeys: ['accountID:1'],
                initialSelected: [
                    expect.objectContaining({
                        login: 'selected@test.com',
                        text: 'Selected User',
                        alternateText: 'selected@test.com',
                        keyForList: '1',
                        icons: [expect.objectContaining({source: 'avatar-url'})],
                    }),
                ],
            }),
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.shouldScrollToTopOnSelect).toBe(false);
        expect(selectionListProps?.sections[0].data).toEqual([
            expect.objectContaining({
                login: 'selected@test.com',
                text: 'Selected User',
                alternateText: 'selected@test.com',
                icons: [expect.objectContaining({source: 'avatar-url'})],
                isSelected: true,
            }),
        ]);
        expect(selectionListProps?.sections[1].data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'recent1@test.com'})]));
        expect(selectionListProps?.sections[1].data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'selected@test.com'})]));
        expect(selectionListProps?.sections[2].data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'contact1@test.com'})]));
        expect(selectionListProps?.sections[2].data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'selected@test.com'})]));
        expect(selectionListProps?.sections[2].data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'recent1@test.com'})]));
    });

    it('renders the selected section on reopen without dropping unrelated recents or contacts', () => {
        jest.mocked(usePersonalDetails).mockReturnValue(
            Object.fromEntries([
                [
                    1,
                    {
                        accountID: 1,
                        login: 'selected-recent@test.com',
                        displayName: 'Selected Recent',
                        avatar: 'selected-recent-avatar',
                        firstName: 'Selected',
                        lastName: 'Recent',
                    },
                ],
                [
                    6,
                    {
                        accountID: 6,
                        login: 'selected-contact@test.com',
                        displayName: 'Selected Contact',
                        avatar: 'selected-contact-avatar',
                        firstName: 'Selected',
                        lastName: 'Contact',
                    },
                ],
            ]) as unknown as ReturnType<typeof usePersonalDetails>,
        );

        mockedUseSearchSelector.mockImplementation((config) => {
            latestSearchSelectorConfig = config;

            return buildSearchSelectorResult(config, {
                searchOptions: {
                    recentReports: [
                        buildOption('selected-recent@test.com', 1, true),
                        buildOption('recent1@test.com', 2),
                        buildOption('recent2@test.com', 3),
                        buildOption('recent3@test.com', 4),
                        buildOption('recent4@test.com', 5),
                    ],
                    personalDetails: [
                        buildOption('selected-contact@test.com', 6, true),
                        buildOption('contact1@test.com', 7),
                        buildOption('contact2@test.com', 8),
                        buildOption('contact3@test.com', 9),
                        buildOption('contact4@test.com', 10),
                    ],
                    workspaceChats: [],
                    selfDMChat: null,
                    userToInvite: null,
                    currentUserOption: null,
                },
                availableOptions: {
                    recentReports: [],
                    personalDetails: [],
                    workspaceChats: [],
                    selfDMChat: null,
                    userToInvite: null,
                    currentUserOption: null,
                },
            });
        });

        render(
            <MoneyRequestAttendeeSelector
                attendees={[
                    buildAttendee({
                        accountID: 1,
                        login: 'selected-recent@test.com',
                        email: 'selected-recent@test.com',
                        displayName: 'Selected Recent',
                    }),
                    buildAttendee({
                        accountID: 6,
                        login: 'selected-contact@test.com',
                        email: 'selected-contact@test.com',
                        displayName: 'Selected Contact',
                    }),
                ]}
                onFinish={jest.fn()}
                onAttendeesAdded={jest.fn()}
                iouType={CONST.IOU.TYPE.SUBMIT}
                action={CONST.IOU.ACTION.CREATE}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections[0].data).toEqual(
            expect.arrayContaining([expect.objectContaining({login: 'selected-recent@test.com'}), expect.objectContaining({login: 'selected-contact@test.com'})]),
        );
        expect(selectionListProps?.sections[1].data).toHaveLength(4);
        expect(selectionListProps?.sections[1].data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'recent1@test.com'}),
                expect.objectContaining({login: 'recent2@test.com'}),
                expect.objectContaining({login: 'recent3@test.com'}),
                expect.objectContaining({login: 'recent4@test.com'}),
            ]),
        );
        expect(selectionListProps?.sections[2].data).toHaveLength(4);
        expect(selectionListProps?.sections[2].data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({login: 'contact1@test.com'}),
                expect.objectContaining({login: 'contact2@test.com'}),
                expect.objectContaining({login: 'contact3@test.com'}),
                expect.objectContaining({login: 'contact4@test.com'}),
            ]),
        );
    });

    it('keeps a selected recent attendee in the recents source and recents section during the same open cycle', () => {
        mockedUseInitialSelectionRef.mockImplementation((selection) => {
            const firstSelectionItem: unknown = Array.isArray(selection) ? selection.at(0) : undefined;
            if (
                Array.isArray(selection) &&
                (selection.length === 0 || (typeof firstSelectionItem === 'object' && firstSelectionItem !== null && ('email' in firstSelectionItem || 'iouType' in firstSelectionItem)))
            ) {
                return [];
            }
            return selection;
        });

        mockedUseOnyx.mockImplementation((key) => {
            switch (key) {
                case ONYXKEYS.COUNTRY_CODE:
                    return buildOnyxResult(CONST.DEFAULT_COUNTRY_CODE);
                case ONYXKEYS.NVP_ACTIVE_POLICY_ID:
                    return buildOnyxResult('policyID');
                case ONYXKEYS.NVP_RECENT_ATTENDEES:
                    return buildOnyxResult([
                        [
                            buildAttendee({
                                email: 'recent1@test.com',
                                displayName: 'Recent User 1',
                            }),
                        ],
                    ]);
                case ONYXKEYS.IS_SEARCHING_FOR_REPORTS:
                    return buildOnyxResult(false);
                case ONYXKEYS.LOGIN_LIST:
                    return buildOnyxResult({});
                default:
                    return buildOnyxResult(undefined);
            }
        });

        let currentSelectedOptions: Array<ReturnType<typeof buildOption>> = [];
        mockedUseSearchSelector.mockImplementation((config) => {
            latestSearchSelectorConfig = config;

            return buildSearchSelectorResult(config, {
                searchOptions: {
                    recentReports: [
                        {
                            ...buildOption(
                                'recent1@test.com',
                                2,
                                currentSelectedOptions.some((option) => option.login === 'recent1@test.com'),
                            ),
                            text: 'Recent User 1',
                            displayName: 'Recent User 1',
                            alternateText: 'recent1@test.com',
                        },
                        buildOption('recent2@test.com', 3),
                        buildOption('recent3@test.com', 4),
                        buildOption('recent4@test.com', 5),
                    ],
                    personalDetails: [buildOption('contact1@test.com', 6), buildOption('contact2@test.com', 7), buildOption('contact3@test.com', 8), buildOption('contact4@test.com', 9)],
                    workspaceChats: [],
                    selfDMChat: null,
                    userToInvite: null,
                    currentUserOption: null,
                },
                availableOptions: {
                    recentReports: [],
                    personalDetails: [],
                    workspaceChats: [],
                    selfDMChat: null,
                    userToInvite: null,
                    currentUserOption: null,
                },
                selectedOptions: currentSelectedOptions,
                selectedOptionsForDisplay: currentSelectedOptions,
            });
        });

        const {rerender} = render(
            <MoneyRequestAttendeeSelector
                attendees={[]}
                onFinish={jest.fn()}
                onAttendeesAdded={jest.fn()}
                iouType={CONST.IOU.TYPE.SUBMIT}
                action={CONST.IOU.ACTION.CREATE}
            />,
        );

        expect(latestSearchSelectorConfig?.getValidOptionsConfig?.recentAttendees).toEqual(
            expect.arrayContaining([expect.objectContaining({login: 'current@test.com'}), expect.objectContaining({login: 'recent1@test.com'})]),
        );

        currentSelectedOptions = [
            {
                ...buildOption('recent1@test.com', 2, true),
                text: 'Recent User 1',
                displayName: 'Recent User 1',
                alternateText: 'recent1@test.com',
            },
        ];

        rerender(
            <MoneyRequestAttendeeSelector
                attendees={[
                    buildAttendee({
                        accountID: 2,
                        login: 'recent1@test.com',
                        email: 'recent1@test.com',
                        displayName: 'Recent User 1',
                    }),
                ]}
                onFinish={jest.fn()}
                onAttendeesAdded={jest.fn()}
                iouType={CONST.IOU.TYPE.SUBMIT}
                action={CONST.IOU.ACTION.CREATE}
            />,
        );

        expect(latestSearchSelectorConfig?.getValidOptionsConfig?.recentAttendees).toEqual(expect.arrayContaining([expect.objectContaining({login: 'recent1@test.com'})]));

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections[0].title).toBe('common.recents');
        expect(selectionListProps?.sections[0].data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'recent1@test.com', isSelected: true})]));
        expect(selectionListProps?.sections[1].data).toEqual(expect.arrayContaining([expect.objectContaining({login: 'contact1@test.com'})]));
        expect(selectionListProps?.sections[1].data).not.toEqual(expect.arrayContaining([expect.objectContaining({login: 'recent1@test.com'})]));
    });
});
