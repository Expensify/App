import {
    clearDualEntryErrorField,
    connectToDualEntry,
    updateDualEntryEnableNewCategories,
    updateDualEntryFieldMapping,
    updateDualEntrySubsidiary,
    updateDualEntrySyncTaxRates,
} from '@libs/actions/connections/DualEntry';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API');
jest.mock('@expensify/react-native-hybrid-app', () => ({
    __esModule: true,
    default: {isHybridApp: () => false},
}));
const mockErrorTimestamp = 123;

jest.mock('@libs/ErrorUtils', () => ({
    getMicroSecondOnyxErrorWithTranslationKey: () => ({[mockErrorTimestamp]: 'common.genericErrorMessage'}),
}));

const mockWrite = jest.mocked(write);
const policyID = 'policyID';
const policyKey = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
const error = {[mockErrorTimestamp]: 'common.genericErrorMessage'};

function getOnyxData() {
    const onyxData = mockWrite.mock.calls.at(0)?.at(2);
    if (!onyxData || typeof onyxData !== 'object' || !('optimisticData' in onyxData)) {
        throw new Error('write was not called with Onyx data');
    }
    return onyxData;
}

function expectStandardUpdates(settingName: string, newValue: unknown, oldValue: unknown, coding = false) {
    const {optimisticData, successData, failureData} = getOnyxData();
    const setting = coding ? {coding: {[settingName]: newValue}} : {[settingName]: newValue};
    const oldSetting = coding ? {coding: {[settingName]: oldValue}} : {[settingName]: oldValue};

    expect(optimisticData).toEqual([
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {connections: {dualEntry: {config: {...setting, pendingFields: {[settingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}, errorFields: {[settingName]: null}}}}},
        },
    ]);
    expect(successData).toEqual([{onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {connections: {dualEntry: {config: {pendingFields: {[settingName]: null}}}}}}]);
    expect(failureData).toEqual([
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: policyKey,
            value: {connections: {dualEntry: {config: {...oldSetting, pendingFields: {[settingName]: null}, errorFields: {[settingName]: error}}}}},
        },
    ]);
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe('connectToDualEntry', () => {
    it('connects with the API key and sets optimistic sync progress', () => {
        jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
        connectToDualEntry(policyID, 'apiKey');

        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.CONNECT_POLICY_TO_DUALENTRY,
            {policyID, apiKey: 'apiKey'},
            {
                optimisticData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`,
                        value: {
                            stageInProgress: CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.DUALENTRY_SYNC_CONNECTION,
                            connectionName: CONST.POLICY.CONNECTIONS.NAME.DUALENTRY,
                            timestamp: '2026-01-01T00:00:00.000Z',
                        },
                    },
                ],
            },
        );
        jest.useRealTimers();
    });
});

describe('clearDualEntryErrorField', () => {
    it('clears the requested error field', () => {
        const mergeSpy = jest.spyOn(Onyx, 'merge').mockResolvedValue(undefined);
        clearDualEntryErrorField(policyID, 'subsidiaryID');
        expect(mergeSpy).toHaveBeenCalledWith(policyKey, {connections: {dualEntry: {config: {errorFields: {subsidiaryID: null}}}}});
        mergeSpy.mockRestore();
    });
});

describe('DualEntry setting updates', () => {
    it('updates the subsidiary with optimistic, success, and failure data', () => {
        updateDualEntrySubsidiary(policyID, 'newSubsidiary', 'oldSubsidiary');
        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_DUALENTRY_SUBSIDIARY, {policyID, subsidiaryID: 'newSubsidiary'}, expect.any(Object));
        expectStandardUpdates(CONST.DUALENTRY_CONFIG.SUBSIDIARY_ID, 'newSubsidiary', 'oldSubsidiary');
    });

    it('updates the new category setting with optimistic, success, and failure data', () => {
        updateDualEntryEnableNewCategories(policyID, true, false);
        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_DUALENTRY_ENABLE_NEW_CATEGORIES, {policyID, enabled: true}, expect.any(Object));
        expectStandardUpdates(CONST.DUALENTRY_CONFIG.ENABLE_NEW_CATEGORIES, true, false);
    });

    it('updates tax rate syncing with optimistic, success, and failure data', () => {
        updateDualEntrySyncTaxRates(policyID, true, false);
        expect(mockWrite).toHaveBeenCalledWith(WRITE_COMMANDS.UPDATE_DUALENTRY_SYNC_TAX_RATES, {policyID, enabled: true}, expect.any(Object));
        expectStandardUpdates(CONST.DUALENTRY_CONFIG.SYNC_TAX_RATES, true, false, true);
    });

    it('updates a field mapping with optimistic, success, and failure data', () => {
        updateDualEntryFieldMapping(policyID, 'customer', CONST.DUALENTRY_MAPPING_VALUE.TAG, CONST.DUALENTRY_MAPPING_VALUE.NONE);
        expect(mockWrite).toHaveBeenCalledWith(
            WRITE_COMMANDS.UPDATE_DUALENTRY_FIELD_MAPPING,
            {policyID, fieldID: 'customer', mapping: CONST.DUALENTRY_MAPPING_VALUE.TAG},
            expect.any(Object),
        );
        const feedbackKey = `${CONST.DUALENTRY_CONFIG.FIELD_MAPPING_PREFIX}customer`;
        const {optimisticData, successData, failureData} = getOnyxData();
        expect(optimisticData).toEqual([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    connections: {
                        dualEntry: {
                            config: {
                                coding: {fieldMappings: {customer: CONST.DUALENTRY_MAPPING_VALUE.TAG}},
                                pendingFields: {[feedbackKey]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                                errorFields: {[feedbackKey]: null},
                            },
                        },
                    },
                },
            },
        ]);
        expect(successData).toEqual([{onyxMethod: Onyx.METHOD.MERGE, key: policyKey, value: {connections: {dualEntry: {config: {pendingFields: {[feedbackKey]: null}}}}}}]);
        expect(failureData).toEqual([
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: policyKey,
                value: {
                    connections: {
                        dualEntry: {
                            config: {
                                coding: {fieldMappings: {customer: CONST.DUALENTRY_MAPPING_VALUE.NONE}},
                                pendingFields: {[feedbackKey]: null},
                                errorFields: {[feedbackKey]: error},
                            },
                        },
                    },
                },
            },
        ]);
    });
});
