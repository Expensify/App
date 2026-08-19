/** A government-published reference mileage rate. Reference entries only - they get a customUnitRateID when copied onto a policy. */
type GovernmentMileageRate = {
    /** Deterministic "<countryCode>_<startDate>" ID (e.g. "US_2026-01-01") */
    sourceRateID: string;

    /** Currency the rate is published in */
    currency: string;

    /** Display name (e.g. "2026 United States") */
    name: string;

    /** Amount in cents per unit (e.g. 72.5 = $0.725/mile) */
    rate: number;

    /** ISO 8601 start date */
    startDate: string;

    /** ISO 8601 end date, omitted when the rate is open-ended */
    endDate?: string;

    /** Whether the rate is enabled when copied onto a policy */
    enabled?: boolean;
};

export default GovernmentMileageRate;
