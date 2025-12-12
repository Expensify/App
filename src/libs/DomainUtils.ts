import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

/**
 * Extracts a list of admin IDs (accountIDs) from the domain object.
 * * It filters the domain properties for keys starting with the admin permissions prefix
 * and returns the values as an array of numbers.
 *
 * @param domain - The domain object from Onyx
 * @returns An array of admin account IDs
 */
function selectAdminIDs(domain: OnyxTypes.Domain | undefined): number[] {
    if (!domain) {
        return [];
    }

    return (
        Object.entries(domain)
            .filter(([key]) => key.startsWith(ONYXKEYS.COLLECTION.DOMAIN_ADMIN_PERMISSIONS))
            .map(([, value]) => {
                const rawValue = typeof value === 'object' && value !== null && 'value' in value ? value.value : value;
                return Number(rawValue);
            })
            .filter((id) => !Number.isNaN(id)) ?? getEmptyArray<number>()
    );
}

// eslint-disable-next-line import/prefer-default-export
export {selectAdminIDs};
