import {PersonalDetailsContext} from '@components/OnyxListItemProvider';

import useDefaultAvatars from '@hooks/useDefaultAvatars';
import useLocalize from '@hooks/useLocalize';
import {useAllPersonalDetails} from '@hooks/usePersonalDetails';

import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getDefaultAvatarURL} from '@libs/UserAvatarUtils';

import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';

import {use} from 'react';

/**
 * Resolves a report participant, such as a chat or task owner, into an avatar {@link Icon} the way the legacy component does:
 * a default avatar seeded from the account ID, named by display name, then login, then "Hidden" while personal details are missing.
 * Without an account, it resolves to the unknown account.
 */
function useParticipantIcon(accountID: number | undefined): Icon {
    const {formatPhoneNumber, translate} = useLocalize();
    const [personalDetailsFromSnapshot] = useAllPersonalDetails();
    // On Search, the snapshot can hold a participant missing from the live list. Like the legacy component, fall back to the live list while the snapshot loads.
    const personalDetails = personalDetailsFromSnapshot ?? use(PersonalDetailsContext);
    const defaultAvatars = useDefaultAvatars();

    if (!accountID) {
        return {id: CONST.DEFAULT_NUMBER_ID, type: CONST.ICON_TYPE_AVATAR, source: defaultAvatars.FallbackAvatar, name: ''};
    }

    const details = personalDetails?.[accountID];
    return {
        id: accountID,
        type: CONST.ICON_TYPE_AVATAR,
        source: details?.avatar ?? getDefaultAvatarURL({accountID}),
        name: temporaryGetDisplayNameOrDefault({passedPersonalDetails: details, translate, formatPhoneNumber}),
        fallbackIcon: details?.fallbackIcon,
    };
}

export default useParticipantIcon;
