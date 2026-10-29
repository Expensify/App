import {act, renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

import * as OptionsListUtilsModule from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';

import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import type {SelectedParticipant} from '@src/types/onyx/NewGroupChatDraft';

import type * as ReactNavigation from '@react-navigation/native';

import useGroupChatDraftParticipantSync from '../../src/pages/NewChatPage/useGroupChatDraftParticipantSync';
import {translateLocal as translate} from '../utils/TestHelper';

const mockUseOnyx: jest.Mock = jest.mocked(useOnyx);
const mockGetUserToInviteOption = jest.mocked(OptionsListUtilsModule.getUserToInviteOption);

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
        useNavigation: () => ({
            isFocused: () => mockFocusState.isScreenFocused,
            addListener: () => () => {},
        }),
    };
});

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'current@test.com';

function makePersonalDetail(accountID: number, login: string): PersonalDetails {
    return {accountID, login, displayName: login};
}

function makeSelectedOption(accountID: number, login: string): OptionData {
    return {
        accountID,
        login,
        text: login,
        keyForList: String(accountID),
        reportID: '',
        isSelected: true,
    };
}

const PARTICIPANT_A: SelectedParticipant = {accountID: 10, login: 'alice@test.com'};
const PARTICIPANT_B: SelectedParticipant = {accountID: 20, login: 'bob@test.com'};
const PARTICIPANT_C: SelectedParticipant = {accountID: 30, login: 'carol@test.com'};
const CURRENT_USER_PARTICIPANT: SelectedParticipant = {accountID: CURRENT_USER_ACCOUNT_ID, login: CURRENT_USER_EMAIL};

const ALL_PERSONAL_DETAILS: PersonalDetailsList = {
    [CURRENT_USER_ACCOUNT_ID]: makePersonalDetail(CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL),
    [PARTICIPANT_A.accountID]: makePersonalDetail(PARTICIPANT_A.accountID, 'alice@test.com'),
    [PARTICIPANT_B.accountID]: makePersonalDetail(PARTICIPANT_B.accountID, 'bob@test.com'),
    [PARTICIPANT_C.accountID]: makePersonalDetail(PARTICIPANT_C.accountID, 'carol@test.com'),
};

describe('useGroupDraftRestore', () => {
    beforeEach(() => {
        mockFocusState.cleanup = undefined;
        mockFocusState.isScreenFocused = true;
        mockGetUserToInviteOption.mockReturnValue(null);
    });

    function setupUseOnyx(draftParticipants: SelectedParticipant[] | undefined, draftStatus: 'loading' | 'loaded' = 'loaded') {
        mockUseOnyx.mockImplementation((key: string, options?: {selector?: (draft: unknown) => unknown}) => {
            if (key === 'newGroupChatDraft') {
                const draft = draftParticipants ? {participants: draftParticipants} : undefined;
                const value = options?.selector ? options.selector(draft) : draft;
                return [value, {status: draftStatus}];
            }
            return [undefined, {status: 'loaded'}];
        });
    }

    function renderRestoreHook(overrides?: {
        allPersonalDetails?: PersonalDetailsList;
        areOptionsInitialized?: boolean;
        selectedOptions?: OptionData[];
        draftParticipants?: SelectedParticipant[] | undefined;
        draftStatus?: 'loading' | 'loaded';
    }) {
        const setSelectedOptions = jest.fn<void, [OptionData[]]>();
        const {allPersonalDetails = ALL_PERSONAL_DETAILS, areOptionsInitialized = true, selectedOptions = [], draftParticipants, draftStatus = 'loaded'} = overrides ?? {};

        setupUseOnyx(draftParticipants, draftStatus);

        const {rerender} = renderHook(() =>
            useGroupChatDraftParticipantSync(areOptionsInitialized, allPersonalDetails, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, translate, selectedOptions, setSelectedOptions),
        );

        return {setSelectedOptions, rerender};
    }

    describe('initial restore', () => {
        it('should restore selected options from draft on mount', () => {
            const draftParticipants = [CURRENT_USER_PARTICIPANT, PARTICIPANT_A, PARTICIPANT_B];
            const {setSelectedOptions} = renderRestoreHook({draftParticipants});

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
            const restored = setSelectedOptions.mock.calls.at(0)?.at(0) ?? [];
            expect(restored).toHaveLength(2);
            expect(restored.at(0)?.accountID).toBe(PARTICIPANT_A.accountID);
            expect(restored.at(1)?.accountID).toBe(PARTICIPANT_B.accountID);
            expect(restored.every((option) => option.isSelected)).toBe(true);
        });

        it('should exclude current user from restored options', () => {
            const draftParticipants = [CURRENT_USER_PARTICIPANT, PARTICIPANT_A];
            const {setSelectedOptions} = renderRestoreHook({draftParticipants});

            const restored = setSelectedOptions.mock.calls.at(0)?.at(0) ?? [];
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
                areOptionsInitialized: false,
            });

            expect(setSelectedOptions).not.toHaveBeenCalled();
        });

        it('should not restore twice on subsequent renders', () => {
            const draftParticipants = [PARTICIPANT_A];
            setupUseOnyx(draftParticipants);

            const setSelectedOptions = jest.fn<void, [OptionData[]]>();
            const {rerender} = renderHook(() =>
                useGroupChatDraftParticipantSync(true, ALL_PERSONAL_DETAILS, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, translate, [], setSelectedOptions),
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
            const setSelectedOptions = jest.fn<void, [OptionData[]]>();
            const selectedAfterRestore = [makeSelectedOption(10, 'alice@test.com'), makeSelectedOption(20, 'bob@test.com'), makeSelectedOption(30, 'carol@test.com')];

            setupUseOnyx(initialDraftParticipants);

            // Initial render triggers restore
            const {rerender} = renderHook(
                ({draftParticipants}) => {
                    setupUseOnyx(draftParticipants);
                    return useGroupChatDraftParticipantSync(true, ALL_PERSONAL_DETAILS, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, translate, selectedAfterRestore, setSelectedOptions);
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
            const synced = setSelectedOptions.mock.calls.at(-1)?.at(0) ?? [];
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
            const setSelectedOptions = jest.fn<void, [OptionData[]]>();
            const selectedAfterRestore = [makeSelectedOption(10, 'alice@test.com'), makeSelectedOption(20, 'bob@test.com')];

            setupUseOnyx(initialDraftParticipants);

            const {rerender} = renderHook(
                ({draftParticipants}) => {
                    setupUseOnyx(draftParticipants);
                    return useGroupChatDraftParticipantSync(true, ALL_PERSONAL_DETAILS, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, translate, selectedAfterRestore, setSelectedOptions);
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
            const synced = setSelectedOptions.mock.calls.at(-1)?.at(0) ?? [];
            expect(synced).toHaveLength(0);
        });

        it('should not sync when screen is focused (normal operation after restore)', () => {
            const draftParticipants = [CURRENT_USER_PARTICIPANT, PARTICIPANT_A, PARTICIPANT_B];
            const setSelectedOptions = jest.fn<void, [OptionData[]]>();
            const selectedAfterRestore = [makeSelectedOption(10, 'alice@test.com'), makeSelectedOption(20, 'bob@test.com')];

            setupUseOnyx(draftParticipants);

            const {rerender} = renderHook(
                ({draft}) => {
                    setupUseOnyx(draft);
                    return useGroupChatDraftParticipantSync(true, ALL_PERSONAL_DETAILS, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, translate, selectedAfterRestore, setSelectedOptions);
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
            const setSelectedOptions = jest.fn<void, [OptionData[]]>();

            setupUseOnyx(draftParticipants);

            const {rerender} = renderHook(
                ({draft}) => {
                    setupUseOnyx(draft);
                    return useGroupChatDraftParticipantSync(true, ALL_PERSONAL_DETAILS, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, translate, [], setSelectedOptions);
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
            const fallbackOption: OptionData = {text: 'unknown@test.com', login: 'unknown@test.com', accountID: 999, keyForList: '999', reportID: ''};
            mockGetUserToInviteOption.mockReturnValue(fallbackOption);

            const {setSelectedOptions} = renderRestoreHook({
                draftParticipants: [unknownParticipant],
            });

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
            const restored = setSelectedOptions.mock.calls.at(0)?.at(0) ?? [];
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
            const setSelectedOptions = jest.fn<void, [OptionData[]]>();

            setupUseOnyx(draftParticipants);

            const {rerender} = renderHook(
                ({areLoaded}) => useGroupChatDraftParticipantSync(areLoaded, ALL_PERSONAL_DETAILS, {}, CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, translate, [], setSelectedOptions),
                {initialProps: {areLoaded: false}},
            );

            expect(setSelectedOptions).not.toHaveBeenCalled();

            rerender({areLoaded: true});

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
            const restored = setSelectedOptions.mock.calls.at(0)?.at(0) ?? [];
            expect(restored).toHaveLength(2);
        });

        it('should restore invited-by-email participant when user has no contacts', () => {
            const invited: SelectedParticipant = {accountID: 999, login: 'invited@test.com'};
            const inviteStub: OptionData = {text: 'invited@test.com', login: 'invited@test.com', accountID: 999, keyForList: '999', reportID: ''};
            mockGetUserToInviteOption.mockReturnValue(inviteStub);

            const {setSelectedOptions} = renderRestoreHook({
                draftParticipants: [invited],
                allPersonalDetails: {},
                areOptionsInitialized: true,
            });

            expect(setSelectedOptions).toHaveBeenCalledTimes(1);
            const restored = setSelectedOptions.mock.calls.at(0)?.at(0) ?? [];
            expect(restored).toHaveLength(1);
            expect(restored.at(0)?.login).toBe('invited@test.com');
            expect(mockGetUserToInviteOption).toHaveBeenCalled();
        });
    });
});
