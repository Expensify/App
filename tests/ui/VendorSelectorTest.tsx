import {render} from '@testing-library/react-native';

import MultiSelect from '@components/Search/FilterComponents/MultiSelect';
import VendorSelector from '@components/Search/FilterComponents/VendorSelector';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyVendors} from '@src/types/onyx';
import type {Connections} from '@src/types/onyx/Policy';

import React from 'react';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

const mockOnyxData: Record<string, unknown> = {};

jest.mock('@components/Search/FilterComponents/MultiSelect', () => jest.fn(() => null));
jest.mock('@components/ActivityIndicator', () => jest.fn(() => null));
jest.mock('@hooks/useLoadSearchVendorData', () => jest.fn(() => ({isLoadingInitialVendors: false})));
jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => true})));
jest.mock('@hooks/useTheme', () => jest.fn(() => ({})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({flex1: {}, flexColumn: {}, justifyContentCenter: {}, alignItemsCenter: {}, pl3: {}})));
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

/** QBO workspace exporting card expenses as credit card transactions, with its synced vendors in its connections. */
const buildQBOPolicy = (policyID: string, vendorNames: string[]): Policy =>
    createMock<Policy>({
        ...createRandomPolicy(0),
        id: policyID,
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                data: {vendors: vendorNames.map((name) => ({id: `${policyID}-${name}`, name, currency: 'USD'}))},
            },
        }),
    });

const buildPolicyVendors = (vendorNames: string[]): PolicyVendors =>
    Object.fromEntries(vendorNames.map((name) => [name, {externalID: name, name, enabled: true, origin: CONST.POLICY.CONNECTIONS.NAME.QBO}]));

describe('VendorSelector', () => {
    const mockedMultiSelect = jest.mocked(MultiSelect);
    const getItemTexts = () => mockedMultiSelect.mock.lastCall?.[0].items.map((item) => item.text);

    beforeEach(() => {
        mockedMultiSelect.mockClear();
        for (const key of Object.keys(mockOnyxData)) {
            delete mockOnyxData[key];
        }
    });

    it('lists the vendors in the connections of a workspace with no loaded vendor list', () => {
        // Given a member's workspace whose connections carry synced vendors, while the vendor list load returned nothing for it
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY] = {[`${ONYXKEYS.COLLECTION.POLICY}qbo`]: buildQBOPolicy('qbo', ['Zeta Supplies', 'Acme Tools'])};
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY_VENDORS] = {};

        // When the vendor picker renders
        render(
            <VendorSelector
                policyID={undefined}
                value={[]}
                onChange={jest.fn()}
            />,
        );

        // Then the workspace's vendors are offered after "No vendor", because members only get vendor lists through the workspace connections
        expect(getItemTexts()).toEqual(['search.noVendor', 'Acme Tools', 'Zeta Supplies']);
    });

    it('merges the loaded vendor list with the connections without duplicating names', () => {
        // Given an admin's workspace with a loaded vendor list that overlaps the vendors in its connections
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY] = {[`${ONYXKEYS.COLLECTION.POLICY}qbo`]: buildQBOPolicy('qbo', ['Acme Tools', 'Zeta Supplies'])};
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY_VENDORS] = {[`${ONYXKEYS.COLLECTION.POLICY_VENDORS}qbo`]: buildPolicyVendors(['Acme Tools', 'Bravo Freight'])};

        // When the vendor picker renders
        render(
            <VendorSelector
                policyID={undefined}
                value={[]}
                onChange={jest.fn()}
            />,
        );

        // Then every vendor name from both sources appears once
        expect(getItemTexts()).toEqual(['search.noVendor', 'Acme Tools', 'Bravo Freight', 'Zeta Supplies']);
    });

    it('only lists the vendors of the selected workspaces', () => {
        // Given two vendor workspaces and a workspace filter that selects only the first one
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY] = {
            [`${ONYXKEYS.COLLECTION.POLICY}first`]: buildQBOPolicy('first', ['Acme Tools']),
            [`${ONYXKEYS.COLLECTION.POLICY}second`]: buildQBOPolicy('second', ['Zeta Supplies']),
        };
        mockOnyxData[ONYXKEYS.COLLECTION.POLICY_VENDORS] = {};

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
});
