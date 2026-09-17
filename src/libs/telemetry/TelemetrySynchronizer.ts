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

/**
 * Buckets policy count into cohorts for Sentry tagging
 */
function bucketPolicyCount(count: number): string {
    if (count <= 1) {
        return '0-1';
    }
    if (count <= 10) {
        return '2-10';
    }
    if (count <= 50) {
        return '11-50';
    }
    if (count <= 100) {
        return '51-100';
    }
    if (count <= 250) {
        return '101-250';
    }
    if (count <= 500) {
        return '251-500';
    }
    if (count <= 1000) {
        return '501-1000';
    }
    return '1000+';
}

/**
 * Buckets report count into cohorts for Sentry tagging
 */
function bucketReportCount(count: number): string {
    if (count <= 60) {
        return '0-60';
    }
    if (count <= 300) {
        return '61-300';
    }
    if (count <= 1000) {
        return '301-1000';
    }
    if (count <= 2500) {
        return '1001-2500';
    }
    if (count <= 5000) {
        return '2501-5000';
    }
    if (count <= 10000) {
        return '5001-10000';
    }
    return '10000+';
}

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

    const policiesCountBucket = bucketPolicyCount(activePolicies.length);
    Sentry.setTag(CONST.TELEMETRY.TAGS.ACTIVE_POLICY, activePolicyID);
    Sentry.setTag(CONST.TELEMETRY.TAGS.POLICIES_COUNT, policiesCountBucket);
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
    const reportsCountBucket = bucketReportCount(reportsCount);
    Sentry.setTag(CONST.TELEMETRY.TAGS.REPORTS_COUNT, reportsCountBucket);
    setGlobalSpanAttribute(CONST.TELEMETRY.ATTRIBUTE_REPORTS_COUNT_RAW, reportsCount);
}

function sendPersonalDetailsCount(personalDetailsCount: number) {
    const personalDetailsCountBucket = bucketReportCount(personalDetailsCount);
    Sentry.setTag(CONST.TELEMETRY.TAGS.PERSONAL_DETAILS_COUNT, personalDetailsCountBucket);
    setGlobalSpanAttribute(CONST.TELEMETRY.ATTRIBUTE_PERSONAL_DETAILS_COUNT_RAW, personalDetailsCount);
}

function sendTransactionsCount(transactionsCount: number) {
    // Attribute only for now. The bucketed tag comes once borders can be derived from this data (https://github.com/Expensify/App/issues/98432).
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
