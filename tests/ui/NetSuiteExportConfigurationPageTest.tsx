import {fireEvent, render, screen} from '@testing-library/react-native';

import {getTravelBillingCardSettingsKey} from '@libs/TravelBillingUtils';

import goBackFromExportConnection from '@navigation/helpers/goBackFromExportConnection';

import NetSuiteExportConfigurationPage from '@pages/workspace/accounting/netsuite/export/NetSuiteExportConfigurationPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {ComponentProps} from 'react';

import React from 'react';
import type {Button, View} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const POLICY_ID = 'CF7BE4573FC925E8';
const WORKSPACE_ACCOUNT_ID = 22588762;
const DOMAIN_ACCOUNT_ID = 18452096;
const TRAVEL_BILLING_ROW = 'workspace.common.travelBilling';

const mockPolicy = createMock<Policy>({
    id: POLICY_ID,
    policyAccountID: WORKSPACE_ACCOUNT_ID,
    connections: createMock<Policy['connections']>({netsuite: {options: {config: {syncOptions: {}}, data: {}}}}),
});

jest.mock('@components/ConnectionLayout', () => {
    const RN = jest.requireActual<{Button: typeof Button; View: typeof View}>('react-native');
    return ({children, onBackButtonPress}: {children?: React.ReactNode; onBackButtonPress?: () => void}) => (
        <RN.View>
            <RN.Button
                title="Back"
                onPress={() => onBackButtonPress?.()}
            />
            {children}
        </RN.View>
    );
});

jest.mock('@components/MenuItem/presets/MenuItemField', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({name}: {name?: string}) => <RN.Text>{name}</RN.Text>;
});

jest.mock('@pages/workspace/workflows/ToggleSettingsOptionRow', () => {
    const RN = jest.requireActual<Record<string, React.ComponentType<{children?: React.ReactNode}>>>('react-native');
    return ({title}: {title?: string}) => <RN.Text>{title}</RN.Text>;
});

// Stand in for the real HOC, which reads the policy from Onyx and injects it into the page.
jest.mock('@pages/workspace/withPolicyConnections', () => (WrappedComponent: React.ComponentType<{policy: Policy}>) => () => <WrappedComponent policy={mockPolicy} />);

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useDynamicBackPath', () => jest.fn(() => ''));
jest.mock('@navigation/helpers/goBackFromExportConnection');

const travelBillingSettings = {
    [CONST.TRAVEL.PROGRAM_TRAVEL_US]: {
        isEnabled: true,
        linkedPolicyIDs: [POLICY_ID],
        paymentBankAccountID: 8789966,
    },
};

async function renderPage() {
    const props = createMock<ComponentProps<typeof NetSuiteExportConfigurationPage>>({});
    render(<NetSuiteExportConfigurationPage {...props} />);
    await waitForBatchedUpdatesWithAct();
}

describe('NetSuiteExportConfigurationPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockPolicy.connections = createMock<Policy['connections']>({netsuite: {options: {config: {syncOptions: {}}, data: {}}}});
        await Onyx.clear();
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, mockPolicy);
        await waitForBatchedUpdatesWithAct();
    });

    it.each([
        [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY, CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT, false],
        [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL, CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT, false],
        [CONST.NETSUITE_EXPORT_DESTINATION.CREDIT_CARD_CHARGE, CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT, false],
        [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT, CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY, true],
        [undefined, CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY, false],
        [undefined, CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL, false],
        [undefined, CONST.NETSUITE_EXPORT_DESTINATION.CREDIT_CARD_CHARGE, false],
        [undefined, CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT, true],
        [undefined, undefined, true],
    ])('uses card destination %s with reimbursable fallback %s to decide whether to skip the account page (%s)', async (cardDestination, reimbursableDestination, shouldSkipAccountPage) => {
        // Given card exports take precedence over reimbursable exports when deciding whether account mapping exists
        mockPolicy.connections = createMock<Policy['connections']>({
            netsuite: {
                options: {
                    config: {
                        syncOptions: {},
                        nonreimbursableExpensesExportDestination: cardDestination,
                        reimbursableExpensesExportDestination: reimbursableDestination,
                    },
                    data: {},
                },
            },
        });
        await renderPage();

        // When the user returns from the export configuration page
        fireEvent.press(screen.getByText('Back'));

        // Then supported card destinations retain the account page regardless of the reimbursable setting
        expect(goBackFromExportConnection).toHaveBeenCalledWith(shouldSkipAccountPage, '');
    });

    it('shows the travel billing export setting when the travel feed lives on the domain', async () => {
        // Given the admin last viewed the workspace's own card feed while the domain holds the TRAVEL_US program
        await Onyx.merge(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${POLICY_ID}`, WORKSPACE_ACCOUNT_ID);
        await Onyx.merge(getTravelBillingCardSettingsKey(WORKSPACE_ACCOUNT_ID), {[CONST.COUNTRY.US]: {paymentBankAccountID: 12345}});
        await Onyx.merge(getTravelBillingCardSettingsKey(DOMAIN_ACCOUNT_ID), travelBillingSettings);

        // When the NetSuite export page renders
        await renderPage();

        // Then the travel billing export row is offered
        expect(screen.getByText(TRAVEL_BILLING_ROW)).toBeTruthy();
    });

    it('shows the travel billing export setting when the travel feed lives on the workspace', async () => {
        // Given the workspace holds the TRAVEL_US program
        await Onyx.merge(getTravelBillingCardSettingsKey(WORKSPACE_ACCOUNT_ID), travelBillingSettings);

        // When the NetSuite export page renders
        await renderPage();

        // Then the travel billing export row is offered
        expect(screen.getByText(TRAVEL_BILLING_ROW)).toBeTruthy();
    });

    it('hides the travel billing export setting when the policy has no travel feed', async () => {
        // Given a domain linked only through its US card program
        await Onyx.merge(getTravelBillingCardSettingsKey(DOMAIN_ACCOUNT_ID), {[CONST.COUNTRY.US]: {linkedPolicyIDs: [POLICY_ID], paymentBankAccountID: 12345}});

        // When the NetSuite export page renders
        await renderPage();

        // Then there is no travel billing export row to configure
        expect(screen.queryByText(TRAVEL_BILLING_ROW)).toBeNull();
    });
});
