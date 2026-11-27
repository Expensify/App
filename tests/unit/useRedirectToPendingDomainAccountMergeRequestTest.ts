import {act, renderHook} from '@testing-library/react-native';

import useRedirectToPendingDomainAccountMergeRequest from '@hooks/useRedirectToPendingDomainAccountMergeRequest';

import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {DomainAccountMergeRequest} from '@src/types/onyx';

import type * as ReactNavigationNative from '@react-navigation/native';

import {useFocusEffect} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useFocusEffect: jest.fn(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));

const mockIsBetaEnabled = jest.fn(() => true);
jest.mock('@hooks/usePermissions', () => () => ({isBetaEnabled: mockIsBetaEnabled}));

const requesterAccountID = 1;
const email = 'requester@example.com';
const request: DomainAccountMergeRequest = {
    requestID: '123',
    requesterAccountID,
    sourceAccountID: 2,
    targetAccountID: 3,
    sourceDomainAccountID: 4,
    targetDomainAccountID: 5,
    createdAt: '2026-11-20T00:00:00Z',
};
const requestKey = `${ONYXKEYS.COLLECTION.DOMAIN_ACCOUNT_MERGE_REQUEST}${request.requestID}` as const;

function focusScreen() {
    const callback = jest.mocked(useFocusEffect).mock.calls.at(-1)?.[0];
    if (!callback) {
        throw new Error('Expected the hook to register a focus effect');
    }
    return callback();
}

describe('useRedirectToPendingDomainAccountMergeRequest', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockIsBetaEnabled.mockReturnValue(true);
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID: requesterAccountID, email});
        await waitForBatchedUpdates();
    });

    it('returns the stored request and replaces the focused screen with the pending result after transitions', async () => {
        // Given an eligible requester with whitespace around their session email
        await Onyx.set(requestKey, request);
        await Onyx.merge(ONYXKEYS.SESSION, {email: ` ${email} `});
        const transition = TransitionTracker.startTransition();

        // When the merge screen focuses during a transition
        const {result} = renderHook(() => useRedirectToPendingDomainAccountMergeRequest());
        focusScreen();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        TransitionTracker.endTransition(transition);

        // Then navigation waits for the transition and replaces the form using the trimmed email
        expect(result.current).toEqual(request);
        expect(mockIsBetaEnabled).toHaveBeenCalledWith(CONST.BETAS.MERGE_DOMAIN_ACCOUNTS);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email, CONST.MERGE_ACCOUNT_RESULTS.PENDING_DOMAIN_APPROVAL), {forceReplace: true});
    });

    it.each(['disabled beta', 'missing request', 'another requester', 'missing email', 'missing account ID'] as const)('does not redirect for %s', async (scenario) => {
        // Given one of the prerequisites for redirecting is not satisfied
        await Onyx.set(requestKey, scenario === 'missing request' ? null : {...request, requesterAccountID: scenario === 'another requester' ? 2 : requesterAccountID});
        mockIsBetaEnabled.mockReturnValue(scenario !== 'disabled beta');
        if (scenario === 'missing email') {
            await Onyx.set(ONYXKEYS.SESSION, {accountID: requesterAccountID});
        }
        if (scenario === 'missing account ID') {
            await Onyx.set(ONYXKEYS.SESSION, {email});
        }

        // When the merge screen focuses
        const {result} = renderHook(() => useRedirectToPendingDomainAccountMergeRequest());
        focusScreen();

        // Then no redirect occurs, and only an eligible user's own request is exposed
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(result.current).toEqual(scenario === 'missing email' ? request : undefined);
    });

    it('reacts to requests arriving and being removed from Onyx', async () => {
        // Given the screen initially has no pending request
        const {result} = renderHook(() => useRedirectToPendingDomainAccountMergeRequest());
        focusScreen();
        expect(result.current).toBeUndefined();
        expect(Navigation.navigate).not.toHaveBeenCalled();

        // When a request arrives and the screen focuses again
        await act(async () => {
            await Onyx.set(requestKey, request);
            await waitForBatchedUpdates();
        });
        focusScreen();

        // Then the subscribed hook returns the request and redirects
        expect(result.current).toEqual(request);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);

        // When the authoritative request is removed
        await act(async () => {
            await Onyx.set(requestKey, null);
            await waitForBatchedUpdates();
        });
        focusScreen();

        // Then the hook clears its result and does not redirect again
        expect(result.current).toBeUndefined();
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });

    it('cancels a queued redirect when the focus effect is cleaned up', async () => {
        // Given a redirect waiting for an active transition to finish
        await Onyx.set(requestKey, request);
        const transition = TransitionTracker.startTransition();
        renderHook(() => useRedirectToPendingDomainAccountMergeRequest());
        const cleanup = focusScreen();

        // When the screen loses focus before the transition ends
        cleanup?.();
        TransitionTracker.endTransition(transition);

        // Then leaving the screen prevents stale navigation
        expect(cleanup).toEqual(expect.any(Function));
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});
