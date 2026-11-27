/**
 * The attendees the bulk edit draft holds, as the avatar pills the expense form's attendees row shows, so the
 * attendees row on Edit multiple matches every other attendees row in the new field style.
 */
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import UserPills from '@components/UserPills';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {enrichAndSortAttendees} from '@libs/AttendeeUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Attendee} from '@src/types/onyx/IOU';

import React from 'react';

type SearchEditMultipleAttendeePillsProps = {
    /** Attendees the bulk edit draft holds */
    attendees: Attendee[];
};

function SearchEditMultipleAttendeePills({attendees}: SearchEditMultipleAttendeePillsProps) {
    const {localeCompare} = useLocalize();
    const personalDetailsList = usePersonalDetails();
    const [loginToAccountIDMap] = useOnyx(ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP);

    // The draft only stores what was picked, so names and avatars are filled in from the live personal details.
    const enrichedAttendees = enrichAndSortAttendees(attendees, loginToAccountIDMap, personalDetailsList, localeCompare) ?? [];

    return (
        <UserPills
            users={enrichedAttendees.map((attendee) => ({
                avatar: attendee.avatarUrl,
                displayName: attendee.displayName ?? attendee.email ?? '',
                accountID: attendee.accountID,
                email: attendee.email,
            }))}
        />
    );
}

export default SearchEditMultipleAttendeePills;
