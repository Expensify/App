import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {CreatePolicyTaxParams, DeletePolicyTaxesParams, SetPolicyTaxesEnabledParams, UpdatePolicyTaxValueParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import * as ErrorUtils from '@src/libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, TaxRate} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {OnyxData} from '@src/types/onyx/Request';

let allPolicies: OnyxCollection<Policy>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

/**
 * Get tax value with percentage
 */
function getTaxValueWithPercentage(value: string): string {
    return `${value}%`;
}

/**
 * Get new tax object
 */
function getNextTaxID(name: string): string {
    return `id_${name.toUpperCase().replaceAll(' ', '_')}`;
}

function createWorkspaceTax(policyID: string, taxRate: TaxRate) {
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
                                errors: null,
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
                                pendingAction: null,
                                errors: null,
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
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
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

function clearTaxRateError(policyID: string, taxID: string, pendingAction?: OnyxCommon.PendingAction) {
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

type TaxRateEnabledMap = Record<string, Pick<TaxRate, 'isDisabled' | 'pendingAction'>>;

function setPolicyTaxesEnabled(policyID: string, taxesIDsToUpdate: string[], isEnabled: boolean) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const originalTaxes = {...policy?.taxRates?.taxes};

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        taxes: taxesIDsToUpdate.reduce((acc, taxID) => {
                            acc[taxID] = {isDisabled: !isEnabled, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE};
                            return acc;
                        }, {} as TaxRateEnabledMap),
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
                        taxes: taxesIDsToUpdate.reduce((acc, taxID) => {
                            acc[taxID] = {isDisabled: !isEnabled, pendingAction: null};
                            return acc;
                        }, {} as TaxRateEnabledMap),
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
                        taxes: taxesIDsToUpdate.reduce((acc, taxID) => {
                            acc[taxID] = {isDisabled: !!originalTaxes[taxID].isDisabled, pendingAction: null};
                            return acc;
                        }, {} as TaxRateEnabledMap),
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        taxFieldsArray: JSON.stringify(taxesIDsToUpdate.map((taxID) => ({taxCode: originalTaxes[taxID].name, enabled: isEnabled}))),
    } satisfies SetPolicyTaxesEnabledParams;

    API.write(WRITE_COMMANDS.SET_POLICY_TAXES_ENABLED, parameters, onyxData);
}

type TaxRateDeleteMap = Record<
    string,
    | (Pick<TaxRate, 'pendingAction'> & {
          errors: OnyxCommon.Errors | null;
      })
    | null
>;

/**
 * API call to delete policy taxes
 * @param taxesToDelete A tax IDs array to delete
 */
function deletePolicyTaxes(policyID: string, taxesToDelete: string[]) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const policyTaxRates = policy?.taxRates?.taxes;

    if (!policyTaxRates) {
        throw new Error('Policy or tax rates not found');
    }

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        taxes: taxesToDelete.reduce((acc, taxID) => {
                            acc[taxID] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: null};
                            return acc;
                        }, {} as TaxRateDeleteMap),
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
                        taxes: taxesToDelete.reduce((acc, taxID) => {
                            acc[taxID] = null;
                            return acc;
                        }, {} as TaxRateDeleteMap),
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
                        taxes: taxesToDelete.reduce((acc, taxID) => {
                            acc[taxID] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: ErrorUtils.getMicroSecondOnyxError('workspace.taxes.genericFailureMessage')};
                            return acc;
                        }, {} as TaxRateDeleteMap),
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        taxNames: JSON.stringify(taxesToDelete.map((taxID) => policyTaxRates[taxID].name)),
    } as DeletePolicyTaxesParams;

    API.write(WRITE_COMMANDS.DELETE_POLICY_TAXES, parameters, onyxData);
}

/**
 * Rename policy tax
 */
function updatePolicyTaxValue(policyID: string, taxID: string, taxValue: number) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const originalTaxRate = {...policy?.taxRates?.taxes[taxID]};
    const stringTaxValue = `${taxValue}%`;

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        taxes: {
                            [taxID]: {
                                value: stringTaxValue,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                errors: null,
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
                            [taxID]: {value: stringTaxValue, pendingAction: null, errors: null},
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
                            [taxID]: {value: originalTaxRate.value, pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxError('workspace.taxes.genericFailureMessage')},
                        },
                    },
                },
            },
        ],
    };

    if (!originalTaxRate.name) {
        throw new Error('Tax rate name not found');
    }

    const parameters = {
        policyID,
        taxCode: taxID,
        taxAmount: Number(taxValue),
    } as UpdatePolicyTaxValueParams;

    API.write(WRITE_COMMANDS.UPDATE_POLICY_TAX_VALUE, parameters, onyxData);
}

function renamePolicyTax(policyID: string, taxID: string, newName: string) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const originalTaxRate = {...policy?.taxRates?.taxes[taxID]};
    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        taxes: {
                            [taxID]: {
                                name: newName,
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                errors: null,
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
                            [taxID]: {name: newName, pendingAction: null, errors: null},
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
                            [taxID]: {name: originalTaxRate.name, pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxError('workspace.taxes.genericFailureMessage')},
                        },
                    },
                },
            },
        ],
    };

    if (!originalTaxRate.name) {
        throw new Error('Tax rate name not found');
    }

    const parameters = {
        policyID,
        taxCode: taxID,
        newName,
    };

    API.write(WRITE_COMMANDS.RENAME_POLICY_TAX, parameters, onyxData);
}

export {createWorkspaceTax, clearTaxRateError, getNextTaxID, getTaxValueWithPercentage, setPolicyTaxesEnabled, deletePolicyTaxes, updatePolicyTaxValue, renamePolicyTax};
