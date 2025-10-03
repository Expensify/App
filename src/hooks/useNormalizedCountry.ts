import {useMemo} from 'react';
import {getCountryCode} from '@libs/CountryUtils';

/**
 * Hook to normalize country data by converting country names to country codes.
 * Handles the case where old data has "United States" instead of "US".
 */
function useNormalizedCountry<T extends {country?: string}>(data: T | undefined): T | undefined {
    return useMemo(() => {
        if (!data?.country) {
            return data;
        }

        const normalizedCountry = getCountryCode(data.country);
        return {
            ...data,
            country: normalizedCountry,
        };
    }, [data]);
}

export default useNormalizedCountry;
