import {WRITE_COMMANDS} from '@libs/API/types';

import {isAnonymousUser} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, AnyRequest, Credentials, IntroSelected, Onboarding, Report, Session as SessionOnyx} from '@src/types/onyx';

import type {Connection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// Read outside React, so rulesdir/no-onyx-connect requires connectWithoutView.
const state: {
    session?: SessionOnyx;
    credentials?: Credentials;
    account?: Account;
    onboarding?: Onboarding;
    introSelected?: IntroSelected;
    isLoadingApp?: boolean;
    conciergeReportID?: string;
    conciergeChat?: Report;
    onboardingPolicyID?: string;
    onboardingAdminsChatReportID?: string;
    completeGuidedSetupQueued?: boolean;
    completeGuidedSetupOngoing?: boolean;
} = {};

Onyx.connectWithoutView({key: ONYXKEYS.SESSION, callback: (value) => (state.session = value)});
Onyx.connectWithoutView({key: ONYXKEYS.CREDENTIALS, callback: (value) => (state.credentials = value)});
Onyx.connectWithoutView({key: ONYXKEYS.ACCOUNT, callback: (value) => (state.account = value)});
Onyx.connectWithoutView({key: ONYXKEYS.NVP_ONBOARDING, callback: (value) => (state.onboarding = value)});
Onyx.connectWithoutView({key: ONYXKEYS.NVP_INTRO_SELECTED, callback: (value) => (state.introSelected = value)});
Onyx.connectWithoutView({key: ONYXKEYS.IS_LOADING_APP, callback: (value) => (state.isLoadingApp = value)});
Onyx.connectWithoutView({key: ONYXKEYS.ONBOARDING_POLICY_ID, callback: (value) => (state.onboardingPolicyID = value)});
Onyx.connectWithoutView({key: ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, callback: (value) => (state.onboardingAdminsChatReportID = value)});
// The sequential queue moves its head request to PERSISTED_ONGOING_REQUESTS before the response lands, so the
// request is pending while it sits in either key. Watching only the queue would report it as finished mid-flight,
// when the onboarding flag is still optimistic and a rejection can revert it.
function hasGuidedSetupRequest(value: AnyRequest | AnyRequest[] | null | undefined): boolean {
    const requests = Array.isArray(value) ? value : [value];
    return requests.some((request) => request?.command === WRITE_COMMANDS.COMPLETE_GUIDED_SETUP);
}
Onyx.connectWithoutView({key: ONYXKEYS.PERSISTED_REQUESTS, callback: (requests) => (state.completeGuidedSetupQueued = hasGuidedSetupRequest(requests))});
Onyx.connectWithoutView({key: ONYXKEYS.PERSISTED_ONGOING_REQUESTS, callback: (request) => (state.completeGuidedSetupOngoing = hasGuidedSetupRequest(request))});

function isGuidedSetupPending(): boolean {
    return !!state.completeGuidedSetupQueued || !!state.completeGuidedSetupOngoing;
}

// The Concierge report ID arrives from OpenApp after sign-in, so the report itself is connected late.
let conciergeChatConnection: Connection | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.CONCIERGE_REPORT_ID,
    callback: (reportID) => {
        if (reportID === state.conciergeReportID) {
            return;
        }
        state.conciergeReportID = reportID;
        state.conciergeChat = undefined;
        if (conciergeChatConnection) {
            conciergeChatConnection.unsubscribe();
        }
        conciergeChatConnection = reportID ? Onyx.connectWithoutView({key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, callback: (report) => (state.conciergeChat = report)}) : undefined;
    },
});

function getCurrentAccountID(): number | undefined {
    return state.session?.accountID ?? state.credentials?.accountID;
}

function getSessionLogin(): string | undefined {
    return state.session?.email ?? state.credentials?.login;
}

// beginSignIn applies its optimistic isLoading only once Device.getDeviceInfoWithID() resolves, so ACCOUNT still
// holds the idle value seeded by src/setup/index.ts right after it is called. A caller that waits for the
// response has to put the loading state in first, or its very first read passes on that stale value.
function markSignInAttemptLoading(): Promise<void> {
    // eslint-disable-next-line rulesdir/prefer-actions-set-data -- pre-applies beginSignIn's own optimistic ACCOUNT update, value for value, so the tool can wait for this attempt's response
    return Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true, loadingForm: CONST.FORMS.LOGIN_FORM});
}

function isSignedIn(): boolean {
    return !!state.session?.authToken && !isAnonymousUser(state.session);
}

// Not hasCompletedGuidedSetupFlowSelector: it returns true for an empty or unloaded value.
function getOnboardingCompletedFlag(): boolean | null {
    const value = state.onboarding?.hasCompletedGuidedSetupFlow;
    return typeof value === 'boolean' ? value : null;
}

export {state, hasGuidedSetupRequest, getCurrentAccountID, getSessionLogin, isSignedIn, isGuidedSetupPending, markSignInAttemptLoading, getOnboardingCompletedFlag};
