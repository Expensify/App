import {usePersonalDetails} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';

import {buildUserIcon, getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import type {InvitedEmailsToAccountIDs} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';

type DefaultAvatars = ReturnType<typeof useDefaultAvatars>;

function buildAccountIcons(
    accountIDs: number[],
    personalDetails: ReturnType<typeof usePersonalDetails>,
    defaultAvatars: DefaultAvatars,
    invitedEmailsToAccountIDs?: InvitedEmailsToAccountIDs,
    accountEmails?: Array<string | undefined>,
): Icon[] {
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

    return buildAccountIcons(accountIDs, personalDetails, defaultAvatars, invitedEmailsToAccountIDs, accountEmails);
}

/**
 * Like {@link useAccountIcons}, but an account whose personal details haven't loaded gets a default avatar seeded from its
 * account ID instead of the generic gray fallback. The unknown account (`DEFAULT_NUMBER_ID`) keeps the generic fallback.
 */
function useSeededAccountIcons(accountIDs: number[]): Icon[] {
    const personalDetails = usePersonalDetails();
    const defaultAvatars = useDefaultAvatars();

    return seedFallbackIcons(buildAccountIcons(accountIDs, personalDetails, defaultAvatars), accountIDs, defaultAvatars.FallbackAvatar);
}

/** Replaces the generic fallback of each icon, index-aligned with `accountIDs`, with a default avatar seeded from its account ID. The unknown account keeps the generic fallback. */
function seedFallbackIcons(icons: Icon[], accountIDs: number[], fallbackAvatar: DefaultAvatars['FallbackAvatar']): Icon[] {
    return icons.map((icon, index) => {
        const accountID = accountIDs.at(index) ?? CONST.DEFAULT_NUMBER_ID;
        return icon.source === fallbackAvatar && accountID !== CONST.DEFAULT_NUMBER_ID ? {...icon, source: getDefaultAvatarURL({accountID})} : icon;
    });
}

export default useAccountIcons;
export {seedFallbackIcons, useSeededAccountIcons};
