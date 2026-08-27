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
 */
function useAccountIcons(accountIDs: number[], invitedEmailsToAccountIDs?: InvitedEmailsToAccountIDs): Icon[] {
    const personalDetails = usePersonalDetails();
    const defaultAvatars = useDefaultAvatars();

    return accountIDs.map((accountID) =>
        buildUserIcon({
            accountID,
            personalDetails,
            defaultAvatars,
            invitedEmail: invitedEmailsToAccountIDs ? Object.keys(invitedEmailsToAccountIDs).find((email) => invitedEmailsToAccountIDs[email] === accountID) : undefined,
        }),
    );
}

export default useAccountIcons;
