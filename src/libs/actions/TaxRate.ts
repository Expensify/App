import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {CreatePolicyTaxParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import * as ErrorUtils from '@src/libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TaxRate, TaxRates} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type {OnyxData} from '@src/types/onyx/Request';

/**
 * Get tax value with percentage
 */
function getTaxValueWithPercentage(value: string): string {
    return `${value}%`;
}

function covertTaxNameToID(name: string) {
    return `id_${name.toUpperCase().replaceAll(' ', '_')}`;
}

/**
 * Get new tax ID
 */
function getNextTaxCode(name: string, taxRates?: TaxRates): string {
    const newID = covertTaxNameToID(name);
    if (!taxRates?.[newID]) {
        return newID;
    }

    // If the tax ID already exists, we need to find a unique ID
    let nextID = 1;
    while (taxRates?.[covertTaxNameToID(`${name}_${nextID}`)]) {
        nextID++;
    }
    return covertTaxNameToID(`${name}_${nextID}`);
}

function createPolicyTax(policyID: string, taxRate: TaxRate) {
    if (!taxRate.code) {
        throw new Error('Tax code is required when creating a new tax rate.');
    }

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        taxes: {
                            [taxRate.code]: {
                                ...taxRate,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        taxes: {
                            [taxRate.code]: {
                                errors: null,
                                pendingAction: null,
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        taxes: {
                            [taxRate.code]: {
                                errors: ErrorUtils.getMicroSecondOnyxError('workspace.taxes.errors.genericFailureMessage'),
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        taxFields: JSON.stringify({
            name: taxRate.name,
            value: taxRate.value,
            enabled: true,
            taxCode: taxRate.code,
        }),
    } satisfies CreatePolicyTaxParams;

    API.write(WRITE_COMMANDS.CREATE_POLICY_TAX, parameters, onyxData);
}

function clearTaxRateError(policyID: string, taxID: string, pendingAction?: PendingAction) {
    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
            taxRates: {
                taxes: {
                    [taxID]: null,
                },
            },
        });
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        taxRates: {
            taxes: {
                [taxID]: {pendingAction: null, errors: null},
            },
        },
    });
}

export {createPolicyTax, clearTaxRateError, getNextTaxCode, getTaxValueWithPercentage};
