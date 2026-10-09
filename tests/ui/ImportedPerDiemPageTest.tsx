import {act, render} from '@testing-library/react-native';

import {importPerDiemRates} from '@libs/actions/Policy/PerDiem';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import ImportedPerDiemPage from '@pages/workspace/perDiem/ImportedPerDiemPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import type ImportedSpreadsheet from '@src/types/onyx/ImportedSpreadsheet';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type MockImportSpreadsheetColumnsProps = {
    importFunction: () => Promise<void>;
    errors?: Errors | null;
};

const mockImportSpreadsheetColumns = jest.fn<null, [MockImportSpreadsheetColumnsProps]>(() => null);

jest.mock('@libs/actions/Policy/PerDiem', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/Policy/PerDiem'),
    importPerDiemRates: jest.fn(),
}));

jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/ImportSpreadsheetColumns', () => (props: MockImportSpreadsheetColumnsProps) => mockImportSpreadsheetColumns(props));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@hooks/useCloseImportPage', () => ({
    __esModule: true,
    default: () => ({setIsClosing: jest.fn()}),
}));
jest.mock('@hooks/useImportSpreadsheetConfirmModal', () => ({
    __esModule: true,
    default: () => jest.fn(),
}));

const POLICY_ID = '1';
const PER_DIEM_CUSTOM_UNIT_ID = 'perDiemUnit123';

const SPREADSHEET: ImportedSpreadsheet = {
    data: [
        ['Destination', 'Germany'],
        ['Subrate', 'Full day'],
        ['Currency', 'EUR'],
        ['Amount', '28'],
    ],
    columns: Object.fromEntries([CONST.CSV_IMPORT_COLUMNS.DESTINATION, CONST.CSV_IMPORT_COLUMNS.SUBRATE, CONST.CSV_IMPORT_COLUMNS.CURRENCY, CONST.CSV_IMPORT_COLUMNS.AMOUNT].entries()),
    containsHeader: true,
    isImportingMultiLevelTags: false,
    isImportingIndependentMultiLevelTags: false,
    isGLAdjacent: false,
};

const mockImportPerDiemRates = jest.mocked(importPerDiemRates);

type ImportedPerDiemPageScreenProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.PER_DIEM_IMPORTED>;

const route: ImportedPerDiemPageScreenProps['route'] = {
    key: 'workspace-per-diem-imported',
    name: SCREENS.WORKSPACE.PER_DIEM_IMPORTED,
    params: {policyID: POLICY_ID},
};
// The screen does not read navigation; this inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as ImportedPerDiemPageScreenProps['navigation'];

function getLastColumnsProps(): MockImportSpreadsheetColumnsProps | undefined {
    return mockImportSpreadsheetColumns.mock.lastCall?.at(0);
}

async function renderAndImport(policy: Policy) {
    await Onyx.set(ONYXKEYS.IMPORTED_SPREADSHEET, SPREADSHEET);
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
    await waitForBatchedUpdatesWithAct();

    render(
        <ImportedPerDiemPage
            route={route}
            navigation={navigation}
        />,
    );
    await waitForBatchedUpdatesWithAct();

    await act(async () => {
        await getLastColumnsProps()?.importFunction();
    });
    await waitForBatchedUpdatesWithAct();
}

describe('ImportedPerDiemPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('shows an error and skips the import when the workspace has no per diem custom unit', async () => {
        // Given a workspace with per diem turned on but no Per Diem International unit, which some copied workspaces ended up with
        const policy: Policy = {...createRandomPolicy(Number(POLICY_ID), CONST.POLICY.TYPE.CORPORATE), arePerDiemRatesEnabled: true, customUnits: {}};

        // When the user maps every column and presses Import
        await renderAndImport(policy);

        // Then the user sees why nothing was imported, instead of the import silently doing nothing
        expect(getLastColumnsProps()?.errors).toHaveProperty('missingPerDiemUnit');
        expect(mockImportPerDiemRates).not.toHaveBeenCalled();
    });

    it('imports the rates into the per diem custom unit when it exists', async () => {
        // Given a workspace that has its Per Diem International unit
        const policy: Policy = {
            ...createRandomPolicy(Number(POLICY_ID), CONST.POLICY.TYPE.CORPORATE),
            arePerDiemRatesEnabled: true,
            customUnits: {
                [PER_DIEM_CUSTOM_UNIT_ID]: {
                    customUnitID: PER_DIEM_CUSTOM_UNIT_ID,
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                    enabled: true,
                    rates: {},
                },
            },
        };

        // When the user maps every column and presses Import
        await renderAndImport(policy);

        // Then the rates are sent to that unit and the missing unit error stays hidden
        expect(mockImportPerDiemRates).toHaveBeenCalledWith(POLICY_ID, PER_DIEM_CUSTOM_UNIT_ID, expect.any(Array), 1);
        expect(getLastColumnsProps()?.errors).not.toHaveProperty('missingPerDiemUnit');
    });
});
