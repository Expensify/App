import {getEmailDomain, isDomainPublic} from '@libs/LoginUtils';
import memoize from '@libs/memoize';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Session} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useMemo} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

const emptyLoginsList: string[] = [];

const sessionEmailSelector = (session: OnyxEntry<Session>) => session?.email;

// One shared scan for all hook instances, cached by collection reference and login so it runs once
// per Onyx write. 'shallow' compares the cache key by reference; the default 'deep' would walk the
// whole collection on every lookup.
const buildAvailableLoginsList = memoize(
    (personalDetails: OnyxEntry<PersonalDetailsList>, currentUserLogin: string): string[] => {
        if (!personalDetails) {
            return emptyLoginsList;
        }

        const currentUserDomain = getEmailDomain(currentUserLogin);
        if (isDomainPublic(currentUserDomain)) {
            return emptyLoginsList;
        }

        const availableLogins: string[] = [];
        for (const personalDetail of Object.values(personalDetails)) {
            // Matching the current user's domain means the login is on the same private domain,
            // because the public-domain case returned early above.
            if (!personalDetail?.login || getEmailDomain(personalDetail.login) !== currentUserDomain) {
                continue;
            }

            const [username] = personalDetail.login.split('@');
            if (username) {
                availableLogins.push(username);
            }
        }
        return availableLogins;
    },
    {maxSize: 1, equality: 'shallow', monitoringName: 'buildAvailableLoginsList'},
);

/**
 * This hook returns data to be used with short mentions in LiveMarkdown/Composer.
 * Short mentions have the format `@username`, where username is the first part of user's login (email).
 * All the personal data from Onyx is formatted into short-mentions.
 * In addition, currently logged-in user is returned separately since it requires special styling.
 */
export default function useShortMentionsList() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [currentUserLogin = ''] = useOnyx(ONYXKEYS.SESSION, {selector: sessionEmailSelector});

    // useOnyx compares the selector output by value, so consumers re-render only when the username list changes.
    const [availableLoginsList = emptyLoginsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: (personalDetails) => buildAvailableLoginsList(personalDetails, currentUserLogin)});

    // We want to highlight both short and long version of current user login
    const currentUserMentions = useMemo(() => {
        if (!currentUserPersonalDetails.login) {
            return [];
        }

        const [baseName] = currentUserPersonalDetails.login.split('@');
        return [baseName, currentUserPersonalDetails.login];
    }, [currentUserPersonalDetails.login]);

    return {availableLoginsList, currentUserMentions};
}
