import {
    updateDualEntryCreditCardAccount,
    updateDualEntryDefaultVendor,
    updateDualEntryExpensifyCardAccount,
    updateDualEntryExportDate,
    updateDualEntryExporter,
} from '@libs/actions/connections/DualEntry';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

jest.mock('@libs/API');
jest.mock('@expensify/react-native-hybrid-app', () => ({__esModule: true, default: {isHybridApp: () => false}}));
jest.mock('@libs/ErrorUtils', () => ({getMicroSecondOnyxErrorWithTranslationKey: () => ({[123]: 'common.genericErrorMessage'})}));

const mockWrite = jest.mocked(write);
const policyID = 'policyID';

type TestCase = {
    name: string;
    run: () => void;
    command: (typeof WRITE_COMMANDS)[keyof typeof WRITE_COMMANDS];
    params: Record<string, unknown>;
    settingName: string;
    newValue: string;
    oldValue: string;
};

const testCases: TestCase[] = [
    {
        name: 'preferred exporter',
        run: () => updateDualEntryExporter(policyID, 'new@example.com', 'old@example.com'),
        command: WRITE_COMMANDS.UPDATE_DUALENTRY_EXPORTER,
        params: {policyID, email: 'new@example.com'},
        settingName: CONST.DUALENTRY_CONFIG.EXPORTER,
        newValue: 'new@example.com',
        oldValue: 'old@example.com',
    },
    {
        name: 'export date',
        run: () => updateDualEntryExportDate(policyID, CONST.DUALENTRY_EXPORT_DATE.REPORT_EXPORTED, CONST.DUALENTRY_EXPORT_DATE.LAST_EXPENSE),
        command: WRITE_COMMANDS.UPDATE_DUALENTRY_EXPORT_DATE,
        params: {policyID, value: CONST.DUALENTRY_EXPORT_DATE.REPORT_EXPORTED},
        settingName: CONST.DUALENTRY_CONFIG.EXPORT_DATE,
        newValue: CONST.DUALENTRY_EXPORT_DATE.REPORT_EXPORTED,
        oldValue: CONST.DUALENTRY_EXPORT_DATE.LAST_EXPENSE,
    },
    {
        name: 'default vendor',
        run: () => updateDualEntryDefaultVendor(policyID, 'newVendor', 'oldVendor'),
        command: WRITE_COMMANDS.UPDATE_DUALENTRY_DEFAULT_VENDOR,
        params: {policyID, vendorID: 'newVendor'},
        settingName: CONST.DUALENTRY_CONFIG.DEFAULT_VENDORID,
        newValue: 'newVendor',
        oldValue: 'oldVendor',
    },
    {
        name: 'company card account',
        run: () => updateDualEntryCreditCardAccount(policyID, 'newAccount', 'oldAccount'),
        command: WRITE_COMMANDS.UPDATE_DUALENTRY_CREDIT_CARD_ACCOUNT,
        params: {policyID, accountID: 'newAccount'},
        settingName: CONST.DUALENTRY_CONFIG.CREDIT_CARD_ACCOUNT_ID,
        newValue: 'newAccount',
        oldValue: 'oldAccount',
    },
    {
        name: 'Expensify Card account',
        run: () => updateDualEntryExpensifyCardAccount(policyID, 'newAccount', 'oldAccount'),
        command: WRITE_COMMANDS.UPDATE_DUALENTRY_EXPENSIFY_CARD_ACCOUNT,
        params: {policyID, accountID: 'newAccount'},
        settingName: CONST.DUALENTRY_CONFIG.EXPENSIFY_CARD_ACCOUNT_ID,
        newValue: 'newAccount',
        oldValue: 'oldAccount',
    },
];

beforeEach(() => {
    jest.clearAllMocks();
});

it.each(testCases)('updates $name with optimistic, success, and failure data', ({run, command, params, settingName, newValue, oldValue}) => {
    run();

    expect(mockWrite).toHaveBeenCalledWith(command, params, expect.any(Object));
    const onyxData = mockWrite.mock.calls.at(0)?.at(2);
    if (!onyxData || typeof onyxData !== 'object' || !('optimisticData' in onyxData)) {
        throw new Error('write was not called with Onyx data');
    }

    const key = `${ONYXKEYS.COLLECTION.POLICY}${policyID}`;
    expect(onyxData.optimisticData).toEqual([
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {
                connections: {
                    dualEntry: {
                        config: {
                            export: {[settingName]: newValue},
                            pendingFields: {[settingName]: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE},
                            errorFields: {[settingName]: null},
                        },
                    },
                },
            },
        },
    ]);
    expect(onyxData.successData).toEqual([{onyxMethod: Onyx.METHOD.MERGE, key, value: {connections: {dualEntry: {config: {pendingFields: {[settingName]: null}}}}}}]);
    expect(onyxData.failureData).toEqual([
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key,
            value: {
                connections: {
                    dualEntry: {
                        config: {
                            export: {[settingName]: oldValue},
                            pendingFields: {[settingName]: null},
                            errorFields: {[settingName]: {[123]: 'common.genericErrorMessage'}},
                        },
                    },
                },
            },
        },
    ]);
});
