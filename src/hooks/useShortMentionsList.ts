import {getCurrentUserEmail} from '@libs/CurrentUserStore';
import {getEmailDomain, isDomainPublic} from '@libs/LoginUtils';
import memoize from '@libs/memoize';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useMemo} from 'react';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

const emptyLoginsList: string[] = [];

// Scanning the whole personal details collection is expensive on large accounts, and this hook mounts
// once per markdown input and once per short mention in every visible message. The memoized scan
// (keyed by collection reference and current user login) runs once per Onyx write and is shared by
// all instances. `equality: 'shallow'` compares the cache key by reference — the default 'deep' would
// deep-compare the entire collection on every lookup.
const buildAvailableLoginsList = memoize(
    (personalDetails: OnyxEntry<PersonalDetailsList>, currentUserLogin: string): string[] => {
        if (!personalDetails) {
            return emptyLoginsList;
        }

        const currentUserDomain = getEmailDomain(currentUserLogin);
        if (isDomainPublic(currentUserDomain)) {
            return emptyLoginsList;
        }

        return Object.values(personalDetails)
            .map((personalDetail) => {
                if (!personalDetail?.login) {
                    return;
                }

                const personalDetailDomain = getEmailDomain(personalDetail.login);
                const isPersonalDetailPublicDomain = isDomainPublic(personalDetailDomain);

                // If the emails are not in the same private domain, we don't want to highlight them
                if (isPersonalDetailPublicDomain || personalDetailDomain !== currentUserDomain) {
                    return;
                }

                const [username] = personalDetail.login.split('@');
                return username;
            })
            .filter((login): login is string => !!login);
    },
    {maxSize: 1, equality: 'shallow', monitoringName: 'buildAvailableLoginsList'},
);

const availableLoginsListSelector = (personalDetails: OnyxEntry<PersonalDetailsList>) => buildAvailableLoginsList(personalDetails, getCurrentUserEmail() ?? '');

/**
 * This hook returns data to be used with short mentions in LiveMarkdown/Composer.
 * Short mentions have the format `@username`, where username is the first part of user's login (email).
 * All the personal data from Onyx is formatted into short-mentions.
 * In addition, currently logged-in user is returned separately since it requires special styling.
 */
export default function useShortMentionsList() {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    // useOnyx deep-compares the selector output, so consumers only re-render when the username list
    // actually changes (someone joins or leaves the domain) — not on every personal details write.
    const [availableLoginsList = emptyLoginsList] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: availableLoginsListSelector, canBeMissing: true});

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
