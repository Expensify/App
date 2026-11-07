import CONST from '@src/CONST';
import type {Unit} from '@src/types/onyx/Policy';

function getDistanceMerchantPrefix(distance: number, unit: Unit): string {
    return `${distance.toFixed(CONST.DISTANCE_DECIMAL_PLACES)} ${unit} ${CONST.DISTANCE_MERCHANT_SEPARATOR} `;
}

/**
 * Compatibility parser for historical distance expenses without a structured rate snapshot.
 * Distance, unit, and currency must come from the transaction, not from the label or live policy.
 * This mirrors getDistanceMerchantForTransaction's label format; round-trip tests guard that contract.
 * An unrecognized rate leaves rate undefined so callers retain their existing fallback behavior.
 */
function parseDistanceMerchant({
    merchant,
    distance,
    unit,
    currency,
    currencySymbol,
}: {
    merchant: string | null | undefined;
    distance: number | null | undefined;
    unit: Unit | undefined;
    currency?: string;
    currencySymbol?: string;
}): {rateText: string; rate: number | undefined} | undefined {
    if (typeof distance !== 'number' || !unit) {
        return;
    }

    const prefix = getDistanceMerchantPrefix(distance, unit);
    if (!merchant?.startsWith(prefix)) {
        return;
    }

    const rateText = merchant.slice(prefix.length);
    const trimmedRateText = rateText.trim();
    const currencyPrefix = [currencySymbol, currency ? `${currency} ` : undefined].find((candidate) => !!candidate && trimmedRateText.startsWith(candidate));
    const unitSuffix = ` / ${unit}`;
    let rate: number | undefined;
    if (currencyPrefix && trimmedRateText.endsWith(unitSuffix)) {
        const numericRateText = trimmedRateText.slice(currencyPrefix.length, -unitSuffix.length);
        // Rate labels have no grouping separators and at most four decimal places.
        if (/^\d+(?:[.,]\d{1,4})?$/.test(numericRateText)) {
            const parsedRate = Number(numericRateText.replace(',', '.')) * CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET;
            if (Number.isFinite(parsedRate) && parsedRate > 0) {
                rate = parsedRate;
            }
        }
    }

    return {rateText, rate};
}

export {getDistanceMerchantPrefix};
export default parseDistanceMerchant;
