/**
 * This file contains the logic for sending additional data to Sentry.
 *
 * It uses Onyx.connectWithoutView as nothing here is related to the UI. We only send data to the external provider and want to keep this outside of the render loop.
 */
import * as Sentry from '@sentry/react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Session} from '@src/types/onyx';
import FS from './Fullstory';
import {getActivePolicies} from './PolicyUtils';

/**
 * Connect to FullStory to retrieve session id from it. We want to link FullStory with Sentry for easier debugging.
 */
FS.onReady().then(async () => {
    const sessionId = await FS.getSessionId();
    if (!sessionId) {
        return;
    }
    Sentry.setContext(CONST.TELEMETRY.CONTEXT_FULLSTORY, {sessionId});
});

/**
 * Connect to Onyx to retrive information about user's active policies.
 */
let session: OnyxEntry<Session>;
let activePolicyID: OnyxEntry<string>;
let policies: OnyxCollection<Policy>;

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
            return;
        }
        session = value;
        sendPoliciesContext();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }
        policies = value;
        sendPoliciesContext();
    },
});

function sendPoliciesContext() {
    if (!policies || !session?.email || !activePolicyID) {
        return;
    }
    const activePolicies = getActivePolicies(policies, session.email).map((policy) => policy.id);
    Sentry.setTag(CONST.TELEMETRY.TAG_ACTIVE_POLICY, activePolicyID);
    Sentry.setContext(CONST.TELEMETRY.CONTEXT_POLICIES, {activePolicyID, activePolicies});
}
