/**
 * Vendor-matching helpers for a policy: vendor-matching eligibility, the active integration's vendor list, and vendor display names.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getQuickbooksOnlineIntegrationName} from '@libs/AccountingUtils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName, Vendor} from '@src/types/onyx/Policy';
import type {TransactionCommentVendor} from '@src/types/onyx/Transaction';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/**
 * True when the QBO connection is exporting non-reimbursables to a card account, which is the
 * mode that scopes the vendor field on QBO.
 */
function isQBOVendorMatchingActive(policy: OnyxEntry<Policy>): boolean {
    const destination = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.QBO]?.config?.nonReimbursableExpensesExportDestination;
    return destination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD || destination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD;
}

/**
 * True when the Sage Intacct connection is exporting non-reimbursables as Credit Card Charge, which
 * is the mode that scopes the vendor field on Intacct.
 */
function isIntacctVendorMatchingActive(policy: OnyxEntry<Policy>): boolean {
    return policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]?.config?.export?.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE;
}

/**
 * True when Xero is connected AND the connection is configured. Xero has no export-destination
 * enum (bank-transactions is the only non-reimbursable mode), so `config.isConfigured` is the
 * configuration gate — mirrors `Xero::hasVendorFeature` on the PHP side. The `isConfigured` check
 * matters because Integration-Server clears that flag during a Xero tenant switch while the old
 * tenant's `data.contacts` lingers until the next sync repopulates it; without the gate the
 * Supplier picker would render stale contacts from the previous tenant and a user-pick during
 * that window would persist a now-invalid `comment.vendor.externalID` that flips inactive the
 * moment the new sync completes.
 *
 * This is the *eligibility* predicate used by `hasVendorFeature`, NOT the source predicate — on
 * dual-connected workspaces QBO/Intacct precedence still applies in `getMatchingVendors`. Use
 * `isXeroActiveMatchingSource` when the question is "is Xero the integration whose vendors are
 * actually being shown to the user?" (e.g. for the Supplier/Vendor label flip in the expense row,
 * picker, and modified-expense fragments).
 */
function isXeroVendorMatchingActive(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.XERO]?.config?.isConfigured;
}

/**
 * True when Rillet is connected AND configured. Mirrors `Rillet::hasVendorFeature` on the PHP side.
 */
function isRilletVendorMatchingActive(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.RILLET]?.config?.isConfigured;
}

function isDualEntryVendorMatchingActive(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.DUALENTRY]?.config?.isConfigured;
}

function isBusinessCentralVendorMatchingActive(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]?.config?.isConfigured;
}

/**
 * True when Campfire is connected AND configured.
 */
function isCampfireVendorMatchingActive(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]?.config?.isConfigured;
}

/**
 * True when a Certinia FFA connection is configured. Only FFA qualifies. A PSA connection's
 * account dimension is a PSA project rather than a vendor. A missing `hasPSA` flag is treated
 * as FFA, matching how the rest of the product reads it. Mirrors `FinancialForce::hasVendorFeature`
 * on the PHP side.
 */
function isCertiniaVendorMatchingActive(policy: OnyxEntry<Policy>): boolean {
    const config = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.CERTINIA]?.config;
    return config?.isConfigured === true && config?.hasPSA !== true;
}

/**
 * True when Xero is the *active* vendor-matching source for the workspace — i.e. Xero is
 * connected AND neither QBO nor Intacct is in a vendor-matching export mode. Mirrors the precedence
 * in `getActiveVendorMatchingIntegration` (QBO → Intacct → Xero → Rillet → DualEntry → Business Central → Campfire → Certinia) so the UI labels, copy, and
 * inactive-vendor guardrail stay bound to whichever integration's vendor list is actually being consulted.
 * Without this scoping, a workspace with active QBO matching + a lingering Xero connection would render
 * QBO vendors under the "Supplier" label.
 */
function isXeroActiveMatchingSource(policy: OnyxEntry<Policy>): boolean {
    return getActiveVendorMatchingIntegration(policy) === CONST.POLICY.CONNECTIONS.NAME.XERO;
}

/**
 * Vendor matching feature gate. Returns true when a supported accounting integration is connected
 * with a non-reimbursable export type that scopes the vendor field. Mirrors the per-integration
 * `hasVendorFeature` checks on the PHP side so the App and backend agree on which workspaces see
 * the field.
 *
 * The `vendorMatching` beta only gates the integrations that haven't reached GA yet, so
 * `isVendorMatchingBetaEnabled` is consulted on every branch but QBO, Sage Intacct, Xero, Rillet, and DualEntry:
 *   - QBO (R1) with non-reimbursable export = Credit Card or Debit Card. GA, so no beta required
 *   - Sage Intacct (R2) with non-reimbursable export = Credit Card Charge. GA, so no beta required
 *   - Xero (R3) has no export destination enum, so a configured connection is enough. GA, so no beta required
 *   - Rillet (R4) configured connection. GA, so no beta required
 *   - DualEntry configured connection. GA, so no beta required
 *   - Business Central configured connection. Beta required
 *   - Campfire has no export destination enum, so a configured connection is enough. Beta required
 *   - Certinia FFA configured connection. Beta required
 */
function hasVendorFeature(policy: OnyxEntry<Policy>, isVendorMatchingBetaEnabled: boolean): boolean {
    if (!policy) {
        return false;
    }
    if (
        isQBOVendorMatchingActive(policy) ||
        isIntacctVendorMatchingActive(policy) ||
        isXeroVendorMatchingActive(policy) ||
        isRilletVendorMatchingActive(policy) ||
        isDualEntryVendorMatchingActive(policy)
    ) {
        return true;
    }
    return isVendorMatchingBetaEnabled && (isBusinessCentralVendorMatchingActive(policy) || isCampfireVendorMatchingActive(policy) || isCertiniaVendorMatchingActive(policy));
}

/**
 * Search spans every workspace at once, so the vendor column is offered when any workspace has the vendor feature.
 */
function hasVendorFeatureOnAnyPolicy(policies: OnyxCollection<Policy>, isVendorMatchingBetaEnabled: boolean): boolean {
    return Object.values(policies ?? {}).some((policy) => hasVendorFeature(policy, isVendorMatchingBetaEnabled));
}

/**
 * Single source of truth for which connected integration scopes the vendor field for this workspace
 * (QBO, Sage Intacct, Xero, Rillet, DualEntry, Business Central, Campfire, or Certinia) and what its vendor list looks like. Returns `undefined` when no
 * vendor-matching integration is active OR when the active integration's list hasn't synced yet —
 * distinct from `[]` (loaded-empty). Lets callers tell "no vendors" from "not loaded".
 *
 * Selection mirrors `hasVendorFeature`: each branch is gated on the integration's own
 * non-reimbursable export destination, so a dual-connected workspace (e.g. mid-migration with stale
 * QBO data + active Intacct) returns vendors from the integration whose export mode actually drives
 * vendor matching, not whichever connection happens to be populated first.
 *
 * The shape is normalized to `Vendor` (id + name). For Intacct's `SageIntacctDataElementWithValue`,
 * the human-readable label lives in `value` (Intacct's `name` is an internal code), matching how
 * `getSageIntacctVendors` and `getDefaultVendorName` populate the existing Intacct export UI. Xero
 * stores suppliers as a keyed object at `connections.xero.data.contacts`, normalized here to the
 * same `Vendor` shape.
 */
/**
 * Returns the connection name whose export mode is currently scoping vendor matching for the
 * workspace, or undefined when none is. Callers that render vendor-matching UI should use this
 * to stay in sync with `getActiveVendorMatchingVendors` — picking a connection via a generic
 * "first accounting connection" lookup can mismatch when the workspace still has a stale
 * secondary connection attached.
 */
function getActiveVendorMatchingIntegration(policy: OnyxEntry<Policy>): ConnectionName | undefined {
    if (!policy) {
        return undefined;
    }
    if (isQBOVendorMatchingActive(policy)) {
        return CONST.POLICY.CONNECTIONS.NAME.QBO;
    }
    if (isIntacctVendorMatchingActive(policy)) {
        return CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT;
    }
    if (isXeroVendorMatchingActive(policy)) {
        return CONST.POLICY.CONNECTIONS.NAME.XERO;
    }
    if (isRilletVendorMatchingActive(policy)) {
        return CONST.POLICY.CONNECTIONS.NAME.RILLET;
    }
    if (isDualEntryVendorMatchingActive(policy)) {
        return CONST.POLICY.CONNECTIONS.NAME.DUALENTRY;
    }
    if (isBusinessCentralVendorMatchingActive(policy)) {
        return CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL;
    }
    if (isCampfireVendorMatchingActive(policy)) {
        return CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE;
    }
    if (isCertiniaVendorMatchingActive(policy)) {
        return CONST.POLICY.CONNECTIONS.NAME.CERTINIA;
    }
    return undefined;
}

function getActiveVendorMatchingVendors(policy: OnyxEntry<Policy>): Vendor[] | undefined {
    if (!policy) {
        return undefined;
    }
    if (isQBOVendorMatchingActive(policy)) {
        return policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.QBO]?.data?.vendors;
    }
    if (isIntacctVendorMatchingActive(policy)) {
        const intacctVendors = policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]?.data?.vendors;
        if (intacctVendors === undefined) {
            return undefined;
        }
        return intacctVendors.map((vendor) => ({
            id: vendor.id,
            name: vendor.value,
            currency: '',
            email: '',
        }));
    }
    if (isXeroVendorMatchingActive(policy)) {
        const xeroContacts = policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.XERO]?.data?.contacts;
        if (!xeroContacts) {
            return undefined;
        }
        return Object.values(xeroContacts).map((contact) => ({id: contact.id, name: contact.name, currency: '', email: contact.email}));
    }
    if (isRilletVendorMatchingActive(policy)) {
        const rilletVendors = policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.RILLET]?.data?.vendors;
        if (rilletVendors === undefined) {
            return undefined;
        }
        return rilletVendors.map((vendor) => ({
            id: vendor.id,
            name: vendor.name,
            currency: '',
            email: vendor.email ?? '',
        }));
    }
    if (isDualEntryVendorMatchingActive(policy)) {
        return policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.DUALENTRY]?.data?.vendors === undefined ? undefined : getDualEntryVendors(policy);
    }
    if (isBusinessCentralVendorMatchingActive(policy)) {
        const businessCentralVendors = policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]?.data?.vendors;
        if (businessCentralVendors === undefined) {
            return undefined;
        }

        // A vendor blocked as `All` can't be used in Business Central, so coding an expense
        // to it would export to a record Business Central rejects.
        // `Payment` only blocks paying the vendor, and purchase invoices can still post
        return businessCentralVendors
            .filter((vendor) => vendor.blocked !== CONST.BUSINESS_CENTRAL_VENDOR_BLOCKED.ALL)
            .map((vendor) => ({
                id: vendor.id,
                name: vendor.name,
                currency: '',
                email: vendor.email,
            }));
    }
    if (isCampfireVendorMatchingActive(policy)) {
        return policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]?.data?.vendors === undefined ? undefined : getCampfireVendors(policy);
    }
    if (isCertiniaVendorMatchingActive(policy)) {
        return policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.CERTINIA]?.data?.vendors === undefined ? undefined : getCertiniaVendors(policy);
    }
    return undefined;
}

/**
 * Returns the vendor list imported into the workspace from whichever connected integration scopes
 * the vendor field for this workspace (QBO, Sage Intacct, Xero, Rillet, DualEntry, Business Central, Campfire, or Certinia). Empty array when no integration
 * is connected or the sync hasn't populated vendors yet. Source of truth for the vendor selector
 * RHP and inactive-vendor lookups.
 */
function getMatchingVendors(policy: OnyxEntry<Policy>): Vendor[] {
    return getActiveVendorMatchingVendors(policy) ?? [];
}

/**
 * Sorts vendors alphabetically by name using the provided localeCompare.
 * Uses vendor id as a stable tie-breaker when names match.
 * Non-mutating: returns a new sorted array.
 */
function sortVendors<TVendor extends {id: string; name: string}>(vendors: TVendor[], localeCompare: LocaleContextProps['localeCompare']): TVendor[] {
    return [...vendors].sort((a, b) => {
        const nameComparison = localeCompare(a.name ?? '', b.name ?? '');
        if (nameComparison !== 0) {
            return nameComparison;
        }
        return localeCompare(a.id, b.id);
    });
}

/**
 * True only when the active vendor-matching integration's vendor list has been written to Onyx —
 * including the loaded-but-empty case. Lets callers distinguish "vendor not in list" (the
 * inactive-vendor case) from "vendor list hasn't synced yet" (a transient render before Onyx
 * hydrates), so the inactive-vendor copy isn't shown against an unloaded list.
 */
function isMatchingVendorListLoaded(policy: OnyxEntry<Policy>): boolean {
    return getActiveVendorMatchingVendors(policy) !== undefined;
}

/**
 * Look up a single matching vendor by `externalID`, scoped to the active vendor-matching
 * integration. Returns undefined when the ID isn't found in the active list (the inactive-vendor
 * violation case — see `getViolationsOnyxData`).
 */
function getMatchingVendorByID(policy: OnyxEntry<Policy>, vendorID: string | undefined): Vendor | undefined {
    if (!vendorID) {
        return undefined;
    }
    return getMatchingVendors(policy).find((vendor) => vendor.id === vendorID);
}

/**
 * Resolve a stored vendor ID to a display vendor. Prefers the active vendor-matching integration
 * (delegating to `getMatchingVendors`) so a freshly-selected vendor in the dual-connected state
 * never gets overshadowed by a stale entry with the same ID on the inactive integration. Falls
 * back to a permissive search across every connection's vendor data (QBO then Intacct) so
 * historical lookups keep working after an admin switches the workspace's non-reimbursable export
 * mode away from the vendor-matching mode — rendering a vendor name stored on a past transaction
 * or modified-expense action must not regress to the raw external ID. Use `getMatchingVendorByID`
 * instead when the caller is enforcing the active-integration scope (e.g. the inactive-vendor
 * violation check).
 */
function findVendorByID(policy: OnyxEntry<Policy>, vendorID: string | undefined): Vendor | undefined {
    if (!policy || !vendorID) {
        return undefined;
    }
    const activeMatch = getMatchingVendors(policy).find((vendor) => vendor.id === vendorID);
    if (activeMatch) {
        return activeMatch;
    }
    const qboVendor = policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.QBO]?.data?.vendors?.find((vendor) => vendor.id === vendorID);
    if (qboVendor) {
        return qboVendor;
    }
    const intacctVendor = policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]?.data?.vendors?.find((vendor) => vendor.id === vendorID);
    if (intacctVendor) {
        return {
            id: intacctVendor.id,
            name: intacctVendor.value,
            currency: '',
            email: '',
        };
    }
    const xeroContact = policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.XERO]?.data?.contacts?.[vendorID];
    if (xeroContact) {
        return {id: xeroContact.id, name: xeroContact.name, currency: '', email: xeroContact.email};
    }
    const rilletVendor = policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.RILLET]?.data?.vendors?.find((vendor) => vendor.id === vendorID);
    if (rilletVendor) {
        return {
            id: rilletVendor.id,
            name: rilletVendor.name,
            currency: '',
            email: rilletVendor.email ?? '',
        };
    }
    const businessCentralVendor = policy.connections?.[CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL]?.data?.vendors?.find((vendor) => vendor.id === vendorID);
    if (businessCentralVendor) {
        return {
            id: businessCentralVendor.id,
            name: businessCentralVendor.name,
            currency: '',
            email: businessCentralVendor.email ?? '',
        };
    }
    const campfireVendor = getCampfireVendors(policy).find((vendor) => vendor.id === vendorID);
    if (campfireVendor) {
        return campfireVendor;
    }
    const dualEntryVendor = getDualEntryVendors(policy).find((vendor) => vendor.id === vendorID);
    if (dualEntryVendor) {
        return dualEntryVendor;
    }
    return getCertiniaVendors(policy).find((vendor) => vendor.id === vendorID);
}

/**
 * Display name of a transaction's vendor, or an empty string when none is assigned. The workspace's synced vendor list
 * wins so renames in the accounting system show through. The name stored on the transaction covers vendors since
 * removed from that list.
 */
function getVendorDisplayName(policy: OnyxEntry<Policy>, vendor: TransactionCommentVendor | undefined): string {
    if (!vendor?.externalID) {
        return '';
    }
    return findVendorByID(policy, vendor.externalID)?.name ?? vendor.name ?? '';
}

/**
 * Resolves the text shown for a stored merchant-rule vendor ID. Prefer the active vendor-matching
 * source, use the unavailable label when its loaded list no longer contains the vendor, and retain
 * the stored ID only while an active source is still hydrating. This keeps every merchant-rule
 * surface consistent after an accounting connection is disconnected.
 */
function getVendorRuleDisplayValue(policy: OnyxEntry<Policy>, vendorID: string, unavailableLabel: string): string {
    const activeVendorName = getMatchingVendorByID(policy, vendorID)?.name;
    if (activeVendorName) {
        return activeVendorName;
    }

    if (isMatchingVendorListLoaded(policy)) {
        return unavailableLabel;
    }

    const historicalVendorName = findVendorByID(policy, vendorID)?.name;
    const hasActiveVendorMatchingSource = getActiveVendorMatchingIntegration(policy) !== undefined;
    return historicalVendorName ?? (hasActiveVendorMatchingSource ? vendorID : unavailableLabel);
}

/**
 * Source-specific empty state copy for the vendor selector when the active integration has zero vendors.
 */
function getVendorEmptyState(policy: OnyxEntry<Policy>, translate: LocaleContextProps['translate']): {title: string; subtitle: string} {
    const activeIntegration = getActiveVendorMatchingIntegration(policy);
    switch (activeIntegration) {
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
            return {
                title: translate('workspace.sageIntacct.noAccountsFound'),
                subtitle: translate('workspace.sageIntacct.noAccountsFoundDescription'),
            };
        case CONST.POLICY.CONNECTIONS.NAME.XERO:
            return {
                title: translate('workspace.xero.noSuppliersFound'),
                subtitle: translate('workspace.xero.noSuppliersFoundDescription'),
            };
        case CONST.POLICY.CONNECTIONS.NAME.RILLET:
            return {
                title: translate('workspace.rillet.noVendorsFound'),
                subtitle: translate('workspace.rillet.noVendorsFoundDescription'),
            };
        case CONST.POLICY.CONNECTIONS.NAME.DUALENTRY:
            return {
                title: translate('workspace.dualEntry.noVendorsFound'),
                subtitle: translate('workspace.dualEntry.noVendorsFoundDescription'),
            };
        case CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL:
            return {
                title: translate('workspace.businessCentral.noVendorsFound'),
                subtitle: translate('workspace.businessCentral.noVendorsFoundDescription'),
            };
        case CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE:
            return {
                title: translate('workspace.campfire.noVendorsFound'),
                subtitle: translate('workspace.campfire.noVendorsFoundDescription'),
            };
        case CONST.POLICY.CONNECTIONS.NAME.CERTINIA:
            return {
                title: translate('workspace.certinia.noVendorsFound'),
                subtitle: translate('workspace.certinia.noVendorsFoundDescription'),
            };
        case CONST.POLICY.CONNECTIONS.NAME.QBO:
        default: {
            const integrationName = getQuickbooksOnlineIntegrationName(policy, translate);
            return {
                title: translate('workspace.qbo.noAccountsFound'),
                subtitle: translate('workspace.qbo.noAccountsFoundDescription', integrationName),
            };
        }
    }
}

/**
 * Xero-scoped supplier list, normalized to the shared `Vendor` shape. Use this from Xero-specific
 * UI (the default-supplier picker, the Xero export config row) so the data source stays bound to
 * `connections.xero.data.contacts` regardless of whether QBO or Intacct is the *active* matching
 * source on a dual-connected workspace — `getMatchingVendors` is integration-priority-aware and
 * would return non-Xero vendors in that state, which is wrong for Xero-only controls.
 */
function getXeroSuppliers(policy: OnyxEntry<Policy>): Vendor[] {
    const contacts = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.XERO]?.data?.contacts;
    if (!contacts) {
        return [];
    }
    return Object.values(contacts).map((contact) => ({id: contact.id, name: contact.name, currency: '', email: contact.email}));
}

/** Campfire vendor matching uses only active vendor-type records, never customers or inactive vendors */
function getCampfireVendors(policy: OnyxEntry<Policy>): Vendor[] {
    const vendors = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE]?.data?.vendors;
    return (vendors ?? [])
        .filter((vendor) => !!vendor.id && vendor.isActive === true && vendor.vendorType === CONST.CAMPFIRE_VENDOR_TYPE.VENDOR)
        .map((vendor) => ({id: vendor.id, name: vendor.name, currency: '', email: vendor.email ?? ''}));
}

/** DualEntry export settings and expense matching must use vendors available to the selected company */
function getDualEntryVendors(policy: OnyxEntry<Policy>): Vendor[] {
    const connection = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.DUALENTRY];
    const companyID = connection?.config?.subsidiaryID;
    return (connection?.data?.vendors ?? [])
        .filter((vendor) => !!vendor.id && vendor.isActive === true && (!vendor.companyID || vendor.companyID === companyID))
        .map((vendor) => ({id: vendor.id, name: vendor.name, currency: '', email: vendor.email ?? ''}));
}

/**
 * Certinia-scoped vendor list, normalized to the shared `Vendor` shape. Bound strictly to the FFA
 * connection's synced Salesforce vendor Accounts so Certinia-only controls stay on Certinia data
 * regardless of which integration is the active matching source.
 */
function getCertiniaVendors(policy: OnyxEntry<Policy>): Vendor[] {
    const vendors = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.CERTINIA]?.data?.vendors;
    return (vendors ?? []).map((vendor) => ({id: vendor.id, name: vendor.name, currency: '', email: ''}));
}

/**
 * Xero-scoped supplier lookup. Same rationale as `getXeroSuppliers`: bound strictly to Xero data
 * so the Xero export config display can never accidentally render a non-Xero vendor's name when
 * another integration is the active matching source.
 */
function getXeroSupplierByID(policy: OnyxEntry<Policy>, supplierID: string | undefined): Vendor | undefined {
    if (!supplierID) {
        return undefined;
    }
    const contact = policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.XERO]?.data?.contacts?.[supplierID];
    return contact ? {id: contact.id, name: contact.name, currency: '', email: contact.email} : undefined;
}

export {
    findVendorByID,
    getVendorDisplayName,
    getActiveVendorMatchingIntegration,
    getMatchingVendorByID,
    getMatchingVendors,
    sortVendors,
    getVendorEmptyState,
    getVendorRuleDisplayValue,
    getXeroSupplierByID,
    getXeroSuppliers,
    getDualEntryVendors,
    getCampfireVendors,
    getCertiniaVendors,
    isRilletVendorMatchingActive,
    isBusinessCentralVendorMatchingActive,
    isDualEntryVendorMatchingActive,
    isCertiniaVendorMatchingActive,
    isXeroActiveMatchingSource,
    isXeroVendorMatchingActive,
    hasVendorFeature,
    hasVendorFeatureOnAnyPolicy,
    isMatchingVendorListLoaded,
};
