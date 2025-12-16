import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

/**
 * Extracts a list of member IDs (accountIDs) from the domain object.
 * * It iterates through the security groups in the domain, extracts account IDs from the 'shared' property,
 * and returns a unique list of numbers.
 *
 * @param domain - The domain object from Onyx
 * @returns An array of unique member account IDs
 */
function selectMemberIDs(domain: OnyxTypes.Domain | undefined): number[] {
    if (!domain) {
        return [];
    }

    const memberIDs = Object.entries(domain)
        .filter(([key]) => key.startsWith(ONYXKEYS.COLLECTION.DOMAIN_SECURITY_GROUP))
        .flatMap(([, value]) => {
            const groupData = value as {shared?: Record<string, string>};
            if (!groupData?.shared) {
                return [];
            }
            return Object.keys(groupData.shared);
        })
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id));
    return [...new Set(memberIDs)];
}

export default selectMemberIDs;
