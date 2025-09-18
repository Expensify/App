import {useMemo} from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import {areEmailsFromSamePrivateDomain} from '@libs/LoginUtils';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

/**
 * This hook returns data to be used with short mentions in LiveMarkdown/Composer.
 * Short mentions have the format `@username`, where username is the first part of user's login (email).
 * All the personal data from Onyx is formatted into short-mentions.
 * In addition, currently logged-in user is returned separately since it requires special styling.
 */
export default function useShortMentionsList() {
    const personalDetails = usePersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const availableLoginsList = useMemo(() => {
        if (!personalDetails) {
            return [];
        }

        return Object.values(personalDetails)
            .map((personalDetail) => {
                if (!personalDetail?.login) {
                    return;
                }

                // If the emails are not in the same private domain, we don't want to highlight them
                if (!areEmailsFromSamePrivateDomain(personalDetail.login, currentUserPersonalDetails.login ?? '')) {
                    return;
                }

                const [username] = personalDetail.login.split('@');
                return username;
            })
            .filter((login): login is string => !!login);
    }, [currentUserPersonalDetails.login, personalDetails]);

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
