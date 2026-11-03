import {isAnonymousUser} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Credentials, IntroSelected, Onboarding, Report, Session as SessionOnyx} from '@src/types/onyx';

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
} = {};

Onyx.connectWithoutView({key: ONYXKEYS.SESSION, callback: (value) => (state.session = value)});
Onyx.connectWithoutView({key: ONYXKEYS.CREDENTIALS, callback: (value) => (state.credentials = value)});
Onyx.connectWithoutView({key: ONYXKEYS.ACCOUNT, callback: (value) => (state.account = value)});
Onyx.connectWithoutView({key: ONYXKEYS.NVP_ONBOARDING, callback: (value) => (state.onboarding = value)});
Onyx.connectWithoutView({key: ONYXKEYS.NVP_INTRO_SELECTED, callback: (value) => (state.introSelected = value)});
Onyx.connectWithoutView({key: ONYXKEYS.IS_LOADING_APP, callback: (value) => (state.isLoadingApp = value)});
Onyx.connectWithoutView({key: ONYXKEYS.ONBOARDING_POLICY_ID, callback: (value) => (state.onboardingPolicyID = value)});
Onyx.connectWithoutView({key: ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, callback: (value) => (state.onboardingAdminsChatReportID = value)});
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (requests) => (state.completeGuidedSetupQueued = !!requests?.some((request) => request.command === 'CompleteGuidedSetup')),
});

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
            Onyx.disconnect(conciergeChatConnection);
        }
        conciergeChatConnection = reportID ? Onyx.connectWithoutView({key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, callback: (report) => (state.conciergeChat = report)}) : undefined;
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

export {state, currentAccountID, sessionLogin, isSignedIn, onboardingCompletedFlag};
