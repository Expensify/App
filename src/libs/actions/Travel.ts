import * as API from '@libs/API';
import type {AcceptSpotnanaTermsParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type TravelMembersSelection = {
    /** Whether every workspace member gets travel */
    shouldEnableAllTravelMembers: boolean;

    /** The members who get travel when not every member does */
    travelMemberAccountIDs: number[];
};

/**
 * Accept Spotnana terms and conditions to receive a proper token used for authenticating further actions. When travel
 * is being enabled for the workspace, travelMembers says who gets it, and every member does when it's omitted.
 */
function acceptSpotnanaTerms(domain?: string, policyID?: string, taxID?: string, travelMembers?: TravelMembersSelection) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_TRAVEL_SETTINGS | typeof ONYXKEYS.TRAVEL_PROVISIONING>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                hasAcceptedTerms: true,
            },
        },
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: true,
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.TRAVEL_PROVISIONING | typeof ONYXKEYS.COLLECTION.POLICY>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
            value: {
                travelSettings: {
                    hasAcceptedTerms: true,
                    ...(taxID ? {taxID} : {}),
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_TRAVEL_SETTINGS | typeof ONYXKEYS.TRAVEL_PROVISIONING>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                hasAcceptedTerms: false,
            },
        },
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.TRAVEL_PROVISIONING,
            value: {
                isLoading: false,
            },
        },
    ];

    const params: AcceptSpotnanaTermsParams = {
        domainName: domain,
        policyID,
        taxID,
        ...(travelMembers
            ? {
                  shouldEnableAllTravelMembers: travelMembers.shouldEnableAllTravelMembers,
                  ...(travelMembers.shouldEnableAllTravelMembers ? {} : {travelMemberAccountIDList: travelMembers.travelMemberAccountIDs.join(',')}),
              }
            : {}),
    };

    // We need to call this API immediately to get the response and open the travel page.
    // See https://github.com/Expensify/App/pull/69769#discussion_r2368967354 for more info.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.ACCEPT_SPOTNANA_TERMS, params, {optimisticData, successData, failureData});
}

function requestTravelAccess() {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_TRAVEL_SETTINGS>> = [
        {
            onyxMethod: 'merge',
            key: ONYXKEYS.NVP_TRAVEL_SETTINGS,
            value: {
                lastTravelSignupRequestTime: Date.now().toString(),
            },
        },
    ];
    API.write(WRITE_COMMANDS.TRAVEL_SIGNUP_REQUEST, null, {optimisticData});
}

function setTravelProvisioningTaxID(taxID: string) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {taxID});
}

function setTravelProvisioningDomain(domain: string) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {domain});
}

function setTravelProvisioningNextStep(nextStepRoute?: Route) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {nextStepRoute});
}

/** Save who can book travel for the workspace being set up, so the choice only applies to that workspace. */
function setTravelProvisioningMembers(policyID: string, {shouldEnableAllTravelMembers, travelMemberAccountIDs}: TravelMembersSelection) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {shouldEnableAllTravelMembers, travelMemberAccountIDs, travelMembersPolicyID: policyID});
}

/** Forget the members chosen in an earlier travel setup, so they aren't offered again on another workspace. */
function clearTravelProvisioningMembers() {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {shouldEnableAllTravelMembers: null, travelMemberAccountIDs: null, travelMembersPolicyID: null});
}

function setTravelProvisioningEnabledSteps(enabledSteps: string[]) {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, {enabledSteps});
}

function cleanupTravelProvisioningSession() {
    Onyx.merge(ONYXKEYS.TRAVEL_PROVISIONING, null);
}

export {
    acceptSpotnanaTerms,
    cleanupTravelProvisioningSession,
    clearTravelProvisioningMembers,
    requestTravelAccess,
    setTravelProvisioningDomain,
    setTravelProvisioningEnabledSteps,
    setTravelProvisioningMembers,
    setTravelProvisioningNextStep,
    setTravelProvisioningTaxID,
};
export type {TravelMembersSelection};
