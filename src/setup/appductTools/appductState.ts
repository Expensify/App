// Read outside React, so rulesdir/no-onyx-connect requires connectWithoutView. Read-only: the tools
// act through the same actions the UI calls.
import {isAnonymousUser} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Credentials, IntroSelected, Onboarding, Report, Session as SessionOnyx} from '@src/types/onyx';
import type {AnyRequest} from '@src/types/onyx/Request';

import type {Connection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

const state = {
    session: undefined as SessionOnyx | undefined,
    credentials: undefined as Credentials | undefined,
    account: undefined as Account | undefined,
    onboarding: undefined as Onboarding | undefined,
    introSelected: undefined as IntroSelected | undefined,
    isLoadingApp: undefined as boolean | undefined,
    conciergeReportID: undefined as string | undefined,
    conciergeChat: undefined as Report | undefined,
    onboardingPolicyID: undefined as string | undefined,
    onboardingAdminsChatReportID: undefined as string | undefined,
    persistedRequests: undefined as AnyRequest[] | undefined,
};

Onyx.connectWithoutView({key: ONYXKEYS.SESSION, callback: (value) => (state.session = value ?? undefined)});
Onyx.connectWithoutView({key: ONYXKEYS.CREDENTIALS, callback: (value) => (state.credentials = value ?? undefined)});
Onyx.connectWithoutView({key: ONYXKEYS.ACCOUNT, callback: (value) => (state.account = value ?? undefined)});
Onyx.connectWithoutView({key: ONYXKEYS.NVP_ONBOARDING, callback: (value) => (state.onboarding = value ?? undefined)});
Onyx.connectWithoutView({key: ONYXKEYS.NVP_INTRO_SELECTED, callback: (value) => (state.introSelected = value ?? undefined)});
Onyx.connectWithoutView({key: ONYXKEYS.IS_LOADING_APP, callback: (value) => (state.isLoadingApp = value ?? undefined)});
Onyx.connectWithoutView({key: ONYXKEYS.ONBOARDING_POLICY_ID, callback: (value) => (state.onboardingPolicyID = value ?? undefined)});
Onyx.connectWithoutView({
    key: ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID,
    callback: (value) => (state.onboardingAdminsChatReportID = value ?? undefined),
});
Onyx.connectWithoutView({key: ONYXKEYS.PERSISTED_REQUESTS, callback: (value) => (state.persistedRequests = value ?? undefined)});

// The Concierge report ID arrives from OpenApp after sign-in, so its member key is connected late.
let conciergeChatConnection: Connection | undefined;
let conciergeChatKey: string | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.CONCIERGE_REPORT_ID,
    callback: (value) => {
        state.conciergeReportID = value ?? undefined;
        // A stored variable widens the template literal to `string`, which OnyxKey
        // rejects; this key stays the tracked id and the connect below gets the
        // literal inline.
        const memberKey = value === undefined ? undefined : `${ONYXKEYS.COLLECTION.REPORT}${value}`;
        if (memberKey === conciergeChatKey) {
            return;
        }
        if (conciergeChatConnection) {
            Onyx.disconnect(conciergeChatConnection);
        }
        conciergeChatKey = memberKey;
        state.conciergeChat = undefined;
        if (value !== undefined) {
            conciergeChatConnection = Onyx.connectWithoutView({
                key: `${ONYXKEYS.COLLECTION.REPORT}${value}`,
                callback: (report) => (state.conciergeChat = report ?? undefined),
            });
        }
    },
});

function currentAccountID(): number | undefined {
    return state.session?.accountID ?? state.credentials?.accountID;
}

function sessionLogin(): string | undefined {
    return state.session?.email ?? state.credentials?.login;
}

function isSignedIn(): boolean {
    return !!state.session?.authToken && !isAnonymousUser(state.session);
}

// Not hasCompletedGuidedSetupFlowSelector: it returns true for an empty or unloaded value.
function onboardingCompletedFlag(): boolean | null {
    const value = state.onboarding?.hasCompletedGuidedSetupFlow;
    return typeof value === 'boolean' ? value : null;
}

function isCompleteGuidedSetupQueued(): boolean {
    return (state.persistedRequests ?? []).some((request) => request.command === 'CompleteGuidedSetup');
}

export {state, currentAccountID, sessionLogin, isSignedIn, onboardingCompletedFlag, isCompleteGuidedSetupQueued};
