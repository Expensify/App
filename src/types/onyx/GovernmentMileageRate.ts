/**
 * A government-published reference mileage rate, loaded from Auth for the country derived from the policy's output currency.
 * These are reference entries only - they have no customUnitRateID until they are copied onto a workspace.
 */
type GovernmentMileageRate = {
    /** Deterministic ID of the government rate, derived from country and start date (e.g. "US_2026-01-01") */
    sourceRateID: string;

    /** Currency the rate is published in */
    currency: string;

    /** Display name of the rate (e.g. "2026 United States") */
    name: string;

    /** Rate amount in cents per unit (e.g. 72.5 = $0.725/mile) */
    rate: number;

    /** ISO 8601 date the rate becomes effective, omitted when the government rate has no start date */
    startDate?: string;

    /** ISO 8601 date the rate expires, omitted when the government rate is open-ended */
    endDate?: string;

    /** Whether the rate is enabled when copied onto a workspace */
    enabled?: boolean;
};

export default GovernmentMileageRate;
