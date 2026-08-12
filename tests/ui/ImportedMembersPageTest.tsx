import {act, fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import * as Member from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';

import ImportedMembersPage from '@pages/workspace/members/ImportedMembersPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ImportedSpreadsheet, Policy} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import {buildPersonalDetails} from '../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'imported-members-test-policy';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_ACCOUNT_ID = 1;
const PEOPLE_ADMIN_EMAIL = 'people-admin@example.com';
const PEOPLE_ADMIN_ACCOUNT_ID = 2;

// The confirm button on the import page renders `common.import`
const IMPORT_BUTTON_TEXT = 'Import';

jest.mock('@react-navigation/native', () => {
    // jest.requireActual returns `any` for the untyped React Navigation module
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actualNav = jest.requireActual('@react-navigation/native');

    // Spreading the untyped requireActual result is intentional for this navigation mock
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: jest.fn(),
            goBack: jest.fn(),
            addListener: () => jest.fn(),
            isFocused: () => true,
        }),
        useIsFocused: () => true,
        useFocusEffect: jest.fn(),
        usePreventRemove: jest.fn(),
        useRoute: () => ({key: 'test-route', name: 'Workspace_Members_Imported', params: {policyID: 'imported-members-test-policy'}}),
    };
});

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    getTopmostReportId: jest.fn(() => undefined),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    dismissModal: jest.fn(),
}));

// A Submit (non-Control) workspace, so the import gate's "requires Control" check fires.
function buildSubmitPolicy(): Policy {
    return {
        id: POLICY_ID,
        name: 'Test Submit Workspace',
        type: CONST.POLICY.TYPE.SUBMIT,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: ADMIN_EMAIL,
        ownerAccountID: ADMIN_ACCOUNT_ID,
        employeeList: {
            [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
        },
        outputCurrency: 'USD',
        isPolicyExpenseChatEnabled: true,
        pendingAction: null,
        errors: {},
    } as Policy;
}

function buildControlPolicyForPeopleAdmin(): Policy {
    return {
        ...buildSubmitPolicy(),
        name: 'Test Control Workspace',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.PEOPLE_ADMIN,
        employeeList: {
            [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            [PEOPLE_ADMIN_EMAIL]: {email: PEOPLE_ADMIN_EMAIL, role: CONST.POLICY.ROLE.PEOPLE_ADMIN},
        },
    } as Policy;
}

function buildSpreadsheet(mappedColumns: string[], data: string[][]): ImportedSpreadsheet {
    const columns: Record<number, string> = {};
    for (const [index, columnName] of mappedColumns.entries()) {
        columns[index] = columnName;
    }
    return {
        data,
        columns,
        containsHeader: true,
        isImportingMultiLevelTags: false,
        isImportingIndependentMultiLevelTags: false,
        isGLAdjacent: false,
    };
}

const mockRoute = {
    key: 'test-route',
    name: 'Workspace_Members_Imported',
    params: {policyID: POLICY_ID},
};

function renderImportedMembersPage() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <ImportedMembersPage
                // @ts-expect-error - route type from navigator
                route={mockRoute}
            />
        </ComposeProviders>,
    );
}

async function seedOnyx(spreadsheet: ImportedSpreadsheet, policy = buildSubmitPolicy(), login = ADMIN_EMAIL, accountID = ADMIN_ACCOUNT_ID) {
    await act(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[accountID]: buildPersonalDetails(login, accountID, 'admin')});
        await Onyx.merge(ONYXKEYS.SESSION, {email: login, accountID});
        await Onyx.set(ONYXKEYS.NETWORK, {shouldForceOffline: false});
        await Onyx.set(ONYXKEYS.IMPORTED_SPREADSHEET, spreadsheet);
        await waitForBatchedUpdatesWithAct();
    });
}

describe('ImportedMembersPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('routes the Submit upgrade to Control when importing Control-only columns (approvals branch)', async () => {
        // Map email + a Control-only column (submitTo) but no Control-only role, so the gate takes the `approvals` branch
        await seedOnyx(
            buildSpreadsheet(
                [CONST.CSV_IMPORT_COLUMNS.EMAIL, CONST.CSV_IMPORT_COLUMNS.SUBMIT_TO],
                [
                    ['Email', 'user@example.com'],
                    ['Submit to', 'manager@example.com'],
                ],
            ),
        );

        renderImportedMembersPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(IMPORT_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining(`upgrade/${CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias}`));
        expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining(`upgradePlanType=${CONST.POLICY.TYPE.CORPORATE}`));
    });

    it('routes the Submit upgrade to Control when importing a Control-only role (controlPolicyRoles branch)', async () => {
        // Map email + a role column containing an auditor, so the gate takes the `controlPolicyRoles` branch
        await seedOnyx(
            buildSpreadsheet(
                [CONST.CSV_IMPORT_COLUMNS.EMAIL, CONST.CSV_IMPORT_COLUMNS.ROLE],
                [
                    ['Email', 'user@example.com'],
                    ['Role', CONST.POLICY.ROLE.AUDITOR],
                ],
            ),
        );

        renderImportedMembersPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(IMPORT_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();

        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining(`upgrade/${CONST.UPGRADE_FEATURE_INTRO_MAPPING.controlPolicyRoles.alias}`));
        expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining(`upgradePlanType=${CONST.POLICY.TYPE.CORPORATE}`));
    });

    it('imports restricted roles as members and includes a permission warning', async () => {
        await seedOnyx(
            buildSpreadsheet(
                [CONST.CSV_IMPORT_COLUMNS.EMAIL, CONST.CSV_IMPORT_COLUMNS.ROLE],
                [
                    ['Email', 'new-member@example.com'],
                    ['Role', CONST.POLICY.ROLE.ADMIN],
                ],
            ),
            buildControlPolicyForPeopleAdmin(),
            PEOPLE_ADMIN_EMAIL,
            PEOPLE_ADMIN_ACCOUNT_ID,
        );
        const importPolicyMembersSpy = jest.spyOn(Member, 'importPolicyMembers').mockResolvedValue({
            titleKey: 'spreadsheet.importSuccessfulTitle',
            promptKey: 'spreadsheet.importMembersSuccessfulDescription',
            promptKeyParams: {added: 1, updated: 0},
            pendingMessageKey: 'spreadsheet.importMembersRolePermissionWarning',
        });

        renderImportedMembersPage();
        await waitForBatchedUpdatesWithAct();

        fireEvent.press(screen.getByText(IMPORT_BUTTON_TEXT));
        await waitForBatchedUpdatesWithAct();

        expect(importPolicyMembersSpy).toHaveBeenCalledWith(
            expect.objectContaining({id: POLICY_ID}),
            [expect.objectContaining({email: 'new-member@example.com', role: CONST.POLICY.ROLE.USER})],
            true,
        );
        expect(Navigation.navigate).not.toHaveBeenCalledWith(expect.stringContaining('/imported/confirmation'));
    });
});
