import {render} from '@testing-library/react-native';

import MultiSelect from '@components/Search/FilterComponents/MultiSelect';
import VendorSelector from '@components/Search/FilterComponents/VendorSelector';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {Connections, QBONonReimbursableExportAccountType} from '@src/types/onyx/Policy';

import React from 'react';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

const mockOnyxData: Record<string, unknown> = {};

jest.mock('@components/Search/FilterComponents/MultiSelect', () => jest.fn(() => null));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => true})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);
jest.mock('@hooks/useOnyx', () =>
    jest.fn((key: string, options?: {selector?: (value: unknown) => unknown}) => {
        const value = mockOnyxData[key];
        return [options?.selector ? options.selector(value) : value, {status: 'loaded'}];
    }),
);

/** QBO workspace with its synced vendors in its connections, exporting card expenses to the given destination. */
const buildQBOPolicy = (
    policyID: string,
    vendorNames: string[],
    exportDestination: QBONonReimbursableExportAccountType = CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
): Policy =>
    createMock<Policy>({
        ...createRandomPolicy(0),
        id: policyID,
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                config: {nonReimbursableExpensesExportDestination: exportDestination},
                data: {vendors: vendorNames.map((name) => ({id: `${policyID}-${name}`, name, currency: 'USD'}))},
            },
        }),
    });

describe('VendorSelector', () => {
    const mockedMultiSelect = jest.mocked(MultiSelect);
    const getItemTexts = () => mockedMultiSelect.mock.lastCall?.[0].items.map((item) => item.text);

    beforeEach(() => {
        mockedMultiSelect.mockClear();
        for (const key of Object.keys(mockOnyxData)) {
            delete mockOnyxData[key];
        }
    });

    it('lists the vendors in the connections of a workspace with the vendor feature', () => {
        // Given a member's workspace whose connections carry synced vendors
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY] = {[`${ONYXKEYS.COLLECTION.POLICY}qbo`]: buildQBOPolicy('qbo', ['Zeta Supplies', 'Acme Tools'])};

        // When the vendor picker renders
        render(
            <VendorSelector
                policyID={undefined}
                value={[]}
                onChange={jest.fn()}
            />,
        );

        // Then the workspace's vendors are offered after "No vendor", read from the same connections that turn the vendor feature on
        expect(getItemTexts()).toEqual(['search.noVendor', 'Acme Tools', 'Zeta Supplies']);
    });

    it('lists a vendor name once when several workspaces sync it', () => {
        // Given two vendor workspaces that both sync a vendor with the same name
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY] = {
            [`${ONYXKEYS.COLLECTION.POLICY}first`]: buildQBOPolicy('first', ['Acme Tools', 'Bravo Freight']),
            [`${ONYXKEYS.COLLECTION.POLICY}second`]: buildQBOPolicy('second', ['Acme Tools']),
        };

        // When the vendor picker renders
        render(
            <VendorSelector
                policyID={undefined}
                value={[]}
                onChange={jest.fn()}
            />,
        );

        // Then the shared name appears once, because the filter matches vendors by name
        expect(getItemTexts()).toEqual(['search.noVendor', 'Acme Tools', 'Bravo Freight']);
    });

    it('leaves out the vendors of workspaces without the vendor feature', () => {
        // Given a QBO workspace that exports card expenses as vendor bills, which syncs vendors but has no vendor feature
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY] = {
            [`${ONYXKEYS.COLLECTION.POLICY}bill`]: buildQBOPolicy('bill', ['Bill Vendor'], CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL),
        };

        // When the vendor picker renders
        render(
            <VendorSelector
                policyID={undefined}
                value={[]}
                onChange={jest.fn()}
            />,
        );

        // Then only "No vendor" is offered
        expect(getItemTexts()).toEqual(['search.noVendor']);
    });

    it('only lists the vendors of the selected workspaces', () => {
        // Given two vendor workspaces and a workspace filter that selects only the first one
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY] = {
            [`${ONYXKEYS.COLLECTION.POLICY}first`]: buildQBOPolicy('first', ['Acme Tools']),
            [`${ONYXKEYS.COLLECTION.POLICY}second`]: buildQBOPolicy('second', ['Zeta Supplies']),
        };

        // When the vendor picker renders with that workspace filter
        render(
            <VendorSelector
                policyID={{value: ['first'], isNegated: false}}
                value={[]}
                onChange={jest.fn()}
            />,
        );

        // Then only the selected workspace's vendors are offered
        expect(getItemTexts()).toEqual(['search.noVendor', 'Acme Tools']);
    });

    it('leaves out the vendors of excluded workspaces', () => {
        // Given two vendor workspaces and a workspace filter that excludes the first one
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY] = {
            [`${ONYXKEYS.COLLECTION.POLICY}first`]: buildQBOPolicy('first', ['Acme Tools']),
            [`${ONYXKEYS.COLLECTION.POLICY}second`]: buildQBOPolicy('second', ['Zeta Supplies']),
        };

        // When the vendor picker renders with that negated workspace filter
        render(
            <VendorSelector
                policyID={{value: ['first'], isNegated: true}}
                value={[]}
                onChange={jest.fn()}
            />,
        );

        // Then only the vendors of the workspaces that are not excluded are offered
        expect(getItemTexts()).toEqual(['search.noVendor', 'Zeta Supplies']);
    });

    it('resolves workspace names in the workspace filter', () => {
        // Given two named vendor workspaces and typed workspace filters that use a workspace name instead of its ID
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY] = {
            [`${ONYXKEYS.COLLECTION.POLICY}first`]: {...buildQBOPolicy('first', ['Acme Tools']), name: 'First Workspace'},
            [`${ONYXKEYS.COLLECTION.POLICY}second`]: {...buildQBOPolicy('second', ['Zeta Supplies']), name: 'Second Workspace'},
        };

        // When the vendor picker renders with the name selected, and then with the name excluded
        render(
            <VendorSelector
                policyID={{value: ['First Workspace'], isNegated: false}}
                value={[]}
                onChange={jest.fn()}
            />,
        );
        const selectedItemTexts = getItemTexts();
        render(
            <VendorSelector
                policyID={{value: ['First Workspace'], isNegated: true}}
                value={[]}
                onChange={jest.fn()}
            />,
        );

        // Then the name is matched to its workspace, so selecting it lists that workspace's vendors and excluding it drops them
        expect(selectedItemTexts).toEqual(['search.noVendor', 'Acme Tools']);
        expect(getItemTexts()).toEqual(['search.noVendor', 'Zeta Supplies']);
    });

    it('keeps selected vendors that are not in the synced lists', () => {
        // Given a vendor workspace and a selected vendor that none of the loaded workspaces sync, such as one typed in the search router
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY] = {[`${ONYXKEYS.COLLECTION.POLICY}qbo`]: buildQBOPolicy('qbo', ['Acme Tools'])};

        // When the vendor picker renders with that selection
        render(
            <VendorSelector
                policyID={undefined}
                value={['Typed Vendor']}
                onChange={jest.fn()}
            />,
        );

        // Then the selected vendor is listed after "No vendor", so it shows as selected and can be deselected
        expect(getItemTexts()).toEqual(['search.noVendor', 'Typed Vendor', 'Acme Tools']);
    });
});
