/**
 * Module-level mirror of the Onyx data that `navigateGlobalCreate` needs at
 * shutter time. Subscribes once at app start (matching the pattern used by
 * `src/libs/actions/Session/index.ts`) and exposes a synchronous getter,
 * keeping React subscriptions off the `ScanGlobalCreate` mount path.
 *
 * The same priority logic the hooks use is shared via the `compute*` helpers
 * imported below. The drift test
 * (`tests/unit/ScanGlobalCreateHookMirrorDriftTest.tsx`) is the gate that
 * keeps this in sync with the hooks as they evolve.
 */
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {computeDefaultExpensePolicy, getSingleGroupPolicyID} from '@hooks/useDefaultExpensePolicy';
import {computePersonalPolicy} from '@hooks/usePersonalPolicy';
import type {PolicySelector} from '@hooks/usePersonalPolicy';
import {computePreferredPolicy} from '@hooks/usePreferredPolicy';
import type {PreferredPolicyResult} from '@hooks/usePreferredPolicy';
import {computeSelfDMReport} from '@hooks/useSelfDMReport';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BillingGraceEndPeriod, Policy, Report, SecurityGroup, Session} from '@src/types/onyx';

type State = {
    policies: OnyxCollection<Policy>;
    reports: OnyxCollection<Report>;
    securityGroups: OnyxCollection<SecurityGroup>;
    myDomainSecurityGroups: Record<string, string> | undefined;
    session: OnyxEntry<Session>;
    activePolicyID: string | undefined;
    personalPolicyID: string | undefined;
    cachedSelfDMReportID: string | undefined;
    amountOwed: number | undefined;
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>;
    ownerBillingGracePeriodEnd: number | undefined;
};

const emptyState: State = {
    policies: undefined,
    reports: undefined,
    securityGroups: undefined,
    myDomainSecurityGroups: undefined,
    session: undefined,
    activePolicyID: undefined,
    personalPolicyID: undefined,
    cachedSelfDMReportID: undefined,
    amountOwed: undefined,
    userBillingGracePeriodEnds: undefined,
    ownerBillingGracePeriodEnd: undefined,
};

let state: State = {...emptyState};

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        state = {...state, policies: value};
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        state = {...state, reports: value};
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.SECURITY_GROUP,
    waitForCollectionCallback: true,
    callback: (value) => {
        state = {...state, securityGroups: value};
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS,
    callback: (value) => {
        state = {...state, myDomainSecurityGroups: value ?? undefined};
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        // Clear caches only on a real account transition (sign-out or
        // account switch). Initial sign-in goes undefined→accountID and must
        // NOT wipe data that may already have arrived from other callbacks.
        const previousAccountID = state.session?.accountID;
        const nextAccountID = value?.accountID;
        const isAccountTransition = !!previousAccountID && nextAccountID !== previousAccountID;
        if (isAccountTransition) {
            state = {...emptyState, session: value ?? undefined};
            return;
        }
        state = {...state, session: value ?? undefined};
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    callback: (value) => {
        state = {...state, activePolicyID: value ?? undefined};
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_POLICY_ID,
    callback: (value) => {
        state = {...state, personalPolicyID: value ?? undefined};
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.SELF_DM_REPORT_ID,
    callback: (value) => {
        state = {...state, cachedSelfDMReportID: value ?? undefined};
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED,
    callback: (value) => {
        state = {...state, amountOwed: value ?? undefined};
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END,
    waitForCollectionCallback: true,
    callback: (value) => {
        state = {...state, userBillingGracePeriodEnds: value};
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END,
    callback: (value) => {
        state = {...state, ownerBillingGracePeriodEnd: value ?? undefined};
    },
});

function policyByID(policies: OnyxCollection<Policy>, id: string | undefined): OnyxEntry<Policy> {
    if (!id) {
        return undefined;
    }
    return policies?.[`${ONYXKEYS.COLLECTION.POLICY}${id}`];
}

type ScanGlobalCreateNavigationData = {
    defaultExpensePolicy: OnyxEntry<Policy>;
    personalPolicy: PolicySelector | undefined;
    selfDMReport: Report;
    amountOwed: number | undefined;
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>;
    ownerBillingGracePeriodEnd: number | undefined;
    accountID: number | undefined;
    login: string;
    preferredPolicy: PreferredPolicyResult;
};

function getScanGlobalCreateNavigationData(): ScanGlobalCreateNavigationData {
    const login = state.session?.email ?? '';
    const preferredPolicy = computePreferredPolicy({
        sessionEmail: state.session?.email,
        myDomainSecurityGroups: state.myDomainSecurityGroups,
        securityGroups: state.securityGroups,
    });
    const singleGroupPolicyID = getSingleGroupPolicyID(state.policies, login);
    const defaultExpensePolicy = computeDefaultExpensePolicy({
        activePolicy: policyByID(state.policies, state.activePolicyID),
        preferredPolicy: policyByID(state.policies, preferredPolicy.preferredPolicyID),
        singleGroupPolicy: policyByID(state.policies, singleGroupPolicyID),
        isRestrictedToPreferredPolicy: preferredPolicy.isRestrictedToPreferredPolicy,
        login,
    });
    const personalPolicy = computePersonalPolicy(policyByID(state.policies, state.personalPolicyID));
    const selfDMReport = computeSelfDMReport(state.reports, state.cachedSelfDMReportID);

    return {
        defaultExpensePolicy,
        personalPolicy,
        selfDMReport,
        amountOwed: state.amountOwed,
        userBillingGracePeriodEnds: state.userBillingGracePeriodEnds,
        ownerBillingGracePeriodEnd: state.ownerBillingGracePeriodEnd,
        accountID: state.session?.accountID,
        login,
        preferredPolicy,
    };
}

function resetScanGlobalCreateNavigationDataForTesting(): void {
    state = {...emptyState};
}

export {getScanGlobalCreateNavigationData, resetScanGlobalCreateNavigationDataForTesting};
export type {ScanGlobalCreateNavigationData};
