import CONST from '@src/CONST';
import {buildCopyPolicySettingsData} from '@src/libs/actions/Policy/CopyPolicySettings';
import type {Part} from '@src/libs/actions/Policy/CopyPolicySettings';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import type CopyPolicySettings from '@src/types/onyx/CopyPolicySettings';
import type {CustomUnit} from '@src/types/onyx/Policy';
import type {WorkspaceTravelSettings} from '@src/types/onyx/TravelSettings';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';

const SOURCE_POLICY_ID = 'SOURCE000000000A';
const TARGET_POLICY_ID = 'TARGET000000000B';
const POLICY_KEY = `${ONYXKEYS.COLLECTION.POLICY}${TARGET_POLICY_ID}` as const;
const TARGET_CATEGORIES_KEY = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${TARGET_POLICY_ID}` as const;
const SOURCE_CATEGORIES_KEY = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${SOURCE_POLICY_ID}` as const;
const TARGET_TAGS_KEY = `${ONYXKEYS.COLLECTION.POLICY_TAGS}${TARGET_POLICY_ID}` as const;
const SOURCE_TAGS_KEY = `${ONYXKEYS.COLLECTION.POLICY_TAGS}${SOURCE_POLICY_ID}` as const;

function makeSourcePolicy(overrides: Partial<Policy> = {}): Policy {
    const base = createRandomPolicy(0, CONST.POLICY.TYPE.CORPORATE);
    return {
        ...base,
        id: SOURCE_POLICY_ID,
        outputCurrency: 'USD',
        address: {
            addressStreet: '123 Source St',
            city: 'San Francisco',
            country: 'US',
            state: 'CA',
            zipCode: '94105',
        },
        description: 'Source workspace description',
        areCategoriesEnabled: true,
        areTagsEnabled: true,
        areReportFieldsEnabled: true,
        areConnectionsEnabled: true,
        areWorkflowsEnabled: true,
        areRulesEnabled: true,
        areDistanceRatesEnabled: true,
        arePerDiemRatesEnabled: true,
        areInvoicesEnabled: true,
        areInvoiceFieldsEnabled: true,
        isTravelEnabled: true,
        autoReporting: true,
        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        autoReportingOffset: 5,
        harvesting: {enabled: true},
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        autoApproval: {limit: 10000},
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        maxExpenseAmount: 50000,
        maxExpenseAge: 90,
        defaultBillable: true,
        eReceipts: true,
        preventSelfApproval: true,
        ...overrides,
    };
}

function makeTargetPolicy(overrides: Partial<Policy> = {}): Policy {
    const base = createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE);
    return {
        ...base,
        id: TARGET_POLICY_ID,
        outputCurrency: 'EUR',
        address: {
            addressStreet: '99 Target Ave',
            city: 'Berlin',
            country: 'DE',
            state: 'BE',
            zipCode: '10115',
        },
        description: 'Target workspace description',
        areCategoriesEnabled: false,
        areTagsEnabled: false,
        areReportFieldsEnabled: false,
        areConnectionsEnabled: false,
        areWorkflowsEnabled: false,
        areRulesEnabled: false,
        areDistanceRatesEnabled: false,
        arePerDiemRatesEnabled: false,
        areInvoicesEnabled: false,
        areInvoiceFieldsEnabled: false,
        isTravelEnabled: false,
        autoReporting: false,
        autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY,
        autoReportingOffset: 15,
        harvesting: {enabled: false},
        approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
        autoApproval: {limit: 5000},
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
        maxExpenseAmount: 1000,
        maxExpenseAge: 30,
        defaultBillable: false,
        eReceipts: false,
        preventSelfApproval: false,
        customUnits: {},
        ...overrides,
    };
}

type CopyPolicySettingsOnyxData = ReturnType<typeof buildCopyPolicySettingsData>;

function getPolicyFromSetUpdate(update: CopyPolicySettingsOnyxData['optimisticData'][number] | undefined, policyKey: string = POLICY_KEY): Policy | undefined {
    if (!update || update.key !== policyKey || update.onyxMethod !== Onyx.METHOD.SET || !('value' in update)) {
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- SET value is a full Policy snapshot
    return update.value as Policy;
}

function getOptimisticPolicy(updates: CopyPolicySettingsOnyxData['optimisticData'], policyKey: string = POLICY_KEY): Policy | undefined {
    const update = updates.find((entry) => entry.key === policyKey && entry.onyxMethod === Onyx.METHOD.SET);
    return getPolicyFromSetUpdate(update, policyKey);
}

function getFailurePolicy(updates: CopyPolicySettingsOnyxData['failureData'], policyKey: string = POLICY_KEY): Policy | undefined {
    const update = updates.find((entry) => entry.key === policyKey && entry.onyxMethod === Onyx.METHOD.SET);
    return getPolicyFromSetUpdate(update, policyKey);
}

function getMergedPolicyPatch(update: CopyPolicySettingsOnyxData['successData'][number] | CopyPolicySettingsOnyxData['failureData'][number] | undefined): Partial<Policy> | undefined {
    if (!update || update.onyxMethod !== Onyx.METHOD.MERGE || !('value' in update)) {
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- MERGE value is a partial Policy patch
    return update.value as Partial<Policy>;
}

function getCopyPolicySettingsStep(update: {value?: unknown} | undefined): Pick<CopyPolicySettings, 'currentStep'> | undefined {
    if (!update || !('value' in update)) {
        return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- value is the COPY_POLICY_SETTINGS lifecycle step
    return update.value as Pick<CopyPolicySettings, 'currentStep'>;
}

describe('actions/Policy/CopyPolicySettings', () => {
    describe('buildCopyPolicySettingsData', () => {
        describe('per-part field patches and pendingFields', () => {
            it.each<[Part, ReadonlyArray<keyof Policy>]>([
                ['overview', ['outputCurrency', 'address', 'description']],
                ['members', ['employeeList']],
                ['reports', ['fieldList', 'areReportFieldsEnabled']],
                ['accounting', ['connections', 'areConnectionsEnabled']],
                ['categories', ['areCategoriesEnabled']],
                ['tags', ['areTagsEnabled']],
                ['taxes', ['tax', 'taxRates']],
                ['workflows', ['areWorkflowsEnabled', 'autoReportingFrequency', 'autoReporting', 'autoReportingOffset', 'harvesting', 'approvalMode', 'autoApproval', 'reimbursementChoice']],
                [
                    'rules',
                    [
                        'areRulesEnabled',
                        'maxExpenseAmount',
                        'maxExpenseAge',
                        'maxExpenseAmountNoReceipt',
                        'maxExpenseAmountNoItemizedReceipt',
                        'defaultBillable',
                        'prohibitedExpenses',
                        'eReceipts',
                        'isAttendeeTrackingEnabled',
                        'preventSelfApproval',
                        'shouldShowAutoApprovalOptions',
                        'shouldShowAutoReimbursementLimitOption',
                    ],
                ],
                ['distanceRates', ['areDistanceRatesEnabled']],
                ['perDiem', ['arePerDiemRatesEnabled']],
                ['invoices', ['areInvoicesEnabled', 'areInvoiceFieldsEnabled', 'invoice', 'fieldList']],
                ['travel', ['isTravelEnabled']],
            ])('marks %s fields pending and patches values from source', (part, expectedFields) => {
                const sourcePolicy = makeSourcePolicy();
                const targetPolicy = makeTargetPolicy();

                const {optimisticData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], [part], {}, {});

                const policy = getOptimisticPolicy(optimisticData);
                expect(policy).toBeDefined();

                // Each expected field should be patched from the source policy and marked pending.
                for (const field of expectedFields) {
                    if (field === 'fieldList') {
                        continue;
                    }
                    expect(policy?.[field]).toEqual(sourcePolicy[field]);
                }
                expect(policy?.pendingFields).toEqual(expect.objectContaining(Object.fromEntries(expectedFields.map((field) => [field, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]))));
            });

            it('retains target values for unrelated fields', () => {
                const sourcePolicy = makeSourcePolicy();
                const targetPolicy = makeTargetPolicy();

                const {optimisticData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['overview'], {}, {});
                const policy = getOptimisticPolicy(optimisticData);

                expect(policy?.areCategoriesEnabled).toEqual(targetPolicy.areCategoriesEnabled);
                expect(policy?.employeeList).toEqual(targetPolicy.employeeList);
            });

            it('copies only autoAddTripName from travelSettings, never the Spotnana identity fields or terms acceptance', () => {
                const sourcePolicy = makeSourcePolicy({
                    travelSettings: {
                        spotnanaCompanyID: 'SOURCE_COMPANY',
                        associatedTravelDomainAccountID: 'SOURCE_DOMAIN_ACCOUNT',
                        hasAcceptedTerms: true,
                        autoAddTripName: true,
                    },
                });
                const targetPolicy = makeTargetPolicy({
                    travelSettings: {
                        spotnanaCompanyID: 'TARGET_COMPANY',
                        associatedTravelDomainAccountID: 'TARGET_DOMAIN_ACCOUNT',
                        hasAcceptedTerms: false,
                        autoAddTripName: false,
                    },
                });

                const {optimisticData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['travel'], {}, {});
                const policy = getOptimisticPolicy(optimisticData);

                // The travel toggle copies.
                expect(policy?.isTravelEnabled).toBe(true);

                // The non-identity preference copies from the source.
                expect(policy?.travelSettings?.autoAddTripName).toBe(true);

                // Identity fields and terms acceptance keep the target's own values - the backend
                // re-provisions each target with its own Spotnana entity.
                expect(policy?.travelSettings?.spotnanaCompanyID).toBe('TARGET_COMPANY');
                expect(policy?.travelSettings?.associatedTravelDomainAccountID).toBe('TARGET_DOMAIN_ACCOUNT');
                expect(policy?.travelSettings?.hasAcceptedTerms).toBe(false);
            });

            it('leaves target travelSettings untouched when the source has no autoAddTripName preference', () => {
                const sourcePolicy = makeSourcePolicy({
                    travelSettings: {
                        spotnanaCompanyID: 'SOURCE_COMPANY',
                        associatedTravelDomainAccountID: 'SOURCE_DOMAIN_ACCOUNT',
                        hasAcceptedTerms: true,
                    },
                });
                const targetTravelSettings: WorkspaceTravelSettings = {
                    spotnanaCompanyID: 'TARGET_COMPANY',
                    associatedTravelDomainAccountID: 'TARGET_DOMAIN_ACCOUNT',
                    hasAcceptedTerms: false,
                    autoAddTripName: false,
                };
                const targetPolicy = makeTargetPolicy({travelSettings: targetTravelSettings});

                const {optimisticData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['travel'], {}, {});
                const policy = getOptimisticPolicy(optimisticData);

                expect(policy?.travelSettings).toEqual(targetTravelSettings);
            });

            it('copies autoAddTripName to a not-yet-provisioned target without fabricating identity fields', () => {
                const sourcePolicy = makeSourcePolicy({
                    travelSettings: {
                        spotnanaCompanyID: 'SOURCE_COMPANY',
                        associatedTravelDomainAccountID: 'SOURCE_DOMAIN_ACCOUNT',
                        hasAcceptedTerms: true,
                        autoAddTripName: false,
                    },
                });
                // Target has never been provisioned for travel, so it has no travelSettings.
                const targetPolicy = makeTargetPolicy();

                const {optimisticData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['travel'], {}, {});
                const policy = getOptimisticPolicy(optimisticData);

                // The source's autoAddTripName=false is reflected so the UI does not show the opposite preference.
                expect(policy?.travelSettings?.autoAddTripName).toBe(false);

                // No Spotnana identity fields are fabricated, so the target is not treated as provisioned.
                expect(policy?.travelSettings?.spotnanaCompanyID).toBeUndefined();
                expect(policy?.travelSettings?.associatedTravelDomainAccountID).toBeUndefined();
                expect(policy?.travelSettings?.hasAcceptedTerms).toBeUndefined();
            });
        });

        describe('collection key overwrites', () => {
            it('SETs target POLICY_CATEGORIES to source categories when categories selected', () => {
                const sourceCategories: PolicyCategories = {Food: {name: 'Food', enabled: true, areCommentsRequired: false}};
                const targetCategories: PolicyCategories = {Travel: {name: 'Travel', enabled: true, areCommentsRequired: false}};

                const allPolicyCategories: OnyxCollection<PolicyCategories> = {
                    [SOURCE_CATEGORIES_KEY]: sourceCategories,
                    [TARGET_CATEGORIES_KEY]: targetCategories,
                };

                const {optimisticData, failureData} = buildCopyPolicySettingsData(makeSourcePolicy(), [makeTargetPolicy()], ['categories'], allPolicyCategories, {});

                const optimisticSet = optimisticData.find((u) => u.key === TARGET_CATEGORIES_KEY && u.onyxMethod === Onyx.METHOD.SET);
                const failureSet = failureData.find((u) => u.key === TARGET_CATEGORIES_KEY && u.onyxMethod === Onyx.METHOD.SET);

                expect(optimisticSet?.value).toEqual(sourceCategories);
                expect(failureSet?.value).toEqual(targetCategories);
            });

            it('SETs target POLICY_TAGS to source tags when tags selected', () => {
                const sourceTags: PolicyTagLists = {Department: {name: 'Department', orderWeight: 0, required: false, tags: {Eng: {name: 'Eng', enabled: true}}}};
                const targetTags: PolicyTagLists = {Region: {name: 'Region', orderWeight: 0, required: false, tags: {EU: {name: 'EU', enabled: true}}}};

                const allPolicyTags: OnyxCollection<PolicyTagLists> = {
                    [SOURCE_TAGS_KEY]: sourceTags,
                    [TARGET_TAGS_KEY]: targetTags,
                };

                const {optimisticData, failureData} = buildCopyPolicySettingsData(makeSourcePolicy(), [makeTargetPolicy()], ['tags'], {}, allPolicyTags);

                const optimisticSet = optimisticData.find((u) => u.key === TARGET_TAGS_KEY && u.onyxMethod === Onyx.METHOD.SET);
                const failureSet = failureData.find((u) => u.key === TARGET_TAGS_KEY && u.onyxMethod === Onyx.METHOD.SET);

                expect(optimisticSet?.value).toEqual(sourceTags);
                expect(failureSet?.value).toEqual(targetTags);
            });

            it('does not emit POLICY_CATEGORIES updates when categories not selected', () => {
                const {optimisticData, failureData} = buildCopyPolicySettingsData(makeSourcePolicy(), [makeTargetPolicy()], ['overview'], {}, {});
                expect(optimisticData.some((u) => u.key === TARGET_CATEGORIES_KEY)).toBe(false);
                expect(failureData.some((u) => u.key === TARGET_CATEGORIES_KEY)).toBe(false);
            });

            it('falls back to empty object when source has no categories', () => {
                const {optimisticData} = buildCopyPolicySettingsData(makeSourcePolicy(), [makeTargetPolicy()], ['categories'], {}, {});

                const optimisticSet = optimisticData.find((u) => u.key === TARGET_CATEGORIES_KEY && u.onyxMethod === Onyx.METHOD.SET);
                expect(optimisticSet?.value).toEqual({});
            });

            it('falls back to empty object when source has no tags', () => {
                const {optimisticData} = buildCopyPolicySettingsData(makeSourcePolicy(), [makeTargetPolicy()], ['tags'], {}, {});

                const optimisticSet = optimisticData.find((u) => u.key === TARGET_TAGS_KEY && u.onyxMethod === Onyx.METHOD.SET);
                expect(optimisticSet?.value).toEqual({});
            });
        });

        describe('failure data restores pre-copy state', () => {
            it("fully restores the target's pre-copy state via SET and surfaces an error", () => {
                const sourcePolicy = makeSourcePolicy({outputCurrency: 'USD', maxExpenseAmount: 50000});
                const targetPolicy = makeTargetPolicy({outputCurrency: 'EUR', maxExpenseAmount: 1000});

                const {failureData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['overview', 'rules'], {}, {});

                const policy = getFailurePolicy(failureData);

                expect(policy?.outputCurrency).toBe('EUR');
                expect(policy?.maxExpenseAmount).toBe(1000);
                expect(policy?.errors).toBeDefined();
            });

            it('surfaces an RBR error on the source policy and clears it on success', () => {
                const sourcePolicy = makeSourcePolicy();
                const targetPolicy = makeTargetPolicy();
                const sourcePolicyKey = `${ONYXKEYS.COLLECTION.POLICY}${SOURCE_POLICY_ID}` as const;

                const {failureData, successData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['overview'], {}, {});

                const sourceFailure = failureData.find((entry) => entry.key === sourcePolicyKey && entry.onyxMethod === Onyx.METHOD.MERGE);
                expect(sourceFailure).toBeDefined();
                expect(getMergedPolicyPatch(sourceFailure)?.errors).toBeDefined();

                const sourceSuccess = successData.find((entry) => entry.key === sourcePolicyKey && entry.onyxMethod === Onyx.METHOD.MERGE);
                expect(sourceSuccess).toBeDefined();
                expect(getMergedPolicyPatch(sourceSuccess)?.errors).toBeNull();
            });
        });

        describe('customUnits preservation', () => {
            const sourceDistanceUnit: CustomUnit = {
                customUnitID: '1000000000001',
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                rates: {SRC_RATE: {customUnitRateID: 'SRC_RATE', name: 'IRS', rate: 67, enabled: true, currency: 'USD'}},
            };
            const sourcePerDiemUnit: CustomUnit = {
                customUnitID: '1000000000002',
                name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                rates: {SRC_PD_RATE: {customUnitRateID: 'SRC_PD_RATE', name: 'NYC', rate: 100, enabled: true, currency: 'USD'}},
            };

            it("uses target's existing distance unit ID when target already has one", () => {
                const sourcePolicy = makeSourcePolicy({customUnits: {[sourceDistanceUnit.customUnitID]: sourceDistanceUnit}});
                const targetExistingDistanceID = '2000000000001';
                const targetPolicy = makeTargetPolicy({
                    customUnits: {
                        [targetExistingDistanceID]: {
                            customUnitID: targetExistingDistanceID,
                            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                            attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS},
                            rates: {OLD: {customUnitRateID: 'OLD', name: 'old', rate: 1, enabled: true, currency: 'EUR'}},
                        },
                    },
                });

                const {optimisticData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['distanceRates'], {}, {});

                const policy = getOptimisticPolicy(optimisticData);
                expect(policy?.customUnits).toBeDefined();
                expect(Object.keys(policy?.customUnits ?? {})).toEqual([targetExistingDistanceID]);
                expect(policy?.customUnits?.[targetExistingDistanceID]?.customUnitID).toBe(targetExistingDistanceID);
                expect(policy?.customUnits?.[targetExistingDistanceID]?.rates).toEqual(sourceDistanceUnit.rates);
                expect(policy?.pendingFields?.customUnits).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            });

            it('generates a new unit ID when target has no distance unit', () => {
                const sourcePolicy = makeSourcePolicy({customUnits: {[sourceDistanceUnit.customUnitID]: sourceDistanceUnit}});
                const targetPolicy = makeTargetPolicy({customUnits: {}});

                const {optimisticData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['distanceRates'], {}, {});

                const policy = getOptimisticPolicy(optimisticData);
                const unitIDs = Object.keys(policy?.customUnits ?? {});
                expect(unitIDs).toHaveLength(1);
                expect(unitIDs.at(0)).not.toBe(sourceDistanceUnit.customUnitID);
                expect(unitIDs.at(0)).toMatch(/^[0-9A-F]{13}$/);
                // A freshly generated ID should be reused as the customUnitID inside the unit
                expect(policy?.customUnits?.[unitIDs.at(0) ?? '']?.customUnitID).toBe(unitIDs.at(0));
            });

            it("preserves target's existing per-diem unit ID independently of distance", () => {
                const sourcePolicy = makeSourcePolicy({
                    customUnits: {[sourceDistanceUnit.customUnitID]: sourceDistanceUnit, [sourcePerDiemUnit.customUnitID]: sourcePerDiemUnit},
                });
                const targetExistingDistanceID = '2000000000001';
                const targetExistingPerDiemID = '2000000000002';
                const targetPolicy = makeTargetPolicy({
                    customUnits: {
                        [targetExistingDistanceID]: {
                            customUnitID: targetExistingDistanceID,
                            name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                            attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS},
                            rates: {},
                        },
                        [targetExistingPerDiemID]: {
                            customUnitID: targetExistingPerDiemID,
                            name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                            attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                            rates: {},
                        },
                    },
                });

                const {optimisticData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['distanceRates', 'perDiem'], {}, {});

                const policy = getOptimisticPolicy(optimisticData);
                expect(Object.keys(policy?.customUnits ?? {}).sort()).toEqual([targetExistingDistanceID, targetExistingPerDiemID].sort());
                expect(policy?.customUnits?.[targetExistingDistanceID]?.rates).toEqual(sourceDistanceUnit.rates);
                expect(policy?.customUnits?.[targetExistingPerDiemID]?.rates).toEqual(sourcePerDiemUnit.rates);
            });
        });

        describe('multiple target policies', () => {
            it('produces optimistic and failure updates for each target', () => {
                const targetA = makeTargetPolicy({id: 'TARGET_A'});
                const targetB = makeTargetPolicy({id: 'TARGET_B'});
                const policyKeyA = `${ONYXKEYS.COLLECTION.POLICY}TARGET_A` as const;
                const policyKeyB = `${ONYXKEYS.COLLECTION.POLICY}TARGET_B` as const;

                const {optimisticData, failureData, successData} = buildCopyPolicySettingsData(makeSourcePolicy(), [targetA, targetB], ['overview'], {}, {});

                const optimisticSets = optimisticData.filter((u) => u.onyxMethod === Onyx.METHOD.SET && (u.key === policyKeyA || u.key === policyKeyB));
                expect(optimisticSets).toHaveLength(2);

                const failureSets = failureData.filter((u) => u.onyxMethod === Onyx.METHOD.SET && (u.key === policyKeyA || u.key === policyKeyB));
                expect(failureSets).toHaveLength(2);

                const successMerges = successData.filter((u) => u.onyxMethod === Onyx.METHOD.MERGE && (u.key === policyKeyA || u.key === policyKeyB));
                expect(successMerges).toHaveLength(2);
            });

            it('produces category SET updates for each target when categories selected', () => {
                const targetA = makeTargetPolicy({id: 'TARGET_A'});
                const targetB = makeTargetPolicy({id: 'TARGET_B'});
                const catKeyA = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}TARGET_A` as const;
                const catKeyB = `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}TARGET_B` as const;
                const sourceCategories: PolicyCategories = {Food: {name: 'Food', enabled: true, areCommentsRequired: false}};

                const {optimisticData} = buildCopyPolicySettingsData(makeSourcePolicy(), [targetA, targetB], ['categories'], {[SOURCE_CATEGORIES_KEY]: sourceCategories}, {});

                expect(optimisticData.find((u) => u.key === catKeyA && u.onyxMethod === Onyx.METHOD.SET)?.value).toEqual(sourceCategories);
                expect(optimisticData.find((u) => u.key === catKeyB && u.onyxMethod === Onyx.METHOD.SET)?.value).toEqual(sourceCategories);
            });
        });

        describe('COPY_POLICY_SETTINGS lifecycle key', () => {
            it("sets currentStep='loading' optimistically and nulls it on failure", () => {
                const {optimisticData, failureData, successData} = buildCopyPolicySettingsData(makeSourcePolicy(), [makeTargetPolicy()], ['overview'], {}, {});

                const optLifecycle = optimisticData.find((u) => u.key === ONYXKEYS.COPY_POLICY_SETTINGS);
                const failLifecycle = failureData.find((u) => u.key === ONYXKEYS.COPY_POLICY_SETTINGS);
                const successLifecycle = successData.find((u) => u.key === ONYXKEYS.COPY_POLICY_SETTINGS);

                expect(getCopyPolicySettingsStep(optLifecycle)?.currentStep).toBe(CONST.POLICY.COPY_SETTINGS_MODAL_STEP.LOADING);
                expect(getCopyPolicySettingsStep(failLifecycle)?.currentStep).toBeNull();
                // Success leaves currentStep alone — the backend transitions it to 'complete' via NVP.
                expect(successLifecycle).toBeUndefined();
            });
        });

        describe('simulated Onyx state transitions', () => {
            it('optimistic SET replaces nested address completely (no deep-merge artifacts)', () => {
                const sourcePolicy = makeSourcePolicy({address: {addressStreet: '1 Src St', city: 'NYC', country: 'US', state: 'NY', zipCode: '10001'}});
                const targetPolicy = makeTargetPolicy({address: {addressStreet: '2 Tgt Ave', city: 'Berlin', country: 'DE', state: 'BE', zipCode: '10115'}});

                const {optimisticData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['overview'], {}, {});
                const policy = getOptimisticPolicy(optimisticData);

                expect(policy?.address).toEqual(sourcePolicy.address);
                expect(policy?.address).not.toHaveProperty('extraField');
            });

            it('target with extra custom unit rates — optimistic overwrites cleanly via SET', () => {
                const sourceDistanceUnit: CustomUnit = {
                    customUnitID: '1000000000001',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                    rates: {NEW_RATE: {customUnitRateID: 'NEW_RATE', name: 'New', rate: 67, enabled: true, currency: 'USD'}},
                };
                const targetDistanceUnit: CustomUnit = {
                    customUnitID: '2000000000001',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS},
                    rates: {
                        OLD_RATE_A: {customUnitRateID: 'OLD_RATE_A', name: 'OldA', rate: 50, enabled: true, currency: 'EUR'},
                        OLD_RATE_B: {customUnitRateID: 'OLD_RATE_B', name: 'OldB', rate: 30, enabled: false, currency: 'EUR'},
                    },
                };

                const sourcePolicy = makeSourcePolicy({customUnits: {[sourceDistanceUnit.customUnitID]: sourceDistanceUnit}});
                const targetPolicy = makeTargetPolicy({customUnits: {[targetDistanceUnit.customUnitID]: targetDistanceUnit}});

                const {optimisticData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['distanceRates'], {}, {});
                const policy = getOptimisticPolicy(optimisticData);

                // The optimistic unit is keyed by target's existing ID, with source's rates (no old rates)
                const optimisticUnit = policy?.customUnits?.[targetDistanceUnit.customUnitID];
                expect(optimisticUnit?.rates).toEqual(sourceDistanceUnit.rates);
                expect(optimisticUnit?.rates).not.toHaveProperty('OLD_RATE_A');
                expect(optimisticUnit?.rates).not.toHaveProperty('OLD_RATE_B');
            });

            it('failure SET fully restores target — newly-added custom unit IDs are removed', () => {
                const sourceDistanceUnit: CustomUnit = {
                    customUnitID: '1000000000001',
                    name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                    attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                    rates: {R1: {customUnitRateID: 'R1', name: 'IRS', rate: 67, enabled: true, currency: 'USD'}},
                };
                const sourcePolicy = makeSourcePolicy({customUnits: {[sourceDistanceUnit.customUnitID]: sourceDistanceUnit}});
                const targetPolicy = makeTargetPolicy({customUnits: {}});

                const {failureData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['distanceRates'], {}, {});
                const policy = getFailurePolicy(failureData);

                // Failure restores the full original target — which had no customUnits
                expect(policy?.customUnits).toEqual({});
            });

            it('copies units.time and pending fields for timeTracking', () => {
                const sourcePolicy = makeSourcePolicy({
                    units: {time: {enabled: true, rate: 75}},
                });
                const targetPolicy = makeTargetPolicy({
                    units: {time: {enabled: false, rate: 10}},
                });

                const {optimisticData, successData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['timeTracking'], {}, {});

                const policy = getOptimisticPolicy(optimisticData);
                expect(policy?.units?.time).toEqual({enabled: true, rate: 75});
                expect(policy?.pendingFields?.isTimeTrackingEnabled).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                expect(policy?.pendingFields?.timeTrackingDefaultRate).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);

                const successPatch = getMergedPolicyPatch(successData.find((update) => update.key === POLICY_KEY && update.onyxMethod === Onyx.METHOD.MERGE));
                expect(successPatch?.pendingFields?.isTimeTrackingEnabled).toBeNull();
                expect(successPatch?.pendingFields?.timeTrackingDefaultRate).toBeNull();
            });

            it('target with nested keys not in source — after optimistic, selected fields match source', () => {
                const sourcePolicy = makeSourcePolicy({
                    tax: {trackingEnabled: true},
                });
                const targetPolicy = makeTargetPolicy({
                    tax: {trackingEnabled: false},
                });

                const {optimisticData} = buildCopyPolicySettingsData(sourcePolicy, [targetPolicy], ['taxes'], {}, {});
                const policy = getOptimisticPolicy(optimisticData);

                expect(policy?.tax).toEqual(sourcePolicy.tax);
            });

            it('successData clears errors on target policies after retry-success', () => {
                const targetPolicy = makeTargetPolicy();
                const {successData} = buildCopyPolicySettingsData(makeSourcePolicy(), [targetPolicy], ['overview'], {}, {});

                const targetSuccess = successData.find((entry) => entry.key === POLICY_KEY && entry.onyxMethod === Onyx.METHOD.MERGE);
                const successPatch = getMergedPolicyPatch(targetSuccess);

                expect(successPatch?.errors).toBeNull();
                expect(successPatch?.pendingFields?.outputCurrency).toBeNull();
                expect(successPatch?.pendingFields?.address).toBeNull();
            });
        });
    });
});
