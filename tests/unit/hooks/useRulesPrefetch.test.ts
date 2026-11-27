import {act, renderHook} from '@testing-library/react-native';

import useRulesPrefetch from '@hooks/useRulesPrefetch';

import {getPolicyRules} from '@libs/actions/Policy/Rules';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxValues} from '@src/ONYXKEYS';

jest.mock('@libs/actions/Policy/Rules', () => ({
    getPolicyRules: jest.fn(),
}));

let mockIsOffline = false;
let mockOnReconnect: (() => void) | undefined;

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: ({onReconnect}: {onReconnect?: () => void} = {}) => {
        mockOnReconnect = onReconnect;
        return {isOffline: mockIsOffline};
    },
}));

const POLICY_ID = 'policy1';
const OTHER_POLICY_ID = 'policy2';
const FETCH_STATUS_KEY = ONYXKEYS.COLLECTION.RAM_ONLY_POLICY_RULES_FETCH_STATUS;
const {FAILED, LOADED, LOADING} = CONST.RULES.FETCH_STATUS;
let mockFetchStatuses: Partial<Record<string, OnyxValues[typeof FETCH_STATUS_KEY]>>;

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (key: string) => [mockFetchStatuses[key], {status: 'loaded'}],
}));

jest.mock('@src/types/utils/isLoadingOnyxValue', () => ({
    __esModule: true,
    default: () => false,
}));

const mockGetRules = jest.mocked(getPolicyRules);

describe('useRulesPrefetch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsOffline = false;
        mockFetchStatuses = {};
        mockOnReconnect = undefined;
    });

    it('asks for the workspace rules once per mount', () => {
        // Given a screen that needs one workspace's rules

        // When it renders and re-renders
        const {rerender} = renderHook(() => useRulesPrefetch(POLICY_ID));
        rerender({});

        // Then one fetch is sent for that workspace
        expect(mockGetRules).toHaveBeenCalledWith(POLICY_ID);
        expect(mockGetRules).toHaveBeenCalledTimes(1);
    });

    it('does not ask again when its own fetch fails while the screen stays open', () => {
        // Given a screen that sent the fetch on mount, which is then in flight
        const {rerender} = renderHook(() => useRulesPrefetch(POLICY_ID));
        mockFetchStatuses[`${FETCH_STATUS_KEY}${POLICY_ID}`] = LOADING;
        rerender({});

        // When the fetch fails and leaves the rules missing
        mockFetchStatuses[`${FETCH_STATUS_KEY}${POLICY_ID}`] = FAILED;
        rerender({});
        rerender({});

        // Then nothing is sent again, so a server error does not retry on every render
        expect(mockGetRules).toHaveBeenCalledTimes(1);
    });

    it('stops waiting once its own fetch has failed', () => {
        // Given a screen that sent the fetch on mount, which is then in flight
        const {result, rerender} = renderHook(() => useRulesPrefetch(POLICY_ID));
        expect(result.current.areRulesLoading).toBe(true);
        mockFetchStatuses[`${FETCH_STATUS_KEY}${POLICY_ID}`] = LOADING;
        rerender({});
        expect(result.current.areRulesLoading).toBe(true);

        // When the fetch fails
        mockFetchStatuses[`${FETCH_STATUS_KEY}${POLICY_ID}`] = FAILED;
        rerender({});

        // Then readers stop waiting, rather than being held for the rest of the session
        expect(result.current.areRulesLoading).toBe(false);
    });

    it('keeps waiting between asking and the in-flight flag landing', () => {
        // Given a screen that has just sent the fetch, whose optimistic in-flight flag has not landed yet

        // When a reader checks whether the collection is on its way
        const {result} = renderHook(() => useRulesPrefetch(POLICY_ID));

        // Then it is told to wait, so the rules do not read as settled in the gap before the flag is written
        expect(result.current.areRulesLoading).toBe(true);
    });

    it('asks for the collection when a fetch it waited on fails', () => {
        // Given a screen opened while another screen's fetch was already in flight, so it sent nothing itself
        mockFetchStatuses[`${FETCH_STATUS_KEY}${POLICY_ID}`] = LOADING;
        const {rerender} = renderHook(() => useRulesPrefetch(POLICY_ID));
        expect(mockGetRules).not.toHaveBeenCalled();

        // When that fetch fails, leaving the collection missing
        mockFetchStatuses[`${FETCH_STATUS_KEY}${POLICY_ID}`] = FAILED;
        rerender({});

        // Then this screen asks, because it still needs the collection and has not asked for it yet
        expect(mockGetRules).toHaveBeenCalledTimes(1);
    });

    it('asks again on a screen opened after a failed fetch', () => {
        // Given a fetch that failed, leaving the collection missing
        renderHook(() => useRulesPrefetch(POLICY_ID));
        expect(mockGetRules).toHaveBeenCalledTimes(1);

        // When another screen that needs the collection is opened
        renderHook(() => useRulesPrefetch(POLICY_ID));

        // Then it asks again, so the rules are not missing for the rest of the session
        expect(mockGetRules).toHaveBeenCalledTimes(2);
    });

    it('asks again after reconnecting', () => {
        // Given a screen whose fetch has already been sent
        renderHook(() => useRulesPrefetch(POLICY_ID));
        expect(mockGetRules).toHaveBeenCalledTimes(1);

        // When the connection comes back after a disconnect
        act(() => mockOnReconnect?.());

        // Then the workspace's rules are refreshed
        expect(mockGetRules).toHaveBeenCalledTimes(2);
        expect(mockGetRules).toHaveBeenLastCalledWith(POLICY_ID);
    });

    it('does not ask once the collection has arrived', () => {
        // Given a session whose fetch already succeeded
        mockFetchStatuses[`${FETCH_STATUS_KEY}${POLICY_ID}`] = LOADED;

        // When a screen that needs the collection renders
        const {result} = renderHook(() => useRulesPrefetch(POLICY_ID));

        // Then nothing is sent or waited on because that workspace is ready
        expect(mockGetRules).not.toHaveBeenCalled();
        expect(result.current).toEqual({areRulesLoading: false, haveRulesLoaded: true});
    });

    it('fetches the next workspace even when the previous one is loaded', () => {
        // Given a screen showing a workspace whose rules already loaded
        mockFetchStatuses[`${FETCH_STATUS_KEY}${POLICY_ID}`] = LOADED;
        const {result, rerender} = renderHook(({policyID}) => useRulesPrefetch(policyID), {initialProps: {policyID: POLICY_ID}});
        expect(mockGetRules).not.toHaveBeenCalled();

        // When that same screen switches to a different workspace
        rerender({policyID: OTHER_POLICY_ID});

        // Then rules from the previous workspace don't satisfy the new request
        expect(mockGetRules).toHaveBeenCalledWith(OTHER_POLICY_ID);
        expect(result.current).toEqual({areRulesLoading: true, haveRulesLoaded: false});
    });

    it('stays inert for a policy with no rules to fetch', () => {
        // Given a caller that has no reason to read the collection

        // When the hook renders disabled
        const {result} = renderHook(() => useRulesPrefetch(POLICY_ID, false));

        // Then nothing is sent, so the shared guards cannot be bypassed by a caller
        expect(mockGetRules).not.toHaveBeenCalled();
        expect(result.current.areRulesLoading).toBe(false);
    });
});
