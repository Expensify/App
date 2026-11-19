/** Identifies government mileage rate series without depending on policy utilities. */
import CONST from '@src/CONST';

/** Removes the effective date while preserving fuel band names containing underscores. */
function getGovernmentRateSeries(sourceRateID: string): string {
    const dateSeparatorIndex = sourceRateID.lastIndexOf('_');
    return dateSeparatorIndex === -1 ? sourceRateID : sourceRateID.slice(0, dateSeparatorIndex);
}

/** Whether a source rate belongs to a UK advisory fuel band rather than the standard mileage allowance. */
function isFuelBandGovernmentRate(sourceRateID: string): boolean {
    return (
        sourceRateID.startsWith(`${CONST.CUSTOM_UNITS.GOVERNMENT_RATE_FUEL_BAND_COUNTRY}_`) && getGovernmentRateSeries(sourceRateID) !== CONST.CUSTOM_UNITS.GOVERNMENT_RATE_FUEL_BAND_COUNTRY
    );
}

export {getGovernmentRateSeries, isFuelBandGovernmentRate};
