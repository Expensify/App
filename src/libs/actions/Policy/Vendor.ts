import {write} from '@libs/API';
import type {SetPolicyVendorsEnabledParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyVendor, PolicyVendors} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type SetPolicyVendorsEnabledArgs = {
    policyID: string;
    vendorIDs: string[];
    enabled: boolean;
    policyVendors?: OnyxEntry<PolicyVendors>;
};

function setPolicyVendorsEnabled({policyID, vendorIDs, enabled, policyVendors}: SetPolicyVendorsEnabledArgs) {
    if (!vendorIDs.length) {
        return;
    }

    const optimisticVendors: Record<string, Partial<PolicyVendor>> = {};
    const successVendors: Record<string, Partial<PolicyVendor>> = {};
    const failureVendors: Record<string, Partial<PolicyVendor>> = {};

    for (const vendorID of vendorIDs) {
        const existing = policyVendors?.[vendorID];
        optimisticVendors[vendorID] = {
            ...existing,
            enabled,
            pendingFields: {
                ...existing?.pendingFields,
                enabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
            pendingAction: existing?.pendingAction ?? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            errors: null,
        };

        successVendors[vendorID] = {
            ...existing,
            enabled,
            pendingFields: {
                ...existing?.pendingFields,
                enabled: null,
            },
            pendingAction: null,
            errors: null,
        };

        failureVendors[vendorID] = {
            ...existing,
            pendingFields: {
                ...existing?.pendingFields,
                enabled: null,
            },
            pendingAction: null,
            errors: getMicroSecondOnyxErrorWithTranslationKey('workspace.vendors.updateFailureMessage'),
        };
    }

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY_VENDORS> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_VENDORS}${policyID}`,
                value: optimisticVendors,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_VENDORS}${policyID}`,
                value: successVendors,
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_VENDORS}${policyID}`,
                value: failureVendors,
            },
        ],
    };

    const parameters: SetPolicyVendorsEnabledParams = {
        policyID,
        vendorIDs: JSON.stringify(vendorIDs),
        enabled,
    };

    write(WRITE_COMMANDS.SET_POLICY_VENDORS_ENABLED, parameters, onyxData);
}

function clearVendorErrors(policyID: string, vendorID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY_VENDORS}${policyID}`, {
        [vendorID]: {
            errors: null,
            pendingAction: null,
            pendingFields: null,
            errorFields: null,
        },
    });
}

export {setPolicyVendorsEnabled, clearVendorErrors};
