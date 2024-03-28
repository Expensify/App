import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {FormOnyxValues} from '@components/Form/types';
import * as API from '@libs/API';
import type {CreatePolicyTaxParams, DeletePolicyTaxesParams, RenamePolicyTaxParams, SetPolicyTaxesEnabledParams, UpdatePolicyTaxValueParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import * as ErrorUtils from '@src/libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceNewTaxForm';
import type {Policy, TaxRate, TaxRates} from '@src/types/onyx';
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

function covertTaxNameToID(name: string) {
    return `id_${name.toUpperCase().replaceAll(' ', '_')}`;
}

/**
 *  Function to validate tax name
 */
const validateTaxName = (policy: Policy, values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_NAME_FORM>) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.NAME]);

    const name = values[INPUT_IDS.NAME];
    if (policy?.taxRates?.taxes && ValidationUtils.isExistingTaxName(name, policy.taxRates.taxes)) {
        errors[INPUT_IDS.NAME] = 'workspace.taxes.errors.taxRateAlreadyExists';
    }

    return errors;
};

/**
 *  Function to validate tax value
 */
const validateTaxValue = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_VALUE_FORM>) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.VALUE]);

    const value = values[INPUT_IDS.VALUE];
    if (!ValidationUtils.isValidPercentage(value)) {
        errors[INPUT_IDS.VALUE] = 'workspace.taxes.errors.valuePercentageRange';
    }

    return errors;
};

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
        console.debug('Policy or tax rates not found');
        return;
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
                                errors: ErrorUtils.getMicroSecondOnyxError('workspace.taxes.errors.createFailureMessage'),
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

function clearTaxRateFieldError(policyID: string, taxID: string, field: keyof TaxRate) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
        taxRates: {
            taxes: {
                [taxID]: {
                    pendingFields: {
                        [field]: null,
                    },
                    errorFields: {
                        [field]: null,
                    },
                },
            },
        },
    });
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
                [taxID]: {pendingAction: null, errors: null, errorFields: null},
            },
        },
    });
}

type TaxRateEnabledMap = Record<string, Pick<TaxRate, 'isDisabled' | 'errors' | 'pendingAction' | 'pendingFields' | 'errorFields'>>;

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
                        taxes: taxesIDsToUpdate.reduce<TaxRateEnabledMap>((acc, taxID) => {
                            acc[taxID] = {
                                isDisabled: !isEnabled,
                                pendingFields: {isDisabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                errorFields: {isDisabled: null},
                            };
                            return acc;
                        }, {}),
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
                        taxes: taxesIDsToUpdate.reduce<TaxRateEnabledMap>((acc, taxID) => {
                            acc[taxID] = {pendingFields: {isDisabled: null}, errorFields: {isDisabled: null}};
                            return acc;
                        }, {}),
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
                        taxes: taxesIDsToUpdate.reduce<TaxRateEnabledMap>((acc, taxID) => {
                            acc[taxID] = {
                                isDisabled: !!originalTaxes[taxID].isDisabled,
                                pendingFields: {isDisabled: null},
                                errorFields: {isDisabled: ErrorUtils.getMicroSecondOnyxError('workspace.taxes.errors.updateFailureMessage')},
                            };
                            return acc;
                        }, {}),
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        taxFieldsArray: JSON.stringify(taxesIDsToUpdate.map((taxID) => ({taxCode: taxID, enabled: isEnabled}))),
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

function deletePolicyTaxes(policyID: string, taxesToDelete: string[]) {
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const policyTaxRates = policy?.taxRates?.taxes;
    const foreignTaxDefault = policy?.taxRates?.foreignTaxDefault;
    const firstTaxID = Object.keys(policyTaxRates ?? {}).sort((a, b) => a.localeCompare(b))[0];

    if (!policyTaxRates) {
        console.debug('Policy or tax rates not found');
        return;
    }

    const isForeignTaxRemoved = foreignTaxDefault && taxesToDelete.includes(foreignTaxDefault);

    const onyxData: OnyxData = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        pendingFields: {foreignTaxDefault: isForeignTaxRemoved ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null},
                        foreignTaxDefault: isForeignTaxRemoved ? firstTaxID : foreignTaxDefault,
                        taxes: taxesToDelete.reduce<TaxRateDeleteMap>((acc, taxID) => {
                            acc[taxID] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: null};
                            return acc;
                        }, {}),
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
                        pendingFields: {foreignTaxDefault: null},
                        taxes: taxesToDelete.reduce<TaxRateDeleteMap>((acc, taxID) => {
                            acc[taxID] = null;
                            return acc;
                        }, {}),
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
                        pendingFields: {foreignTaxDefault: null},
                        taxes: taxesToDelete.reduce<TaxRateDeleteMap>((acc, taxID) => {
                            acc[taxID] = {
                                pendingAction: null,
                                errors: ErrorUtils.getMicroSecondOnyxError('workspace.taxes.errors.deleteFailureMessage'),
                            };
                            return acc;
                        }, {}),
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        taxNames: JSON.stringify(taxesToDelete.map((taxID) => policyTaxRates[taxID].name)),
    } satisfies DeletePolicyTaxesParams;

    API.write(WRITE_COMMANDS.DELETE_POLICY_TAXES, parameters, onyxData);
}

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
                                pendingFields: {value: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                errorFields: {value: null},
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
                            [taxID]: {pendingFields: {value: null}, errorFields: {value: null}},
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
                            [taxID]: {
                                value: originalTaxRate.value,
                                pendingFields: {value: null},
                                errorFields: {value: ErrorUtils.getMicroSecondOnyxError('workspace.taxes.errors.updateFailureMessage')},
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        taxCode: taxID,
        taxRate: stringTaxValue,
    } satisfies UpdatePolicyTaxValueParams;

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
                                pendingFields: {name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                errorFields: {name: null},
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
                            [taxID]: {pendingFields: {name: null}, errorFields: {name: null}},
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
                            [taxID]: {
                                name: originalTaxRate.name,
                                pendingFields: {name: null},
                                errorFields: {name: ErrorUtils.getMicroSecondOnyxError('workspace.taxes.errors.updateFailureMessage')},
                            },
                        },
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID,
        taxCode: taxID,
        newName,
    } satisfies RenamePolicyTaxParams;

    API.write(WRITE_COMMANDS.RENAME_POLICY_TAX, parameters, onyxData);
}

export {
    createPolicyTax,
    getNextTaxCode,
    clearTaxRateError,
    clearTaxRateFieldError,
    getTaxValueWithPercentage,
    setPolicyTaxesEnabled,
    validateTaxName,
    validateTaxValue,
    deletePolicyTaxes,
    updatePolicyTaxValue,
    renamePolicyTax,
};
