type ToolRegistration = {
    name: string;
    handler: unknown;
};

/**
 * complete_onboarding tool behavior. The real action queues a
 * CompleteGuidedSetup write and flips the flag optimistically, and the real
 * navigation leaves the app navigator, so the test mocks @userActions/Report
 * and the post-onboarding navigation and drives the Onyx keys the tool reads
 * (the flag, the persisted-requests queue, the concierge report) by hand.
 */
const mockRegistrations = new Map<string, ToolRegistration>();
const mockCompleteOnboarding = jest.fn();
const mockWaitForWrites = jest.fn();
const mockNavigateAfterOnboarding = jest.fn();

jest.mock('@appduct/web', () => ({
    registerTool: (registration: ToolRegistration) => {
        mockRegistrations.set(registration.name, registration);
        return {remove: jest.fn()};
    },
}));

jest.mock('@userActions/Session', () => {
    const CONST = require('@src/CONST').default;
    return {
        beginSignIn: jest.fn(),
        signUpUser: jest.fn(),
        isAnonymousUser: (session: {authTokenType?: string} | undefined) => session?.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
    };
});

jest.mock('@userActions/Report', () => ({
    completeOnboarding: (...args: unknown[]) => mockCompleteOnboarding(...args),
}));

jest.mock('@libs/API', () => {
    const actual = jest.requireActual('@libs/API');
    return {...actual, waitForWrites: () => mockWaitForWrites()};
});

jest.mock('@libs/navigateAfterOnboarding', () => ({
    navigateAfterOnboarding: jest.fn(),
    navigateAfterOnboardingWithMicrotaskQueue: (...args: unknown[]) => mockNavigateAfterOnboarding(...args),
    navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue: jest.fn(),
}));

import {isAnonymousUser} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
// eslint-disable-next-line no-restricted-syntax -- importing the web entry directly: native resolves a different file and Jest resolves platform files by the native preset
import registerAppductTools from '@src/setup/appductTools/index.web';

import Onyx from 'react-native-onyx';

const ANONYMOUS = CONST.AUTH_TOKEN_TYPES.ANONYMOUS;

type ToolHandler = (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
const call = (name: string, input: Record<string, unknown> = {}) => (mockRegistrations.get(name)?.handler as unknown as ToolHandler)(input);

const QUEUE_KEY = ONYXKEYS.PERSISTED_REQUESTS;

/** Seed the state the tool's preconditions require: signed in, loaded, onboarding pending, concierge loaded. */
async function seedReadyForOnboarding() {
    await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', accountID: 7, authTokenType: null});
    await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
    await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
    await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '99');
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}99`, {reportID: '99', chatType: CONST.REPORT.CHAT_TYPE.CONCIERGE});
}

describe('appduct complete_onboarding tool', () => {
    beforeAll(() => {
        jest.useRealTimers();
        expect(isAnonymousUser({authTokenType: ANONYMOUS})).toBe(true);
    });

    beforeEach(async () => {
        mockRegistrations.clear();
        mockCompleteOnboarding.mockReset();
        mockWaitForWrites.mockReset();
        mockNavigateAfterOnboarding.mockReset();
        await Onyx.init({keys: ONYXKEYS});
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
        mockCompleteOnboarding.mockImplementation(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.merge(QUEUE_KEY, [{command: 'CompleteGuidedSetup', requestID: 1}] as never);
        });
        // The response succeeds: the queue empties and the flag stays true.
        mockWaitForWrites.mockImplementation(async () => {
            await Onyx.set(QUEUE_KEY, [] as never);
        });

        const result = await call('complete_onboarding', {firstName: ' Test', lastName: 'Account', timeoutMs: 2000});

        // Then: ok only after the queue drained with the flag still true, the
        // LOOKING_AROUND choice was used, names were trimmed, and the app
        // navigated out of the onboarding modal.
        expect(result).toMatchObject({ok: true, state: {onboardingCompleted: true}});
        expect(mockCompleteOnboarding).toHaveBeenCalledTimes(1);
        const args = mockCompleteOnboarding.mock.calls[0][0] as Record<string, unknown>;
        expect(args.engagementChoice).toBe(CONST.ONBOARDING_CHOICES.LOOKING_AROUND);
        expect(args.firstName).toBe('Test');
        expect(args.lastName).toBe('Account');
        expect(args.conciergeChat).toMatchObject({reportID: '99'});
        expect(mockWaitForWrites).toHaveBeenCalledTimes(1);
        expect(mockNavigateAfterOnboarding).toHaveBeenCalledTimes(1);
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
        expect(mockCompleteOnboarding).not.toHaveBeenCalled();
        expect(mockNavigateAfterOnboarding).toHaveBeenCalledTimes(1);
    });

    it('waits for a queued request instead of posting a second one', async () => {
        // Given: the flag true while a CompleteGuidedSetup is still queued
        // (an earlier call or the UI mid-flight).
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', accountID: 7});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        await Onyx.merge(QUEUE_KEY, [{command: 'CompleteGuidedSetup', requestID: 1}] as never);
        // The in-flight request lands during the wait.
        setTimeout(() => void Onyx.set(QUEUE_KEY, [] as never), 250);

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B', timeoutMs: 2000});

        // Then: ok from draining the existing request, no second call.
        expect(result).toMatchObject({ok: true, state: {onboardingCompleted: true}});
        expect(mockCompleteOnboarding).not.toHaveBeenCalled();
    });

    it('fails with the reason when the response reverts the flag', async () => {
        // Given: the optimistic write, then a failure response that reverts it
        // (prepareOnboardingOnyxData merges hasCompletedGuidedSetupFlow false).
        await seedReadyForOnboarding();
        mockCompleteOnboarding.mockImplementation(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.merge(QUEUE_KEY, [{command: 'CompleteGuidedSetup', requestID: 1}] as never);
        });
        mockWaitForWrites.mockImplementation(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(QUEUE_KEY, [] as never);
        });

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B', timeoutMs: 2000});

        // Then: the rejection is reported, not the optimistic success.
        expect(result.ok).toBe(false);
        expect(String(result.reason)).toContain('reverted');
        expect(mockNavigateAfterOnboarding).not.toHaveBeenCalled();
    });

    it('fails when the request never leaves the queue', async () => {
        // Given: offline, where waitForIdle resolves without the server seeing
        // the request.
        await seedReadyForOnboarding();
        mockCompleteOnboarding.mockImplementation(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.merge(QUEUE_KEY, [{command: 'CompleteGuidedSetup', requestID: 1}] as never);
        });
        mockWaitForWrites.mockResolvedValue(undefined);

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B', timeoutMs: 2000});

        // Then: queued-but-unsent is named, so an offline run cannot be read
        // as onboarding-complete.
        expect(result.ok).toBe(false);
        expect(String(result.reason)).toContain('never left the queue');
    });

    it('fails with the unmet precondition when the app never becomes ready', async () => {
        // Given: still anonymous and loading.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'anon', authTokenType: ANONYMOUS});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B', timeoutMs: 300});

        // Then: the reason names which precondition failed to hold.
        expect(result.ok).toBe(false);
        expect(String(result.reason)).toContain('preconditions never held');
        expect(String(result.reason)).toContain('signedIn=false');
        expect(mockCompleteOnboarding).not.toHaveBeenCalled();
    });

    it('fails when the concierge report never loads', async () => {
        // Given: preconditions hold but no concierge report exists; without it
        // the action silently does nothing, so the tool must catch this itself.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', accountID: 7});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B', timeoutMs: 300});

        // Then: ok:false with the concierge report named, action untouched.
        expect(result.ok).toBe(false);
        expect(String(result.reason)).toContain('concierge report never loaded');
        expect(mockCompleteOnboarding).not.toHaveBeenCalled();
    });
});
