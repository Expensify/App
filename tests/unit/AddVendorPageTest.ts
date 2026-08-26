import {getVendorRuleDisplayValue, hasVendorFeature, isXeroActiveMatchingSource} from '@libs/PolicyUtils';

import {getSelectedVendorItem, getVendorSelectionItems} from '@pages/workspace/rules/MerchantRules/AddVendorPage';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {Connections} from '@src/types/onyx/Policy';

import createRandomPolicy from '../utils/collections/policies';
import createMock from '../utils/createMock';

/**
 * QBO policy whose non-reimbursable export destination scopes vendor matching to QBO.
 * Passing `undefined` models the list not yet synced; `[]` models a loaded-but-empty list.
 */
const buildQBOPolicy = (vendors: Array<{id: string; name: string; currency: string}> | undefined): Policy =>
    createMock<Policy>({
        ...createRandomPolicy(0),
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                data: vendors === undefined ? {} : {vendors},
            },
        }),
    });

/** Xero policy whose supplier list scopes vendor matching to Xero (label flips vendor -> supplier). */
const buildXeroPolicy = (contacts: Record<string, {id: string; name: string; email: string}>): Policy =>
    createMock<Policy>({
        ...createRandomPolicy(0),
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.XERO]: {
                config: {isConfigured: true},
                data: {contacts},
            },
        }),
    });

/** Dual-connected policy: QBO is the active vendor-matching source, with a stale Xero connection lingering. */
const buildQBOWithStaleXeroPolicy = (qboVendors: Array<{id: string; name: string; currency: string}>, xeroContacts: Record<string, {id: string; name: string; email: string}>): Policy =>
    createMock<Policy>({
        ...createRandomPolicy(0),
        connections: createMock<Connections>({
            [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                config: {nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD},
                data: {vendors: qboVendors},
            },
            [CONST.POLICY.CONNECTIONS.NAME.XERO]: {
                config: {isConfigured: true},
                data: {contacts: xeroContacts},
            },
        }),
    });

describe('AddVendorPage', () => {
    const vendorUnavailable = 'Vendor unavailable';

    describe('getVendorSelectionItems', () => {
        it('maps each matching vendor to a {name, value} picker item (value is the external vendor ID)', () => {
            const policy = buildQBOPolicy([
                {id: 'v-1', name: 'Acme Co', currency: 'USD'},
                {id: 'v-2', name: 'Globex', currency: 'USD'},
            ]);
            expect(getVendorSelectionItems(policy)).toEqual([
                {name: 'Acme Co', value: 'v-1'},
                {name: 'Globex', value: 'v-2'},
            ]);
        });

        it('returns an empty list when the vendor list is loaded but empty', () => {
            expect(getVendorSelectionItems(buildQBOPolicy([]))).toEqual([]);
        });

        it('returns an empty list when the vendor list has not synced yet', () => {
            expect(getVendorSelectionItems(buildQBOPolicy(undefined))).toEqual([]);
        });

        it('sources supplier contacts on a Xero workspace', () => {
            const policy = buildXeroPolicy({xc1: {id: 'xc1', name: 'Acme Xero', email: 'acme@example.com'}});
            expect(getVendorSelectionItems(policy)).toEqual([{name: 'Acme Xero', value: 'xc1'}]);
        });
    });

    describe('getSelectedVendorItem', () => {
        it('resolves the stored vendorID to its current name', () => {
            const policy = buildQBOPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]);
            expect(getSelectedVendorItem(policy, 'v-1', vendorUnavailable)).toEqual({name: 'Acme Co', value: 'v-1'});
        });

        it('uses the unavailable label when a loaded active list does not contain the vendor', () => {
            const policy = buildQBOPolicy([]);
            expect(getSelectedVendorItem(policy, 'v-missing', vendorUnavailable)).toEqual({name: vendorUnavailable, value: 'v-missing'});
        });

        it('preserves the raw ID while the active vendor list is hydrating', () => {
            const policy = buildQBOPolicy(undefined);
            expect(getSelectedVendorItem(policy, 'v-pending', vendorUnavailable)).toEqual({name: 'v-pending', value: 'v-pending'});
        });

        it('uses the unavailable label after the vendor-matching source is disconnected', () => {
            expect(getSelectedVendorItem(createRandomPolicy(0), 'v-disconnected', vendorUnavailable)).toEqual({name: vendorUnavailable, value: 'v-disconnected'});
        });

        it('returns undefined when no vendorID is set', () => {
            const policy = buildQBOPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]);
            expect(getSelectedVendorItem(policy, undefined, vendorUnavailable)).toBeUndefined();
            expect(getSelectedVendorItem(policy, '', vendorUnavailable)).toBeUndefined();
        });

        it('uses the unavailable label (not the stale name) when the vendorID only resolves against an inactive connection', () => {
            // QBO is active; the stored ID matches only the lingering Xero connection, which the active picker can't offer.
            const policy = buildQBOWithStaleXeroPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}], {
                xeroVendor: {id: 'xeroVendor', name: 'Stale Xero Vendor', email: 'stale@example.com'},
            });
            expect(getSelectedVendorItem(policy, 'xeroVendor', vendorUnavailable)).toEqual({name: vendorUnavailable, value: 'xeroVendor'});
        });
    });

    /**
     * The "Set vendor to" row in MerchantRulePageBase is assembled from these already-exported helpers
     * (see the `isVendorFeatureEnabled` / `vendorFieldLabel` / `vendorDisplayName` derivations). Asserting
     * them here pins the row's decision logic; the row's render/JSX wiring and navigation are exercised by
     * the Playwright click-through.
     */
    describe('vendor rule row derivation (MerchantRulePageBase)', () => {
        const qboPolicy = buildQBOPolicy([{id: 'v-1', name: 'Acme Co', currency: 'USD'}]);
        const xeroPolicy = buildXeroPolicy({xc1: {id: 'xc1', name: 'Acme Xero', email: 'acme@example.com'}});

        it('shows the row on QBO with the beta off because QBO vendor matching is generally available', () => {
            expect(hasVendorFeature(qboPolicy, false)).toBe(true);
        });

        it('hides the row on Xero when the beta is off because Xero vendor matching is not generally available yet', () => {
            expect(hasVendorFeature(xeroPolicy, false)).toBe(false);
        });

        it('hides the row when no vendor integration is connected', () => {
            expect(hasVendorFeature(createRandomPolicy(0), true)).toBe(false);
        });

        it('shows the row when the beta is on and a vendor integration is connected', () => {
            expect(hasVendorFeature(qboPolicy, true)).toBe(true);
        });

        it('labels the row "vendor" on QBO and flips to "supplier" on Xero', () => {
            expect(isXeroActiveMatchingSource(qboPolicy)).toBe(false);
            expect(isXeroActiveMatchingSource(xeroPolicy)).toBe(true);
        });

        it('uses the shared vendor display resolver for the row title', () => {
            expect(getVendorRuleDisplayValue(qboPolicy, 'v-1', vendorUnavailable)).toBe('Acme Co');
            expect(getVendorRuleDisplayValue(createRandomPolicy(0), 'v-disconnected', vendorUnavailable)).toBe(vendorUnavailable);
        });
    });
});
