import {render} from '@testing-library/react-native';
import React from 'react';
import type {UseOnyxResult} from 'react-native-onyx';
import {RESULTS} from 'react-native-permissions';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import useContactImport from '@hooks/useContactImport';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportAttributes from '@hooks/useReportAttributes';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useSearchSelector from '@hooks/useSearchSelector';
import type {ContactState, UseSearchSelectorReturn} from '@hooks/useSearchSelector.base';
import useTransactionDraftValues from '@hooks/useTransactionDraftValues';
import useUserToInviteReports from '@hooks/useUserToInviteReports';
import {getEmptyOptions} from '@libs/OptionsListUtils';
import type {Options, SearchOptionData} from '@libs/OptionsListUtils';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';

jest.mock('@components/Button', () => jest.fn(() => null));
jest.mock('@components/ContactPermissionModal', () => jest.fn(() => null));
jest.mock('@components/EmptySelectionListContent', () => jest.fn(() => null));
jest.mock('@components/FormHelpMessage', () => jest.fn(() => null));
jest.mock('@components/MenuItem', () => jest.fn(() => null));
jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: jest.fn(),
}));
jest.mock('@components/ReferralProgramCTA', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/InviteMemberListItem', () => jest.fn(() => null));
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@pages/iou/request/ImportContactButton', () => jest.fn(() => null));
jest.mock('@hooks/useContactImport');
jest.mock('@hooks/useCurrentUserPersonalDetails');
jest.mock('@hooks/useDismissedReferralBanners');
jest.mock('@hooks/useLazyAsset');
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
jest.mock('@hooks/usePreferredPolicy');
jest.mock('@hooks/useReportAttributes');
jest.mock('@hooks/useScreenWrapperTransitionStatus');
jest.mock('@hooks/useSearchSelector');
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        ph1: {},
        mb2: {},
        flexShrink0: {},
        mb5: {},
    })),
);
jest.mock('@hooks/useTransactionDraftValues');
jest.mock('@hooks/useUserToInviteReports');
jest.mock('@libs/actions/Report', () => ({
    searchUserInServer: jest.fn(),
}));
jest.mock('@libs/DeviceCapabilities', () => ({
    canUseTouchScreen: jest.fn(() => true),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));
jest.mock('react-native-permissions', () => ({
    RESULTS: {
        GRANTED: 'granted',
        LIMITED: 'limited',
    },
}));

type MockedUseOnyx = jest.MockedFunction<typeof useOnyx>;
type MockedUseSearchSelector = jest.MockedFunction<typeof useSearchSelector>;

function buildOption(login: string, accountID: number, overrides: Partial<SearchOptionData> = {}): SearchOptionData {
    return {
        login,
        text: login,
        displayName: login,
        alternateText: login,
        keyForList: login,
        accountID,
        isSelected: false,
        selected: false,
        icons: [],
        ...overrides,
    } as SearchOptionData;
}

function getSectionByTitle(sections: Array<{title?: string; data: unknown[]}>, title: string) {
    return sections.find((section) => section.title === title);
}

function buildOnyxResult<T>(value: T): UseOnyxResult<T> {
    return [value, jest.fn()] as unknown as UseOnyxResult<T>;
}

function buildLazyIconMap<const TName extends readonly string[]>(names: TName): Record<TName[number], IconAsset> {
    return Object.fromEntries(names.map((name) => [name, 1 as IconAsset])) as Record<TName[number], IconAsset>;
}

function buildContactState(): ContactState {
    return {
        permissionStatus: RESULTS.GRANTED,
        contactOptions: [],
        showImportUI: false,
        importContacts: jest.fn(),
        initiateContactImportAndSetState: jest.fn(),
        setContactPermissionState: jest.fn(),
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
    overrides: Omit<Partial<UseSearchSelectorReturn>, 'searchOptions' | 'availableOptions' | 'contactState'> & {
        searchOptions?: Partial<Options>;
        availableOptions?: Partial<Options>;
        contactState?: ContactState;
    } = {},
): UseSearchSelectorReturn {
    const {searchOptions, availableOptions, contactState, ...rest} = overrides;

    return {
        searchTerm: '',
        debouncedSearchTerm: '',
        setSearchTerm: jest.fn(),
        searchOptions: buildOptions(searchOptions),
        availableOptions: buildOptions(availableOptions),
        selectedOptions: config.initialSelected ?? [],
        selectedOptionsForDisplay: config.initialSelected ?? [],
        setSelectedOptions: jest.fn(),
        toggleSelection: jest.fn(),
        areOptionsInitialized: true,
        contactState: contactState ?? buildContactState(),
        onListEndReached: jest.fn(),
        ...rest,
    };
}

describe('MoneyRequestParticipantsSelector', () => {
    const mockedSelectionList = jest.mocked(SelectionListWithSections);
    const mockedUseOnyx = useOnyx as MockedUseOnyx;
    const mockedUseSearchSelector = useSearchSelector as MockedUseSearchSelector;
    let latestSearchSelectorConfig: Parameters<typeof useSearchSelector>[0] | undefined;

    beforeEach(() => {
        jest.clearAllMocks();
        latestSearchSelectorConfig = undefined;

        jest.mocked(usePersonalDetails).mockReturnValue(
            Object.fromEntries([
                [
                    1,
                    {
                        accountID: 1,
                        login: 'selected@test.com',
                        displayName: 'Selected User',
                        avatar: 'selected-avatar',
                        firstName: 'Selected',
                        lastName: 'User',
                    },
                ],
            ]) as ReturnType<typeof usePersonalDetails>,
        );
        jest.mocked(useCurrentUserPersonalDetails).mockReturnValue({
            accountID: 123,
            email: 'current@test.com',
            login: 'current@test.com',
        } as ReturnType<typeof useCurrentUserPersonalDetails>);
        jest.mocked(useMemoizedLazyExpensifyIcons).mockImplementation((names) => buildLazyIconMap(names));
        jest.mocked(useContactImport).mockReturnValue({
            contactPermissionState: RESULTS.GRANTED,
            contacts: [],
            setContactPermissionState: jest.fn(),
            importAndSaveContacts: jest.fn(),
        });
        jest.mocked(useDismissedReferralBanners).mockReturnValue({isDismissed: true} as ReturnType<typeof useDismissedReferralBanners>);
        jest.mocked(usePreferredPolicy).mockReturnValue({
            isRestrictedToPreferredPolicy: false,
            preferredPolicyID: undefined,
        } as ReturnType<typeof usePreferredPolicy>);
        jest.mocked(useReportAttributes).mockReturnValue(undefined);
        jest.mocked(useScreenWrapperTransitionStatus).mockReturnValue({didScreenTransitionEnd: true});
        jest.mocked(useTransactionDraftValues).mockReturnValue([] as ReturnType<typeof useTransactionDraftValues>);
        jest.mocked(useUserToInviteReports).mockReturnValue({userToInviteExpenseReport: undefined, userToInviteChatReport: undefined});

        mockedUseOnyx.mockImplementation((key) => {
            switch (key) {
                case ONYXKEYS.COUNTRY_CODE:
                    return buildOnyxResult(CONST.DEFAULT_COUNTRY_CODE);
                case ONYXKEYS.NVP_ACTIVE_POLICY_ID:
                    return buildOnyxResult('policyID');
                case ONYXKEYS.COLLECTION.POLICY:
                    return buildOnyxResult({[`${ONYXKEYS.COLLECTION.POLICY}policyID`]: {id: 'policyID'}});
                case ONYXKEYS.IS_SEARCHING_FOR_REPORTS:
                    return buildOnyxResult(false);
                case ONYXKEYS.LOGIN_LIST:
                    return buildOnyxResult({});
                case ONYXKEYS.NVP_TRY_NEW_DOT:
                    return buildOnyxResult({});
                case ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END:
                    return buildOnyxResult({});
                default:
                    return buildOnyxResult(undefined);
            }
        });

        mockedUseSearchSelector.mockImplementation((config) => {
            latestSearchSelectorConfig = config;

            return buildSearchSelectorReturn(config, {
                searchOptions: {
                    recentReports: [
                        buildOption('selected@test.com', 1, {
                            text: 'Selected User',
                            displayName: 'Selected User',
                            alternateText: 'selected@test.com',
                            keyForList: 'recent-selected',
                            icons: [{source: 'selected-avatar', name: 'Selected User', type: CONST.ICON_TYPE_AVATAR}],
                            isSelected: true,
                            selected: true,
                        }),
                    ],
                    personalDetails: [buildOption('other@test.com', 2)],
                },
                availableOptions: {
                    personalDetails: [buildOption('other@test.com', 2)],
                },
            });
        });
    });

    it('uses only selectable invoice participants for hook state and shows the real recipient in the top section', () => {
        render(
            <MoneyRequestParticipantsSelector
                participants={[
                    {
                        accountID: 1,
                        login: 'selected@test.com',
                        text: 'Stale Selected',
                        displayName: 'Stale Selected',
                        selected: true,
                        iouType: CONST.IOU.TYPE.INVOICE,
                    },
                    {
                        policyID: 'policyID',
                        isSender: true,
                        selected: false,
                        iouType: CONST.IOU.TYPE.INVOICE,
                    },
                ]}
                onFinish={jest.fn()}
                onParticipantsAdded={jest.fn()}
                iouType={CONST.IOU.TYPE.INVOICE}
                action={CONST.IOU.ACTION.CREATE}
            />,
        );

        expect(latestSearchSelectorConfig?.getValidOptionsConfig).toEqual(
            expect.objectContaining({
                includeSelectedOptions: true,
                selectedOptions: [
                    expect.objectContaining({
                        login: 'selected@test.com',
                        selected: true,
                    }),
                ],
            }),
        );
        expect(latestSearchSelectorConfig?.initialSelected).toEqual([
            expect.objectContaining({
                login: 'selected@test.com',
                selected: true,
            }),
        ]);

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections[0].data).toEqual([
            expect.objectContaining({
                login: 'selected@test.com',
                text: 'Selected User',
                keyForList: 'recent-selected',
                isSelected: true,
                selected: true,
            }),
        ]);
        expect(selectionListProps?.sections[0].data).not.toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    policyID: 'policyID',
                    isSender: true,
                }),
            ]),
        );
    });

    it('does not crash before options initialize when search options still use the empty shape', () => {
        mockedUseSearchSelector.mockImplementation((config) => {
            latestSearchSelectorConfig = config;

            return buildSearchSelectorReturn(config, {
                areOptionsInitialized: false,
            });
        });

        expect(() =>
            render(
                <MoneyRequestParticipantsSelector
                    participants={[
                        {
                            accountID: 1,
                            login: 'selected@test.com',
                            text: 'Selected User',
                            displayName: 'Selected User',
                            selected: true,
                            iouType: CONST.IOU.TYPE.INVOICE,
                        },
                        {
                            policyID: 'policyID',
                            isSender: true,
                            selected: false,
                            iouType: CONST.IOU.TYPE.INVOICE,
                        },
                    ]}
                    onFinish={jest.fn()}
                    onParticipantsAdded={jest.fn()}
                    iouType={CONST.IOU.TYPE.INVOICE}
                    action={CONST.IOU.ACTION.CREATE}
                />,
            ),
        ).not.toThrow();

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.shouldShowLoadingPlaceholder).toBe(true);
    });

    it('falls back to the raw selected participant when canonical invoice resolution misses', () => {
        mockedUseSearchSelector.mockImplementation((config) => {
            latestSearchSelectorConfig = config;

            return buildSearchSelectorReturn(config, {
                searchOptions: {
                    personalDetails: [buildOption('other@test.com', 2)],
                },
                availableOptions: {
                    personalDetails: [buildOption('other@test.com', 2)],
                },
            });
        });

        render(
            <MoneyRequestParticipantsSelector
                participants={[
                    {
                        accountID: 1,
                        login: 'selected@test.com',
                        text: 'Selected User',
                        displayName: 'Selected User',
                        selected: true,
                        iouType: CONST.IOU.TYPE.INVOICE,
                    },
                ]}
                onFinish={jest.fn()}
                onParticipantsAdded={jest.fn()}
                iouType={CONST.IOU.TYPE.INVOICE}
                action={CONST.IOU.ACTION.CREATE}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections[0].data).toEqual([
            expect.objectContaining({
                login: 'selected@test.com',
                text: 'Selected User',
                displayName: 'Selected User',
                isSelected: true,
                selected: true,
            }),
        ]);
    });

    it('does not duplicate a selected workspace row in the lower workspace section on reopen', () => {
        mockedUseSearchSelector.mockImplementation((config) => {
            latestSearchSelectorConfig = config;

            return buildSearchSelectorReturn(config, {
                searchOptions: {
                    workspaceChats: [
                        buildOption('', 0, {
                            reportID: 'workspace-1',
                            policyID: 'policyID',
                            text: "M205's Workspace 1",
                            displayName: "M205's Workspace 1",
                            keyForList: 'workspace-1',
                            isSelected: true,
                            selected: true,
                        }),
                    ],
                },
                availableOptions: {
                    workspaceChats: [
                        buildOption('', 0, {
                            reportID: 'workspace-1',
                            policyID: 'policyID',
                            text: "M205's Workspace 1",
                            displayName: "M205's Workspace 1",
                            keyForList: 'workspace-1',
                            isSelected: true,
                            selected: true,
                        }),
                        buildOption('', 0, {
                            reportID: 'workspace-2',
                            policyID: 'policyID-2',
                            text: "M205's Workspace 2",
                            displayName: "M205's Workspace 2",
                            keyForList: 'workspace-2',
                        }),
                    ],
                },
            });
        });

        render(
            <MoneyRequestParticipantsSelector
                participants={[
                    {
                        reportID: 'workspace-1',
                        policyID: 'policyID',
                        text: "M205's Workspace 1",
                        selected: true,
                        iouType: CONST.IOU.TYPE.CREATE,
                        isPolicyExpenseChat: true,
                    },
                ]}
                onFinish={jest.fn()}
                onParticipantsAdded={jest.fn()}
                iouType={CONST.IOU.TYPE.CREATE}
                action={CONST.IOU.ACTION.CREATE}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections[0].data).toHaveLength(1);
        expect(getSectionByTitle(selectionListProps?.sections ?? [], 'workspace.common.workspace')?.data).toEqual([
            expect.objectContaining({
                reportID: 'workspace-2',
                text: "M205's Workspace 2",
            }),
        ]);
    });

    it('does not duplicate a selected personal row in the lower personal section on reopen', () => {
        mockedUseSearchSelector.mockImplementation((config) => {
            latestSearchSelectorConfig = config;

            return buildSearchSelectorReturn(config, {
                searchOptions: {
                    selfDMChat: buildOption('selected@test.com', 1, {
                        text: 'Selected User',
                        displayName: 'Selected User',
                        alternateText: 'selected@test.com',
                        keyForList: 'self-dm-selected',
                        reportID: 'self-dm-1',
                        isSelfDM: true,
                        isSelected: true,
                        selected: true,
                    }),
                },
                availableOptions: {
                    selfDMChat: buildOption('selected@test.com', 1, {
                        text: 'Selected User',
                        displayName: 'Selected User',
                        alternateText: 'selected@test.com',
                        keyForList: 'self-dm-selected',
                        reportID: 'self-dm-1',
                        isSelfDM: true,
                        isSelected: true,
                        selected: true,
                    }),
                },
            });
        });

        render(
            <MoneyRequestParticipantsSelector
                participants={[
                    {
                        reportID: 'self-dm-1',
                        accountID: 1,
                        login: 'selected@test.com',
                        text: 'Selected User',
                        displayName: 'Selected User',
                        selected: true,
                        iouType: CONST.IOU.TYPE.CREATE,
                        isSelfDM: true,
                    },
                ]}
                onFinish={jest.fn()}
                onParticipantsAdded={jest.fn()}
                iouType={CONST.IOU.TYPE.CREATE}
                action={CONST.IOU.ACTION.CREATE}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.sections[0].data).toEqual([
            expect.objectContaining({
                login: 'selected@test.com',
                text: 'Selected User',
                isSelected: true,
                selected: true,
            }),
        ]);
        expect(getSectionByTitle(selectionListProps?.sections ?? [], 'workspace.invoices.paymentMethods.personal')).toBeUndefined();
    });
});
