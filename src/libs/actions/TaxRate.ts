import type {NullishDeep, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {FormOnyxValues} from '@components/Form/types';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type PolicyData from '@hooks/usePolicyData/types';
import * as API from '@libs/API';
import type {
    CreatePolicyTaxParams,
    DeletePolicyTaxesParams,
    RenamePolicyTaxParams,
    SetPolicyTaxesEnabledParams,
    UpdatePolicyTaxCodeParams,
    UpdatePolicyTaxValueParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import {pushTransactionViolationsOnyxData} from '@libs/ReportUtils';
import {getFieldRequiredErrors, isExistingTaxCode, isExistingTaxName, isValidPercentage} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@src/libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceNewTaxForm';
// eslint-disable-next-line import/no-named-default
import {default as INPUT_IDS_TAX_CODE} from '@src/types/form/WorkspaceTaxCodeForm';
import type {Policy, TaxRate, TaxRates, Transaction} from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {CustomUnit, Rate} from '@src/types/onyx/Policy';
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
 *  Function to validate tax name
 */
const validateTaxName = (policy: Policy, values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_NAME_FORM>, translate: LocalizedTranslate) => {
    const errors = getFieldRequiredErrors(values, [INPUT_IDS.NAME], translate);

    const name = values[INPUT_IDS.NAME];
    if (name.length > CONST.TAX_RATES.NAME_MAX_LENGTH) {
        errors[INPUT_IDS.NAME] = translate('common.error.characterLimitExceedCounter', name.length, CONST.TAX_RATES.NAME_MAX_LENGTH);
    } else if (policy?.taxRates?.taxes && isExistingTaxName(name, policy.taxRates.taxes)) {
        errors[INPUT_IDS.NAME] = translate('workspace.taxes.error.taxRateAlreadyExists');
    }

    return errors;
};

const validateTaxCode = (policy: Policy, values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_CODE_FORM>, translate: LocalizedTranslate) => {
    const errors = getFieldRequiredErrors(values, [INPUT_IDS_TAX_CODE.TAX_CODE], translate);

    const taxCode = values[INPUT_IDS_TAX_CODE.TAX_CODE];
    if (taxCode.length > CONST.TAX_RATES.NAME_MAX_LENGTH) {
        errors[INPUT_IDS_TAX_CODE.TAX_CODE] = translate('common.error.characterLimitExceedCounter', taxCode.length, CONST.TAX_RATES.NAME_MAX_LENGTH);
    } else if (policy?.taxRates?.taxes && isExistingTaxCode(taxCode, policy.taxRates.taxes)) {
        errors[INPUT_IDS_TAX_CODE.TAX_CODE] = translate('workspace.taxes.error.taxCodeAlreadyExists');
    }

    return errors;
};

/**
 *  Function to validate tax value
 */
const validateTaxValue = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WORKSPACE_TAX_VALUE_FORM>, translate: LocalizedTranslate) => {
    const errors = getFieldRequiredErrors(values, [INPUT_IDS.VALUE], translate);

    const value = values[INPUT_IDS.VALUE];
    if (!isValidPercentage(value)) {
        errors[INPUT_IDS.VALUE] = translate('workspace.taxes.error.valuePercentageRange');
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

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
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
                                errors: getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.createFailureMessage'),
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

function setPolicyTaxesEnabled(policy: OnyxEntry<Policy>, taxesIDsToUpdate: string[], isEnabled: boolean) {
    if (!policy) {
        return;
    }

    const originalTaxes = {...policy.taxRates?.taxes};

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: {
                    taxRates: {
                        taxes: taxesIDsToUpdate.reduce<TaxRateEnabledMap>((acc, taxID) => {
                            acc[taxID] = {
                                isDisabled: !isEnabled,
                                pendingFields: {isDisabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: {
                    taxRates: {
                        taxes: taxesIDsToUpdate.reduce<TaxRateEnabledMap>((acc, taxID) => {
                            acc[taxID] = {pendingFields: {isDisabled: null}, errorFields: {isDisabled: null}, pendingAction: null};
                            return acc;
                        }, {}),
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: {
                    taxRates: {
                        taxes: taxesIDsToUpdate.reduce<TaxRateEnabledMap>((acc, taxID) => {
                            acc[taxID] = {
                                isDisabled: !!originalTaxes[taxID].isDisabled,
                                pendingFields: {isDisabled: null},
                                pendingAction: null,
                                errorFields: {isDisabled: getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.updateFailureMessage')},
                            };
                            return acc;
                        }, {}),
                    },
                },
            },
        ],
    };

    const parameters = {
        policyID: policy.id,
        taxFieldsArray: JSON.stringify(taxesIDsToUpdate.map((taxID) => ({taxCode: taxID, enabled: isEnabled}))),
    } satisfies SetPolicyTaxesEnabledParams;

    API.write(WRITE_COMMANDS.SET_POLICY_TAXES_ENABLED, parameters, onyxData);
}

type TaxRateDeleteMap = Record<
    string,
    | (Pick<TaxRate, 'pendingAction' | 'isDisabled'> & {
          errors: OnyxCommon.Errors | null;
      })
    | null
>;

function getTaxCodeByValueMap(taxes: TaxRates): Record<string, string> {
    const taxCodeByValueMap: Record<string, string> = {};

    for (const [taxCode, taxRate] of Object.entries(taxes)) {
        if (!taxRate.value || taxCodeByValueMap[taxRate.value]) {
            continue;
        }
        taxCodeByValueMap[taxRate.value] = taxCode;
    }

    return taxCodeByValueMap;
}

function getReplacementTaxCode(
    taxRateToDelete: TaxRate | undefined,
    defaultTaxCode: string | undefined,
    defaultTaxValue: string | undefined,
    taxCodeByValueMap: Record<string, string>,
): string | undefined {
    if (!taxRateToDelete?.value) {
        return undefined;
    }

    const taxValue = taxRateToDelete.value;

    if (defaultTaxCode && defaultTaxValue === taxValue) {
        return defaultTaxCode;
    }

    return taxCodeByValueMap[taxValue];
}

function deletePolicyTaxes(policyData: PolicyData, taxesToDelete: string[], localeCompare: LocaleContextProps['localeCompare']) {
    const policy = policyData.policy;
    const currentPolicyTaxRates = policy?.taxRates;
    const policyTaxes = currentPolicyTaxRates?.taxes;
    const foreignTaxDefault = currentPolicyTaxRates?.foreignTaxDefault;
    const firstTaxID = Object.keys(policyTaxes ?? {})
        .sort((a, b) => localeCompare(a, b))
        .at(0);
    const distanceRateCustomUnit = getDistanceRateCustomUnit(policy);
    const customUnitID = distanceRateCustomUnit?.customUnitID;
    const ratesToUpdate = Object.values(distanceRateCustomUnit?.rates ?? {}).filter(
        (rate) => !!rate.attributes?.taxRateExternalID && taxesToDelete.includes(rate.attributes?.taxRateExternalID),
    );

    if (!currentPolicyTaxRates || !policyTaxes) {
        console.debug('Policy or tax rates not found');
        return;
    }

    const taxesToDeleteSet = new Set(taxesToDelete);
    const remaningTaxes = Object.fromEntries(Object.entries(policyTaxes).filter(([taxID]) => !taxesToDeleteSet.has(taxID)));
    const isForeignTaxRemoved = foreignTaxDefault && taxesToDelete.includes(foreignTaxDefault);
    const defaultTaxCode = currentPolicyTaxRates.defaultExternalID;
    const defaultTaxValue = defaultTaxCode ? remaningTaxes[defaultTaxCode]?.value : undefined;
    const taxCodeByValueMap = getTaxCodeByValueMap(remaningTaxes);
    const replacementTaxCodeByDeletedTaxCode: Record<string, string | undefined> = {};

    for (const taxCode of taxesToDelete) {
        replacementTaxCodeByDeletedTaxCode[taxCode] = getReplacementTaxCode(policyTaxes[taxCode], defaultTaxCode, defaultTaxValue, taxCodeByValueMap);
    }

    const optimisticRates: Record<string, NullishDeep<Rate>> = {};
    const successRates: Record<string, NullishDeep<Rate>> = {};
    const failureRates: Record<string, NullishDeep<Rate>> = {};

    for (const rate of ratesToUpdate) {
        const rateID = rate.customUnitRateID;
        optimisticRates[rateID] = {
            attributes: {
                taxRateExternalID: null,
                taxClaimablePercentage: null,
            },
            pendingFields: {
                taxRateExternalID: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                taxClaimablePercentage: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        };
        successRates[rateID] = {pendingFields: {taxRateExternalID: null, taxClaimablePercentage: null}};
        failureRates[rateID] = {
            attributes: {...rate?.attributes},
            pendingFields: {taxRateExternalID: null, taxClaimablePercentage: null},
            errorFields: {
                taxRateExternalID: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                taxClaimablePercentage: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        };
    }

    const optimisticTransactionUpdates: Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, Pick<Transaction, 'taxCode'>> = {};
    const failureTransactionUpdates: Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION}${string}`, Pick<Transaction, 'taxCode'>> = {};
    let optimisticTransactionsAndViolations = policyData.transactionsAndViolations;
    let hasOptimisticTransactionsAndViolationsUpdates = false;

    for (const [reportID, reportTransactionsAndViolations] of Object.entries(policyData.transactionsAndViolations)) {
        let updatedReportTransactions: typeof reportTransactionsAndViolations.transactions | undefined;

        for (const [transactionID, transaction] of Object.entries(reportTransactionsAndViolations.transactions)) {
            const transactionTaxCode = transaction.taxCode;
            if (!transactionTaxCode || !taxesToDeleteSet.has(transactionTaxCode)) {
                continue;
            }

            const replacementTaxCode = replacementTaxCodeByDeletedTaxCode[transactionTaxCode];
            if (!replacementTaxCode || replacementTaxCode === transactionTaxCode) {
                continue;
            }

            if (!updatedReportTransactions) {
                updatedReportTransactions = {...reportTransactionsAndViolations.transactions};
            }

            optimisticTransactionUpdates[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = {taxCode: replacementTaxCode};
            failureTransactionUpdates[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = {taxCode: transactionTaxCode};
            updatedReportTransactions[transactionID] = {
                ...transaction,
                taxCode: replacementTaxCode,
            };
        }

        if (!updatedReportTransactions) {
            continue;
        }

        if (!hasOptimisticTransactionsAndViolationsUpdates) {
            optimisticTransactionsAndViolations = {...policyData.transactionsAndViolations};
            hasOptimisticTransactionsAndViolationsUpdates = true;
        }

        optimisticTransactionsAndViolations[reportID] = {
            ...reportTransactionsAndViolations,
            transactions: updatedReportTransactions,
        };
    }

    const policyAndViolationsOnyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: {
                    taxRates: {
                        pendingFields: {foreignTaxDefault: isForeignTaxRemoved ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null},
                        foreignTaxDefault: isForeignTaxRemoved ? firstTaxID : foreignTaxDefault,
                        taxes: taxesToDelete.reduce<TaxRateDeleteMap>((acc, taxID) => {
                            acc[taxID] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: null, isDisabled: true};
                            return acc;
                        }, {}),
                    },
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    customUnits: distanceRateCustomUnit &&
                        customUnitID && {
                            [customUnitID]: {
                                rates: optimisticRates,
                            },
                        },
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: {
                    taxRates: {
                        pendingFields: {foreignTaxDefault: null},
                        taxes: taxesToDelete.reduce<TaxRateDeleteMap>((acc, taxID) => {
                            acc[taxID] = null;
                            return acc;
                        }, {}),
                    },
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    customUnits: distanceRateCustomUnit &&
                        customUnitID && {
                            [customUnitID]: {
                                rates: successRates,
                            },
                        },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policy.id}`,
                value: {
                    taxRates: {
                        pendingFields: {foreignTaxDefault: null},
                        taxes: taxesToDelete.reduce<TaxRateDeleteMap>((acc, taxID) => {
                            acc[taxID] = {
                                pendingAction: null,
                                errors: getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.deleteFailureMessage'),
                                isDisabled: !!policyTaxes?.[taxID]?.isDisabled,
                            };
                            return acc;
                        }, {}),
                    },
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    customUnits: distanceRateCustomUnit &&
                        customUnitID && {
                            [customUnitID]: {
                                rates: failureRates,
                            },
                        },
                },
            },
        ],
    };

    const transactionOnyxData: OnyxData<typeof ONYXKEYS.COLLECTION.TRANSACTION> =
        Object.keys(optimisticTransactionUpdates).length > 0
            ? {
                  optimisticData: [
                      {
                          onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                          key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
                          value: optimisticTransactionUpdates,
                      },
                  ],
                  failureData: [
                      {
                          onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
                          key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
                          value: failureTransactionUpdates,
                      },
                  ],
              }
            : {};

    pushTransactionViolationsOnyxData(
        policyAndViolationsOnyxData,
        {
            ...policyData,
            transactionsAndViolations: optimisticTransactionsAndViolations,
        },
        {
            taxRates: {
                ...currentPolicyTaxRates,
                taxes: remaningTaxes,
            },
        },
    );

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS> = {
        optimisticData: [...(policyAndViolationsOnyxData.optimisticData ?? []), ...(transactionOnyxData.optimisticData ?? [])],
        successData: policyAndViolationsOnyxData.successData,
        failureData: [...(policyAndViolationsOnyxData.failureData ?? []), ...(transactionOnyxData.failureData ?? [])],
    };

    const parameters = {
        policyID: policy.id,
        taxNames: JSON.stringify(taxesToDelete.map((taxID) => policyTaxes[taxID].name)),
    } satisfies DeletePolicyTaxesParams;

    API.write(WRITE_COMMANDS.DELETE_POLICY_TAXES, parameters, onyxData);
}

function updatePolicyTaxValue(policyID: string, taxID: string, taxValue: number, originalTaxRate: TaxRate) {
    const stringTaxValue = `${taxValue}%`;

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
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
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                            [taxID]: {pendingFields: {value: null}, pendingAction: null, errorFields: {value: null}},
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
                                pendingAction: null,
                                errorFields: {value: getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.updateFailureMessage')},
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

function renamePolicyTax(policyID: string, taxID: string, newName: string, originalTaxRate: TaxRate) {
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
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
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
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
                            [taxID]: {pendingFields: {name: null}, pendingAction: null, errorFields: {name: null}},
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
                                pendingAction: null,
                                errorFields: {name: getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.updateFailureMessage')},
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

function setPolicyTaxCode(
    policyID: string,
    oldTaxCode: string,
    newTaxCode: string,
    originalTaxRate: TaxRate,
    oldForeignTaxDefault: string | undefined,
    oldDefaultExternalID: string | undefined,
    distanceRateCustomUnit: CustomUnit | undefined,
) {
    const optimisticDistanceRateCustomUnit = distanceRateCustomUnit && {
        ...distanceRateCustomUnit,
        rates: {
            ...Object.keys(distanceRateCustomUnit.rates).reduce(
                (rates, rateID) => {
                    if (distanceRateCustomUnit.rates[rateID].attributes?.taxRateExternalID === oldTaxCode) {
                        // eslint-disable-next-line no-param-reassign
                        rates[rateID] = {
                            attributes: {
                                taxRateExternalID: newTaxCode,
                            },
                        };
                    }
                    return rates;
                },
                {} as Record<string, NullishDeep<Rate>>,
            ),
        },
    };

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.POLICY> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        defaultExternalID: oldTaxCode === oldDefaultExternalID ? newTaxCode : oldDefaultExternalID,
                        foreignTaxDefault: oldTaxCode === oldForeignTaxDefault ? newTaxCode : oldForeignTaxDefault,
                        taxes: {
                            [oldTaxCode]: null,
                            [newTaxCode]: {
                                ...originalTaxRate,
                                pendingFields: {...originalTaxRate.pendingFields, code: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                errorFields: {code: null},
                                previousTaxCode: oldTaxCode,
                            },
                        },
                    },
                    ...(!!distanceRateCustomUnit && {customUnits: {[distanceRateCustomUnit.customUnitID]: optimisticDistanceRateCustomUnit}}),
                },
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                value: {
                    taxRates: {
                        defaultExternalID: oldTaxCode === oldDefaultExternalID ? newTaxCode : oldDefaultExternalID,
                        foreignTaxDefault: oldTaxCode === oldForeignTaxDefault ? newTaxCode : oldForeignTaxDefault,
                        taxes: {
                            [oldTaxCode]: null,
                            [newTaxCode]: {
                                ...originalTaxRate,
                                code: newTaxCode,
                                pendingFields: {...originalTaxRate.pendingFields, code: null},
                                pendingAction: null,
                                errorFields: {code: null},
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
                        defaultExternalID: oldDefaultExternalID,
                        foreignTaxDefault: oldForeignTaxDefault,
                        taxes: {
                            [newTaxCode]: null,
                            [oldTaxCode]: {
                                ...originalTaxRate,
                                code: originalTaxRate.code,
                                pendingFields: {...originalTaxRate.pendingFields, code: null},
                                pendingAction: null,
                                errorFields: {code: getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.updateFailureMessage')},
                            },
                        },
                    },
                    ...(!!distanceRateCustomUnit && {customUnits: {[distanceRateCustomUnit.customUnitID]: distanceRateCustomUnit}}),
                },
            },
        ],
    };

    const parameters: UpdatePolicyTaxCodeParams = {
        policyID,
        oldTaxCode,
        newTaxCode,
        taxID: originalTaxRate.name ?? '',
    };

    API.write(WRITE_COMMANDS.UPDATE_POLICY_TAX_CODE, parameters, onyxData);
}

export {
    createPolicyTax,
    getNextTaxCode,
    clearTaxRateError,
    clearTaxRateFieldError,
    getTaxValueWithPercentage,
    setPolicyTaxesEnabled,
    validateTaxName,
    validateTaxCode,
    validateTaxValue,
    deletePolicyTaxes,
    updatePolicyTaxValue,
    renamePolicyTax,
    setPolicyTaxCode,
};
