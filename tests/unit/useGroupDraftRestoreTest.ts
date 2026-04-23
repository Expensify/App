import type * as ReactNavigation from '@react-navigation/native';
import {act, renderHook} from '@testing-library/react-native';
import useOnyx from '@hooks/useOnyx';
// eslint-disable-next-line no-restricted-syntax -- needed for jest.requireActual typing
import * as OptionsListUtilsModule from '@libs/OptionsListUtils';
import type {SearchOption} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import type {PersonalDetails} from '@src/types/onyx';
import type {SelectedParticipant} from '@src/types/onyx/NewGroupChatDraft';
import useGroupChatDraftParticipantSync from '../../src/pages/NewChatPage/useGroupDraftRestore';

const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;
const mockGetUserToInviteOption = OptionsListUtilsModule.getUserToInviteOption as jest.MockedFunction<typeof OptionsListUtilsModule.getUserToInviteOption>;

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@libs/OptionsListUtils', () => {
    const actual = jest.requireActual<typeof OptionsListUtilsModule>('@libs/OptionsListUtils');
    return {
        ...actual,
        getUserToInviteOption: jest.fn(),
    };
});

const mockFocusState = {cleanup: undefined as (() => void) | undefined, isScreenFocused: true};
jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actual,
        useFocusEffect: (callback: () => (() => void) | void) => {
            if (!mockFocusState.isScreenFocused) {
                return;
            }
            const cleanup = callback();
            if (typeof cleanup === 'function') {
                mockFocusState.cleanup = cleanup;
            }
        },
    };
});

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'current@test.com';

function makePersonalDetailOption(accountID: number, login: string) {
    return {
        accountID,
        login,
        text: login,
        keyForList: String(accountID),
        item: {accountID, login, displayName: login} as PersonalDetails,
    } as SearchOption<PersonalDetails>;
}

function makeSelectedOption(accountID: number, login: string) {
    return {
        accountID,
        login,
        text: login,
        keyForList: String(accountID),
        isSelected: true,
    } as OptionData;
}

const PARTICIPANT_A: SelectedParticipant = {accountID: 10, login: 'alice@test.com'};
const PARTICIPANT_B: SelectedParticipant = {accountID: 20, login: 'bob@test.com'};
const PARTICIPANT_C: SelectedParticipant = {accountID: 30, login: 'carol@test.com'};
const CURRENT_USER_PARTICIPANT: SelectedParticipant = {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_EMAIL};

const CURRENT_USER_OPTION = makePersonalDetailOption(CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL);
const OPTION_A = makePersonalDetailOption(10, 'alice@test.com');
const OPTION_B = makePersonalDetailOption(20, 'bob@test.com');
const OPTION_C = makePersonalDetailOption(30, 'carol@test.com');

const ALL_PERSONAL_DETAIL_OPTIONS = [CURRENT_USER_OPTION, OPTION_A, OPTION_B, OPTION_C];

describe('useGroupDraftRestore', () => {
    beforeEach(() => {
        mockFocusState.cleanup = undefined;
        mockFocusState.isScreenFocused = true;
        mockGetUserToInviteOption.mockReturnValue(null);
    });

    function setupUseOnyx(draftParticipants: SelectedParticipant[] | undefined, draftStatus: 'loading' | 'loaded' = 'loaded') {
        mockUseOnyx.mockImplementation(((key: string, options?: {selector?: (draft: unknown) => unknown}) => {
            if (key === 'newGroupChatDraft') {
                const draft = draftParticipants ? {participants: draftParticipants} : undefined;
                const value = options?.selector ? options.selector(draft) : draft;
                return [value, {status: draftStatus}];
            }
            return [undefined, {status: 'loaded'}];
        }) as typeof useOnyx);
    }

    function renderRestoreHook(overrides?: {
        allPersonalDetailOptions?: Array<SearchOption<PersonalDetails>>;
        areAllPersonalDetailOptionsLoaded?: boolean;
        selectedOptions?: OptionData[];
        draftParticipants?: SelectedParticipant[] | undefined;
        draftStatus?: 'loading' | 'loaded';
    }) {
        const setSelectedOptions = jest.fn();
        const {
            allPersonalDetailOptions = ALL_PERSONAL_DETAIL_OPTIONS,
            areAllPersonalDetailOptionsLoaded = true,
            selectedOptions = [],
            draftParticipants,
            draftStatus = 'loaded',
        } = overrides ?? {};

        setupUseOnyx(draftParticipants, draftStatus);

        const {rerender} = renderHook(() =>
            useGroupChatDraftParticipantSync(
                allPersonalDetailOptions,
                areAllPersonalDetailOptionsLoaded,
                {},
                {},
                CURRENT_USER_EMAIL,
                CURRENT_USER_ACCOUNT_ID,
                selectedOptions,
                setSelectedOptions,
            ),
        );

        return {setSelectedOptions, rerender};
    }

    describe('initial restore', () => {
        it('should restore selected options from draft on mount', () => {
            const draftParticipants = [CURRENT_USER_PARTICIPANT, PARTICIPANT_A, PARTICIPANT_B];
            const {setSelectedOptions} = renderRestoreHook({draftParticipants});

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
            const restored = (setSelectedOptions.mock.calls as OptionData[][][]).at(0)?.at(0) ?? [];
            expect(restored).toHaveLength(2);
            expect(restored.at(0)?.accountID).toBe(PARTICIPANT_A.accountID);
            expect(restored.at(1)?.accountID).toBe(PARTICIPANT_B.accountID);
            expect(restored.every((option) => option.isSelected)).toBe(true);
        });

        it('should exclude current user from restored options', () => {
            const draftParticipants = [CURRENT_USER_PARTICIPANT, PARTICIPANT_A];
            const {setSelectedOptions} = renderRestoreHook({draftParticipants});

            const restored = (setSelectedOptions.mock.calls as OptionData[][][]).at(0)?.at(0) ?? [];
            expect(restored).toHaveLength(1);
            expect(restored.at(0)?.accountID).toBe(PARTICIPANT_A.accountID);
        });

        it('should not restore when draft is empty', () => {
            const {setSelectedOptions} = renderRestoreHook({draftParticipants: undefined});

            expect(setSelectedOptions).not.toHaveBeenCalled();
        });

        it('should not restore when personal details are not loaded yet', () => {
            const draftParticipants = [PARTICIPANT_A, PARTICIPANT_B];
            const {setSelectedOptions} = renderRestoreHook({
                draftParticipants,
                areAllPersonalDetailOptionsLoaded: false,
            });

            expect(setSelectedOptions).not.toHaveBeenCalled();
        });

        it('should not restore twice on subsequent renders', () => {
            const draftParticipants = [PARTICIPANT_A];
            setupUseOnyx(draftParticipants);

            const setSelectedOptions = jest.fn();
            const {rerender} = renderHook(() =>
                useGroupChatDraftParticipantSync(ALL_PERSONAL_DETAIL_OPTIONS, true, {}, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, [], setSelectedOptions),
            );

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);

            rerender({});
            rerender({});

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
        });

        it('should not restore while draft Onyx key is still hydrating', () => {
            const draftParticipants = [PARTICIPANT_A, PARTICIPANT_B];
            const {setSelectedOptions} = renderRestoreHook({
                draftParticipants,
                draftStatus: 'loading',
            });

            expect(setSelectedOptions).not.toHaveBeenCalled();
        });
    });

    describe('background sync', () => {
        it('should sync removals when draft changes while screen is in background', () => {
            const initialDraftParticipants = [CURRENT_USER_PARTICIPANT, PARTICIPANT_A, PARTICIPANT_B, PARTICIPANT_C];
            const setSelectedOptions = jest.fn();
            const selectedAfterRestore = [makeSelectedOption(10, 'alice@test.com'), makeSelectedOption(20, 'bob@test.com'), makeSelectedOption(30, 'carol@test.com')];

            setupUseOnyx(initialDraftParticipants);

            // Initial render triggers restore
            const {rerender} = renderHook(
                ({draftParticipants}) => {
                    setupUseOnyx(draftParticipants);
                    return useGroupChatDraftParticipantSync(ALL_PERSONAL_DETAIL_OPTIONS, true, {}, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, selectedAfterRestore, setSelectedOptions);
                },
                {initialProps: {draftParticipants: initialDraftParticipants}},
            );

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
            setSelectedOptions.mockClear();

            // Simulate navigating to NewChatConfirmPage (blur)
            act(() => {
                if (!mockFocusState.cleanup) {
                    return;
                }
                mockFocusState.cleanup();
            });
            mockFocusState.isScreenFocused = false;

            // Simulate removing Bob on NewChatConfirmPage by re-rendering with updated draft
            const draftWithRemoval = [CURRENT_USER_PARTICIPANT, PARTICIPANT_A, PARTICIPANT_C];
            rerender({draftParticipants: draftWithRemoval});

            expect(setSelectedOptions).toHaveBeenCalled();
            const synced = (setSelectedOptions.mock.calls as OptionData[][][]).at(-1)?.at(0) ?? [];
            const syncedLogins = synced.map((option) => option.login);
            expect(syncedLogins).toContain('alice@test.com');
            expect(syncedLogins).toContain('carol@test.com');
            expect(syncedLogins).not.toContain('bob@test.com');

            // Verify sync path was used (filters existing objects) not restore path (creates new objects)
            const alice = selectedAfterRestore.find((option) => option.login === 'alice@test.com');
            const syncedAlice = synced.find((option) => option.login === 'alice@test.com');
            expect(syncedAlice).toBe(alice);
        });

        it('should sync to empty when all participants are removed from draft', () => {
            const initialDraftParticipants = [CURRENT_USER_PARTICIPANT, PARTICIPANT_A, PARTICIPANT_B];
            const setSelectedOptions = jest.fn();
            const selectedAfterRestore = [makeSelectedOption(10, 'alice@test.com'), makeSelectedOption(20, 'bob@test.com')];

            setupUseOnyx(initialDraftParticipants);

            const {rerender} = renderHook(
                ({draftParticipants}) => {
                    setupUseOnyx(draftParticipants);
                    return useGroupChatDraftParticipantSync(ALL_PERSONAL_DETAIL_OPTIONS, true, {}, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, selectedAfterRestore, setSelectedOptions);
                },
                {initialProps: {draftParticipants: initialDraftParticipants}},
            );

            setSelectedOptions.mockClear();

            act(() => {
                if (!mockFocusState.cleanup) {
                    return;
                }
                mockFocusState.cleanup();
            });
            mockFocusState.isScreenFocused = false;

            // All non-current-user participants removed
            rerender({draftParticipants: [CURRENT_USER_PARTICIPANT]});

            expect(setSelectedOptions).toHaveBeenCalled();
            const synced = (setSelectedOptions.mock.calls as OptionData[][][]).at(-1)?.at(0) ?? [];
            expect(synced).toHaveLength(0);
        });

        it('should not sync when screen is focused (normal operation after restore)', () => {
            const draftParticipants = [CURRENT_USER_PARTICIPANT, PARTICIPANT_A, PARTICIPANT_B];
            const setSelectedOptions = jest.fn();
            const selectedAfterRestore = [makeSelectedOption(10, 'alice@test.com'), makeSelectedOption(20, 'bob@test.com')];

            setupUseOnyx(draftParticipants);

            const {rerender} = renderHook(
                ({draft}) => {
                    setupUseOnyx(draft);
                    return useGroupChatDraftParticipantSync(ALL_PERSONAL_DETAIL_OPTIONS, true, {}, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, selectedAfterRestore, setSelectedOptions);
                },
                {initialProps: {draft: draftParticipants}},
            );

            // Initial restore happened
            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
            setSelectedOptions.mockClear();

            // Simulate draft change while STILL focused (like toggleOption calling setGroupDraft)
            const updatedDraft = [CURRENT_USER_PARTICIPANT, PARTICIPANT_A, PARTICIPANT_B, PARTICIPANT_C];
            rerender({draft: updatedDraft});

            // Should NOT trigger any setSelectedOptions call
            expect(setSelectedOptions).not.toHaveBeenCalled();
        });
    });

    describe('selector inactivity', () => {
        it('should not react to draft changes after restore (selector returns undefined)', () => {
            const draftParticipants = [CURRENT_USER_PARTICIPANT, PARTICIPANT_A];
            const setSelectedOptions = jest.fn();

            setupUseOnyx(draftParticipants);

            const {rerender} = renderHook(
                ({draft}) => {
                    setupUseOnyx(draft);
                    return useGroupChatDraftParticipantSync(ALL_PERSONAL_DETAIL_OPTIONS, true, {}, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, [], setSelectedOptions);
                },
                {initialProps: {draft: draftParticipants}},
            );

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
            setSelectedOptions.mockClear();

            // Change draft while focused (simulating toggleOption -> setGroupDraft)
            rerender({draft: [CURRENT_USER_PARTICIPANT, PARTICIPANT_A, PARTICIPANT_B]});
            rerender({draft: [CURRENT_USER_PARTICIPANT, PARTICIPANT_A, PARTICIPANT_B, PARTICIPANT_C]});

            expect(setSelectedOptions).not.toHaveBeenCalled();
        });
    });

    describe('fallback and edge cases', () => {
        it('should use getUserToInviteOption fallback for unknown participants', () => {
            const unknownParticipant: SelectedParticipant = {accountID: 999, login: 'unknown@test.com'};
            const fallbackOption = {text: 'unknown@test.com', login: 'unknown@test.com', accountID: 999, keyForList: '999'} as OptionData;
            mockGetUserToInviteOption.mockReturnValue(fallbackOption);

            const {setSelectedOptions} = renderRestoreHook({
                draftParticipants: [unknownParticipant],
            });

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
            const restored = (setSelectedOptions.mock.calls as OptionData[][][]).at(0)?.at(0) ?? [];
            expect(restored).toHaveLength(1);
            expect(restored.at(0)?.login).toBe('unknown@test.com');
            expect(mockGetUserToInviteOption).toHaveBeenCalled();
        });

        it('should not call setSelectedOptions when draft contains only the current user', () => {
            const {setSelectedOptions} = renderRestoreHook({
                draftParticipants: [CURRENT_USER_PARTICIPANT],
            });

            expect(setSelectedOptions).not.toHaveBeenCalled();
        });

        it('should restore after personal details load (delayed loading)', () => {
            const draftParticipants = [PARTICIPANT_A, PARTICIPANT_B];
            const setSelectedOptions = jest.fn();

            setupUseOnyx(draftParticipants);

            const {rerender} = renderHook(
                ({areLoaded}) => useGroupChatDraftParticipantSync(ALL_PERSONAL_DETAIL_OPTIONS, areLoaded, {}, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, [], setSelectedOptions),
                {initialProps: {areLoaded: false}},
            );

            expect(setSelectedOptions).not.toHaveBeenCalled();

            rerender({areLoaded: true});

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
            const restored = (setSelectedOptions.mock.calls as OptionData[][][]).at(0)?.at(0) ?? [];
            expect(restored).toHaveLength(2);
        });

        it('should restore invited-by-email participant when user has no contacts', () => {
            const invited: SelectedParticipant = {accountID: 999, login: 'invited@test.com'};
            const inviteStub = {text: 'invited@test.com', login: 'invited@test.com', accountID: 999, keyForList: '999'} as OptionData;
            mockGetUserToInviteOption.mockReturnValue(inviteStub);

            const {setSelectedOptions} = renderRestoreHook({
                draftParticipants: [invited],
                allPersonalDetailOptions: [],
                areAllPersonalDetailOptionsLoaded: true,
            });

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
            const restored = (setSelectedOptions.mock.calls as OptionData[][][]).at(0)?.at(0) ?? [];
            expect(restored).toHaveLength(1);
            expect(restored.at(0)?.login).toBe('invited@test.com');
            expect(mockGetUserToInviteOption).toHaveBeenCalled();
        });
    });
});
