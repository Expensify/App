import {waitForWrites} from '@libs/API';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';

import {completeOnboarding} from '@userActions/Report';
import {isAnonymousUser} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import registerAppductTools from '@src/setup/appductTools/index.web';
import type Report from '@src/types/onyx/Report';
import type {AnyRequest} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

/**
 * complete_onboarding tool behavior. The real action queues a
 * CompleteGuidedSetup write and flips the flag optimistically, so the test
 * mocks the action and the post-onboarding navigation and drives the Onyx keys
 * the tool reads (the flag, the persisted-requests queue, the concierge
 * report) by hand.
 */
type ToolRegistration = {
    name: string;
    handler: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

const mockRegistrations = new Map<string, ToolRegistration>();

jest.mock('@appduct/web', () => ({
    registerTool: (registration: ToolRegistration) => {
        mockRegistrations.set(registration.name, registration);
        return {remove: jest.fn()};
    },
}));

jest.mock('@userActions/Session', () => ({
    beginSignIn: jest.fn(),
    signUpUser: jest.fn(),
    isAnonymousUser: jest.requireActual<{isAnonymousUser: (session: {authTokenType?: string} | undefined) => boolean}>('@userActions/Session').isAnonymousUser,
}));

jest.mock('@userActions/Report', () => ({
    completeOnboarding: jest.fn(),
}));

jest.mock('@libs/API', () => ({
    waitForWrites: jest.fn(),
}));

jest.mock('@libs/navigateAfterOnboarding', () => ({
    navigateAfterOnboarding: jest.fn(),
    navigateAfterOnboardingWithMicrotaskQueue: jest.fn(),
    navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue: jest.fn(),
}));

const ANONYMOUS = CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
const QUEUE_KEY = ONYXKEYS.PERSISTED_REQUESTS;

/** What the tool matches on in the persisted-requests queue. */
const queuedGuidedSetup: AnyRequest[] = [{command: 'CompleteGuidedSetup'}];

const call = (name: string, input: Record<string, unknown> = {}) => mockRegistrations.get(name)?.handler(input);

/** Seed the state the preconditions require: signed in, loaded, onboarding pending, concierge loaded. */
async function seedReadyForOnboarding() {
    await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', accountID: 7, authTokenType: null});
    await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
    await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
    await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '99');
    // The tool reads only reportID here; prepareOnboardingOnyxData returns
    // nothing without it, which is the failure the tool must detect itself.
    const conciergeReport: Report = {reportID: '99'};
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}99`, conciergeReport);
}

describe('appduct complete_onboarding tool', () => {
    beforeAll(() => {
        jest.useRealTimers();
        // Guards the mock against drifting from the real anonymous token type.
        expect(isAnonymousUser({authTokenType: ANONYMOUS})).toBe(true);
    });

    beforeEach(async () => {
        mockRegistrations.clear();
        jest.mocked(completeOnboarding).mockReset().mockResolvedValue(undefined);
        jest.mocked(waitForWrites).mockReset().mockResolvedValue(undefined);
        jest.mocked(navigateAfterOnboardingWithMicrotaskQueue).mockReset();
        Onyx.init({keys: ONYXKEYS});
        await Onyx.clear();
        registerAppductTools();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('completes with the looking-around choice and returns only after the queue drains', async () => {
        // Given: everything the preconditions check, and an action that behaves
        // like the real one: optimistic flag, queued request, resolved promise.
        await seedReadyForOnboarding();
        jest.mocked(completeOnboarding).mockImplementation(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.merge(QUEUE_KEY, queuedGuidedSetup);
        });
        // The response succeeds: the queue empties and the flag stays true.
        jest.mocked(waitForWrites).mockImplementation(async () => {
            await Onyx.set(QUEUE_KEY, []);
        });

        const result = await call('complete_onboarding', {firstName: ' Test', lastName: 'Account', timeoutMs: 2000});

        // Then: ok only after the queue drained with the flag still true, the
        // LOOKING_AROUND choice was used, names were trimmed, and the app
        // navigated out of the onboarding modal.
        expect(result).toMatchObject({ok: true, state: {onboardingCompleted: true}});
        expect(completeOnboarding).toHaveBeenCalledTimes(1);
        const [args] = jest.mocked(completeOnboarding).mock.calls.at(0) ?? [];
        expect(args?.engagementChoice).toBe(CONST.ONBOARDING_CHOICES.LOOKING_AROUND);
        expect(args?.firstName).toBe('Test');
        expect(args?.lastName).toBe('Account');
        expect(args?.conciergeChat).toMatchObject({reportID: '99'});
        expect(waitForWrites).toHaveBeenCalledTimes(1);
        expect(navigateAfterOnboardingWithMicrotaskQueue).toHaveBeenCalledTimes(1);
    });

    it('reports already when the flag is true and nothing is queued, without calling the action', async () => {
        // Given: a completed flag, no queued CompleteGuidedSetup.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', accountID: 7});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B', timeoutMs: 2000});

        // Then: a second CompleteGuidedSetup is never posted (server-side
        // dedupe is unverified, so the tool does not rely on it); the
        // navigation still runs so a modal left mounted gets closed.
        expect(result).toMatchObject({ok: true, already: true, state: {onboardingCompleted: true}});
        expect(completeOnboarding).not.toHaveBeenCalled();
        expect(navigateAfterOnboardingWithMicrotaskQueue).toHaveBeenCalledTimes(1);
    });

    it('waits for a queued request instead of posting a second one', async () => {
        // Given: the flag true while a CompleteGuidedSetup is still queued
        // (an earlier call or the UI mid-flight). The request lands during the
        // tool's wait.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', accountID: 7});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        await Onyx.merge(QUEUE_KEY, queuedGuidedSetup);
        setTimeout(() => {
            Onyx.set(QUEUE_KEY, []);
        }, 250);

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B', timeoutMs: 2000});

        // Then: ok from draining the existing request, no second call.
        expect(result).toMatchObject({ok: true, state: {onboardingCompleted: true}});
        expect(completeOnboarding).not.toHaveBeenCalled();
    });

    it('fails with the reason when the response reverts the flag', async () => {
        // Given: the optimistic write, then a failure response that reverts it
        // (prepareOnboardingOnyxData merges hasCompletedGuidedSetupFlow false).
        await seedReadyForOnboarding();
        jest.mocked(completeOnboarding).mockImplementation(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.merge(QUEUE_KEY, queuedGuidedSetup);
        });
        jest.mocked(waitForWrites).mockImplementation(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(QUEUE_KEY, []);
        });

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B', timeoutMs: 2000});

        // Then: the rejection is reported, not the optimistic success.
        expect(result?.ok).toBe(false);
        expect(String(result?.reason)).toContain('reverted');
        expect(navigateAfterOnboardingWithMicrotaskQueue).not.toHaveBeenCalled();
    });

    it('fails when the request never leaves the queue', async () => {
        // Given: offline, where waitForIdle resolves without the server seeing
        // the request.
        await seedReadyForOnboarding();
        jest.mocked(completeOnboarding).mockImplementation(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.merge(QUEUE_KEY, queuedGuidedSetup);
        });

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B', timeoutMs: 2000});

        // Then: queued-but-unsent is named, so an offline run cannot be read
        // as onboarding-complete.
        expect(result?.ok).toBe(false);
        expect(String(result?.reason)).toContain('never left the queue');
    });

    it('fails with the unmet precondition when the app never becomes ready', async () => {
        // Given: still anonymous and loading.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'anon', authTokenType: ANONYMOUS});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B', timeoutMs: 300});

        // Then: the reason names which precondition failed to hold.
        expect(result?.ok).toBe(false);
        expect(String(result?.reason)).toContain('preconditions never held');
        expect(String(result?.reason)).toContain('signedIn=false');
        expect(completeOnboarding).not.toHaveBeenCalled();
    });

    it('fails when the concierge report never loads', async () => {
        // Given: preconditions hold but no concierge report exists; without it
        // the action silently does nothing, so the tool must catch this itself.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', accountID: 7});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B', timeoutMs: 300});

        // Then: ok:false with the concierge report named, action untouched.
        expect(result?.ok).toBe(false);
        expect(String(result?.reason)).toContain('concierge report never loaded');
        expect(completeOnboarding).not.toHaveBeenCalled();
    });
});
