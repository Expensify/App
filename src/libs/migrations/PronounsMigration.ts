import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails as TPersonalDetails} from '@src/types/onyx';

function getCurrentUserAccountIDFromOnyx(): Promise<number> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.SESSION,
            callback: (val) => {
                Onyx.disconnect(connection);
                return resolve(val?.accountID);
            },
        });
    });
}

function getCurrentUserPersonalDetailsFromOnyx(currentUserAccountID: number): Promise<NonNullable<OnyxEntry<TPersonalDetails>> | null> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            callback: (val) => {
                Onyx.disconnect(connection);
                return resolve(val?.[currentUserAccountID] ?? null);
            },
        });
    });
}

/**
 * This migration updates deprecated pronouns with new predefined ones.
 */
export default function (): Promise<void | void[]> {
    return getCurrentUserAccountIDFromOnyx()
        .then(getCurrentUserPersonalDetailsFromOnyx)
        .then((currentUserPersonalDetails) => {
            if (!currentUserPersonalDetails) {
                return;
            }

            const pronouns = currentUserPersonalDetails.pronouns?.replace(CONST.PRONOUNS.PREFIX, '') ?? '';
            if (!pronouns || (CONST.PRONOUNS_LIST as readonly string[]).includes(pronouns)) {
                return;
            }

            // Find the updated pronouns key replaceable for the deprecated value.
            const pronounsKey = Object.entries(CONST.DEPRECATED_PRONOUNS_LIST).find((deprecated) => deprecated[1] === pronouns)?.[0] ?? '';
            // If couldn't find the updated pronouns, reset it to require user's manual update.
            PersonalDetails.updatePronouns(pronounsKey ? `${CONST.PRONOUNS.PREFIX}${pronounsKey}` : '');
        });
}
