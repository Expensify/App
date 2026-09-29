import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';

import {buildUserIcon} from '@libs/UserAvatarUtils';

import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

/**
 * Resolves account IDs into avatar {@link Icon}s from the personal-details context and the default-avatar set.
 *
 * @param invitedEmailsToAccountIDs Emails of invited, not-yet-registered accounts. An account listed here gets a
 * deterministic fallback avatar seeded from its email, so it looks the same before and after it registers.
 * @param accountEmails Logins index-aligned with `accountIDs`. When personal details aren't loaded yet, the matching
 * login seeds a deterministic letter-avatar so the account renders instead of the generic gray fallback.
 */
function useAccountIcons(accountIDs: number[], invitedEmailsToAccountIDs?: InvitedEmailsToAccountIDs, accountEmails?: Array<string | undefined>): Icon[] {
    const personalDetails = usePersonalDetails();
    const defaultAvatars = useDefaultAvatars();

    return accountIDs.map((accountID, index) =>
        buildUserIcon({
            accountID,
            personalDetails,
            defaultAvatars,
            invitedEmail: invitedEmailsToAccountIDs ? Object.keys(invitedEmailsToAccountIDs).find((email) => invitedEmailsToAccountIDs[email] === accountID) : undefined,
            accountEmail: accountEmails?.[index],
        }),
    );
}

export default useAccountIcons;
