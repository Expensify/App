import {isAnonymousUser} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, AnyRequest, Credentials, IntroSelected, Onboarding, Policy, Report, Session as SessionOnyx} from '@src/types/onyx';

import type {Connection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

// Tool handlers run outside React, between renders, so they read Onyx through module-level connectWithoutView subscriptions.
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
    activePolicyID?: string;
    countryCode?: number;
    policies?: Record<string, Policy | undefined>;
} = {};

Onyx.connectWithoutView({key: ONYXKEYS.SESSION, callback: (value) => (state.session = value)});
Onyx.connectWithoutView({key: ONYXKEYS.CREDENTIALS, callback: (value) => (state.credentials = value)});
Onyx.connectWithoutView({key: ONYXKEYS.ACCOUNT, callback: (value) => (state.account = value)});
Onyx.connectWithoutView({key: ONYXKEYS.NVP_ONBOARDING, callback: (value) => (state.onboarding = value)});
Onyx.connectWithoutView({key: ONYXKEYS.NVP_INTRO_SELECTED, callback: (value) => (state.introSelected = value)});
Onyx.connectWithoutView({key: ONYXKEYS.IS_LOADING_APP, callback: (value) => (state.isLoadingApp = value)});
Onyx.connectWithoutView({key: ONYXKEYS.ONBOARDING_POLICY_ID, callback: (value) => (state.onboardingPolicyID = value)});
Onyx.connectWithoutView({key: ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, callback: (value) => (state.onboardingAdminsChatReportID = value)});
Onyx.connectWithoutView({key: ONYXKEYS.NVP_ACTIVE_POLICY_ID, callback: (value) => (state.activePolicyID = value)});
Onyx.connectWithoutView({key: ONYXKEYS.COUNTRY_CODE, callback: (value) => (state.countryCode = value)});
Onyx.connectWithoutView({key: ONYXKEYS.COLLECTION.POLICY, callback: (policies) => (state.policies = policies)});

// Commands waiting to reach the server. A request is pending while it sits in either queue key: the sequential queue
// moves its head request from PERSISTED_REQUESTS into PERSISTED_ONGOING_REQUESTS before the response lands, so a tool
// that watched only one key would miss it and could send a second copy.
function pendingCommandNames(value: AnyRequest | AnyRequest[] | null | undefined): Set<string> {
    const requests = Array.isArray(value) ? value : [value];
    const commands = new Set<string>();
    for (const request of requests) {
        if (request?.command) {
            commands.add(request.command);
        }
    }
    return commands;
}

const queuedCommands = new Set<string>();
const ongoingCommands = new Set<string>();

function refill(target: Set<string>, source: Set<string>): void {
    target.clear();
    for (const command of source) {
        target.add(command);
    }
}

Onyx.connectWithoutView({
    key: ONYXKEYS.PERSISTED_REQUESTS,
    callback: (requests) => refill(queuedCommands, pendingCommandNames(requests)),
});
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSISTED_ONGOING_REQUESTS,
    callback: (request) => refill(ongoingCommands, pendingCommandNames(request)),
});

function isRequestPending(command: string): boolean {
    return queuedCommands.has(command) || ongoingCommands.has(command);
}

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

// beginSignIn sets isLoading only after getDeviceInfoWithID() resolves; set it first so a waiter can't read the idle boot value.
function markSignInAttemptLoading(): Promise<void> {
    // eslint-disable-next-line rulesdir/prefer-actions-set-data -- mirrors beginSignIn's own optimistic ACCOUNT update
    return Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true, loadingForm: CONST.FORMS.LOGIN_FORM});
}

function isSignedIn(): boolean {
    return !!state.session?.authToken && !isAnonymousUser(state.session);
}

// Not hasCompletedGuidedSetupFlowSelector: it returns true for an unloaded value.
function getOnboardingCompletedFlag(): boolean | null {
    const value = state.onboarding?.hasCompletedGuidedSetupFlow;
    return typeof value === 'boolean' ? value : null;
}

function getPolicy(policyID: string): Policy | undefined {
    return state.policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
}

export {state, getCurrentAccountID, getSessionLogin, getPolicy, isSignedIn, isRequestPending, markSignInAttemptLoading, getOnboardingCompletedFlag};
