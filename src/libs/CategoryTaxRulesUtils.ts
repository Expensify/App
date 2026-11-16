/**
 * Tax helpers shared by the rules pages: which rates a rule may apply, how a rate reads, and when a rule row borrows
 * the pending delete of the rate it applies.
 */
import CONST from '@src/CONST';
import type {Policy, TaxRate} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

/** Whether a rule has a tax rate to apply. Tracking being on isn't enough on its own, it needs a rate to choose from. */
function hasUsableTaxRates(policy: Policy | undefined): boolean {
    return !!policy?.tax?.trackingEnabled && Object.keys(policy?.taxRates?.taxes ?? {}).length > 0;
}

/** Whether a rule may pick this rate. A disabled rate, or one on its way out, is not an option for any rule. */
function isSelectableTaxRate(taxRate: TaxRate): boolean {
    return !taxRate.isDisabled && taxRate.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

/** The `Name (Value)` tax label. Prefers the workspace rate so renames read correctly, then the label the rule saved
 * inline, then the raw ID. Callers with no inline label should check `getTaxByID` first: an ID is a fallback for
 * a rule that carries its own name, not something to show an admin. */
function getTaxRateDisplayName(policy: Policy | undefined, taxID: string | undefined, savedTaxRate?: {name?: string; value?: string}): string {
    if (!taxID) {
        return '';
    }
    const taxRate = policy?.taxRates?.taxes?.[taxID];
    if (taxRate) {
        return `${taxRate.name} (${taxRate.value})`;
    }
    if (savedTaxRate?.name && savedTaxRate.value) {
        return `${savedTaxRate.name} (${savedTaxRate.value})`;
    }
    return taxID;
}

/**
 * Marks a rule row as deleting while the tax rate it applies is itself being deleted.
 *
 * Deleting the category a rule matches on is not borrowed: the server keeps the rule, so promising a removal that
 * never comes would leave the row struck through until the next fetch. Only deletion is borrowed at all, since a
 * disabled tax keeps its rule, which fires again once it is re-enabled.
 */
function getRuleDeletionPendingAction(policy: Policy | undefined, taxID: string | undefined): PendingAction | undefined {
    const isTaxDeleting = !!taxID && policy?.taxRates?.taxes?.[taxID]?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    return isTaxDeleting ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : undefined;
}

export {getRuleDeletionPendingAction, getTaxRateDisplayName, hasUsableTaxRates, isSelectableTaxRate};
