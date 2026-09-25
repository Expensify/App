import {getActivePolicies} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Session, TryNewDot} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/**
 * This file contains the logic for sending additional data to Sentry.
 *
 * It uses Onyx.connectWithoutView as nothing here is related to the UI. We only send data to the external provider and want to keep this outside of the render loop.
 */
import * as Sentry from '@sentry/react-native';
import Onyx from 'react-native-onyx';

import getAccountSizeTier from './accountSizeTier';
import {cleanupCrashDiagnostics, initializeCrashDiagnostics} from './crashDiagnostics';
import {cleanupDatabaseSizeTracking, requestDatabaseSizeRemeasurement} from './databaseSizeTracker';
import {clearGlobalSpanAttributes, setGlobalSpanAttribute} from './globalSpanAttributes';
import {cleanupMemoryTracking, initializeMemoryTracking} from './sendMemoryContext';

/**
 * Connect to Onyx to retrieve information about the user's active policies.
 */
let session: OnyxEntry<Session>;
let activePolicyID: OnyxEntry<string>;
let policies: OnyxCollection<Policy>;
let tryNewDot: OnyxEntry<TryNewDot>;

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    callback: (value) => {
        if (!value) {
            return;
        }
        activePolicyID = value;
        sendPoliciesContext();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        if (!value?.email) {
            session = undefined;
            handleAccountChange();
            return;
        }
        const previousEmail = session?.email;
        session = value;
        if (previousEmail && previousEmail !== value.email) {
            handleAccountChange();
        }
        sendPoliciesContext();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (value) => {
        if (!value || !session?.email) {
            return;
        }
        policies = value;
        sendPoliciesContext();
        requestDatabaseSizeRemeasurement(Object.keys(value).length);
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (value) => {
        if (!value || !session?.email) {
            return;
        }
        const reportsCount = Object.keys(value).length;
        sendReportsCount(reportsCount);
        requestDatabaseSizeRemeasurement(reportsCount);
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        if (!value || !session?.email) {
            return;
        }
        const personalDetailsCount = Object.keys(value).length;
        sendPersonalDetailsCount(personalDetailsCount);
        requestDatabaseSizeRemeasurement(personalDetailsCount);
    },
});

// This module-level callback updates telemetry without rendering UI.
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    callback: (value) => {
        if (!value && !session?.email) {
            return;
        }
        // An account can have zero transactions, which Onyx delivers as undefined. Count it as 0 so the zero cohort stays in the data.
        const transactionsCount = Object.keys(value ?? {}).length;
        sendTransactionsCount(transactionsCount);
        requestDatabaseSizeRemeasurement(transactionsCount);
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_TRY_NEW_DOT,
    callback: (value) => {
        tryNewDot = value;
        sendTryNewDotCohortTag();
    },
});

function handleAccountChange() {
    clearGlobalSpanAttributes();
    activePolicyID = undefined;
    policies = undefined;
}

function sendPoliciesContext() {
    if (!policies || !session?.email || !activePolicyID) {
        return;
    }
    const activePolicies = getActivePolicies(policies, session.email).map((policy) => policy.id);

    let userRole: string = CONST.POLICY.ROLE.USER;
    for (const policy of Object.values(policies)) {
        if (policy?.role === CONST.POLICY.ROLE.ADMIN) {
            userRole = CONST.POLICY.ROLE.ADMIN;
            break;
        }
        if (policy?.role === CONST.POLICY.ROLE.AUDITOR) {
            userRole = CONST.POLICY.ROLE.AUDITOR;
        }
    }

    Sentry.setTag(CONST.TELEMETRY.TAGS.ACTIVE_POLICY, activePolicyID);
    Sentry.setTag(CONST.TELEMETRY.TAGS.POLICIES_COUNT, getAccountSizeTier(CONST.TELEMETRY.TAGS.POLICIES_COUNT, activePolicies.length));
    Sentry.setTag(CONST.TELEMETRY.TAGS.USER_ROLE, userRole);
    Sentry.setContext(CONST.TELEMETRY.CONTEXT_POLICIES, {activePolicyID, activePolicies});
    setGlobalSpanAttribute(CONST.TELEMETRY.ATTRIBUTE_POLICIES_COUNT_RAW, activePolicies.length);
}

function sendTryNewDotCohortTag() {
    const cohort = tryNewDot?.nudgeMigration?.cohort;
    if (!cohort) {
        return;
    }
    Sentry.setTag(CONST.TELEMETRY.TAGS.NUDGE_MIGRATION_COHORT, cohort);
}

function sendReportsCount(reportsCount: number) {
    Sentry.setTag(CONST.TELEMETRY.TAGS.REPORTS_COUNT, getAccountSizeTier(CONST.TELEMETRY.TAGS.REPORTS_COUNT, reportsCount));
    setGlobalSpanAttribute(CONST.TELEMETRY.ATTRIBUTE_REPORTS_COUNT_RAW, reportsCount);
}

function sendPersonalDetailsCount(personalDetailsCount: number) {
    Sentry.setTag(CONST.TELEMETRY.TAGS.PERSONAL_DETAILS_COUNT, getAccountSizeTier(CONST.TELEMETRY.TAGS.PERSONAL_DETAILS_COUNT, personalDetailsCount));
    setGlobalSpanAttribute(CONST.TELEMETRY.ATTRIBUTE_PERSONAL_DETAILS_COUNT_RAW, personalDetailsCount);
}

function sendTransactionsCount(transactionsCount: number) {
    Sentry.setTag(CONST.TELEMETRY.TAGS.TRANSACTIONS_COUNT, getAccountSizeTier(CONST.TELEMETRY.TAGS.TRANSACTIONS_COUNT, transactionsCount));
    setGlobalSpanAttribute(CONST.TELEMETRY.ATTRIBUTE_TRANSACTIONS_COUNT_RAW, transactionsCount);
}

function initializeTelemetryTrackers() {
    initializeMemoryTracking();
    initializeCrashDiagnostics();
}

function cleanupTelemetryTrackers() {
    cleanupMemoryTracking();
    cleanupCrashDiagnostics();
    cleanupDatabaseSizeTracking();
}

export {initializeTelemetryTrackers, cleanupTelemetryTrackers};
