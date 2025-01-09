import {useMemo} from 'react';
import {usePersonalDetails} from '@components/OnyxProvider';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';

const getMention = (mention: string) => `@${mention}`;

/**
 * This hook returns data to be used with short mentions in LiveMarkdown/Composer.
 * Short mentions have the format `@username`, where username is the first part of user's login (email).
 * All the personal data from Onyx is formatted into short-mentions.
 * In addition, currently logged-in user is returned separately since it requires special styling.
 */
export default function useShortMentionsList() {
    const personalDetails = usePersonalDetails();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const mentionsList = useMemo(() => {
        if (!personalDetails) {
            return [];
        }

        return Object.values(personalDetails)
            .map((personalDetail) => {
                if (!personalDetail?.login) {
                    return;
                }

                const [username] = personalDetail.login.split('@');
                return username ? getMention(username) : undefined;
            })
            .filter((login): login is string => !!login);
    }, [personalDetails]);

    const currentUserMention = useMemo(() => {
        if (!currentUserPersonalDetails.login) {
            return;
        }

        const [baseName] = currentUserPersonalDetails.login.split('@');
        return getMention(baseName);
    }, [currentUserPersonalDetails.login]);

    return {mentionsList, currentUserMention};
}
