import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';
import {waitForWrites} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import navigationRef from '@libs/Navigation/navigationRef';

import {completeOnboarding} from '@userActions/Report';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import NAVIGATORS from '@src/NAVIGATORS';

import {hasSeenTourSelector} from '@selectors/Onboarding';

import type {AppductTool} from './types';

import {isCompleteGuidedSetupQueued, isSignedIn, onboardingCompletedFlag, state} from './appductState';
import waitFor from './waitFor';

/**
 * Finish first-run onboarding with minimal choices: the LOOKING_AROUND purpose
 * ("Something else"), the given first and last name, no workspace. The contract
 * is defined by the CI caller and mirrored in the description below.
 *
 * The guarantee is the *stored* flag, not the dispatch: `completeOnboarding`
 * resolves when the CompleteGuidedSetup request is queued and flips the flag
 * optimistically, so the tool waits for the sequential queue to drain, re-reads
 * the raw flag, and only then dismisses the onboarding modal and navigates.
 */
function registerCompleteOnboardingTool(registerTool: (tool: AppductTool) => void) {
    const preconditionFailure = (timeoutMs: number) =>
        `onboarding preconditions never held within ${timeoutMs}ms: ` +
        `signedIn=${isSignedIn()}, isLoadingApp=${String(state.isLoadingApp)}, onboardingLoaded=${onboardingCompletedFlag() !== null}`;

    registerTool({
        name: 'complete_onboarding',
        description:
            'Complete first-run onboarding with the "looking around" engagement choice and the given name, through the same action the onboarding form performs. ' +
            'Waits for the stored onboarding-complete flag after the write queue drains, then closes the onboarding modal and lands on the home screen. ' +
            'Returns ok:false with a reason instead of throwing.',
        inputSchema: {
            type: 'object',
            properties: {
                firstName: {type: 'string', description: 'First name to store.'},
                lastName: {type: 'string', description: 'Last name to store.'},
                timeoutMs: {type: 'number', description: 'Budget in ms for the preconditions and the server round trip. Default 60000.'},
            },
            required: ['firstName', 'lastName'],
        },
        outputSchema: {
            type: 'object',
            properties: {
                ok: {type: 'boolean'},
                already: {type: 'boolean'},
                state: {type: 'object'},
                reason: {type: 'string'},
            },
            required: ['ok'],
        },
        timeoutMs: 180_000,
        handler: async (input) => {
            // Defensive reads: the raw JSON Schema drives export, the handler is
            // the last place a malformed call can be turned into a reason.
            const firstName = typeof input.firstName === 'string' ? input.firstName.trim() : '';
            const lastName = typeof input.lastName === 'string' ? input.lastName.trim() : '';
            if (!firstName || !lastName) {
                return {ok: false, reason: 'firstName and lastName are required strings'};
            }
            const budget = typeof input.timeoutMs === 'number' ? input.timeoutMs : 60_000;

            // Signed in, app finished loading, and nvp_onboarding loaded. The
            // flag must be read as loaded before `false` can be told apart
            // from "not loaded yet".
            const ready = await waitFor(() => isSignedIn() && state.isLoadingApp === false && onboardingCompletedFlag() !== null, budget);
            if (!ready) {
                return {ok: false, reason: preconditionFailure(budget)};
            }

            // The modal is only mounted while the flag is false (AuthScreens
            // registers the navigator on that condition). With nothing queued,
            // a completed flag means a previous call or the UI already did the
            // work; still run the post-completion navigation so a modal left
            // mounted by an interrupted exit gets closed.
            if (onboardingCompletedFlag() === true && !isCompleteGuidedSetupQueued()) {
                exitOnboardingNavigation();
                await waitFor(onboardingModalClosed, 5_000);
                return {ok: true, already: true, state: {onboardingCompleted: true, onboardingModalClosed: onboardingModalClosed()}};
            }

            // A request still queued from an earlier call: do not post a second
            // CompleteGuidedSetup, wait for that one instead.
            if (isCompleteGuidedSetupQueued()) {
                const drained = await waitFor(() => !isCompleteGuidedSetupQueued() && onboardingCompletedFlag() === true, budget);
                if (!drained) {
                    return {ok: false, reason: 'a CompleteGuidedSetup request stayed queued past the timeout, or its response reverted the flag'};
                }
            } else {
                // LOOKING_AROUND needs the Concierge report as its target chat.
                // Without a reportID, prepareOnboardingOnyxData returns nothing
                // and completeOnboarding does nothing at all, with no error
                // anywhere. The tool has to fail this check itself.
                const conciergeLoaded = await waitFor(() => !!state.conciergeReportID && !!state.conciergeChat?.reportID, budget);
                if (!conciergeLoaded) {
                    return {ok: false, reason: `concierge report never loaded (conciergeReportID=${String(state.conciergeReportID)})`};
                }

                const {onboardingMessages} = getOnboardingMessages(IntlStore.getCurrentLocale());
                const accountID = state.session?.accountID ?? state.credentials?.accountID;

                await completeOnboarding({
                    engagementChoice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND,
                    onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.LOOKING_AROUND],
                    firstName,
                    lastName,
                    adminsChatReportID: state.onboardingAdminsChatReportID,
                    onboardingPolicyID: state.onboardingPolicyID,
                    introSelected: state.introSelected,
                    isSelfTourViewed: hasSeenTourSelector(state.onboarding),
                    conciergeChat: state.conciergeChat,
                    currentUserAccountID: accountID ?? CONST.DEFAULT_NUMBER_ID,
                    delegateAccountID: undefined,
                });

                // The promise resolves at queue time. The flag is optimistic
                // from that moment and only the response can settle it, so wait
                // for the queue to go idle, then re-read the settled state.
                // waitForIdle also resolves while offline, where the request
                // was only queued locally, so the queue itself gets checked.
                await waitForWrites(WRITE_COMMANDS.COMPLETE_GUIDED_SETUP);
                const drained = await waitFor(() => !isCompleteGuidedSetupQueued(), 2_000);
                if (!drained) {
                    return {ok: false, reason: 'CompleteGuidedSetup never left the queue (offline? the server never saw it)'};
                }

                if (onboardingCompletedFlag() !== true) {
                    return {ok: false, reason: 'server rejected CompleteGuidedSetup: the onboarding flag reverted to false'};
                }
            }

            // The navigator stays mounted until something navigates out of it
            // (the comment in navigateAfterOnboarding.ts claiming otherwise is
            // stale). The UI's own call needs layout inputs, so hand it the
            // same values the page would read.
            exitOnboardingNavigation();
            await waitFor(onboardingModalClosed, 5_000);

            return {ok: true, state: {onboardingCompleted: true, onboardingModalClosed: onboardingModalClosed()}};
        },
    });
}

/** Run the UI's post-onboarding exit: dismiss the modal, land on the right screen. */
function exitOnboardingNavigation() {
    // The second argument (canUseDefaultRooms) is the UI's isBetaEnabled(DEFAULT_ROOMS).
    // A fresh CI account carries no betas, so false matches what the page would compute;
    // it only selects domain rooms in findLastAccessedReport, which a fresh account has none of.
    // The fifth (isAnonymousUser) is false: the tool only runs once signed in as a real user.
    navigateAfterOnboardingWithMicrotaskQueue(getIsSmallScreenWidth(), false, state.conciergeReportID, undefined, false, state.onboardingPolicyID, undefined, false);
}

/** True once the onboarding modal navigator is no longer in the root stack. */
function onboardingModalClosed(): boolean {
    if (!navigationRef.isReady()) {
        return true;
    }
    const rootState = navigationRef.getRootState();
    return !rootState?.routes.some((route) => route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
}

export default registerCompleteOnboardingTool;
