import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails as TPersonalDetails} from '@src/types/onyx';

function getCurrentUserAccountIDFromOnyx(): Promise<number> {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.SESSION,
            callback: (val) => {
                Onyx.disconnect(connectionID);
                return resolve(val?.accountID ?? -1);
            },
        });
    });
}

function getCurrentUserPersonalDetailsFromOnyx(currentUserAccountID: number): Promise<OnyxEntry<TPersonalDetails>> {
    return new Promise((resolve) => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            callback: (val) => {
                Onyx.disconnect(connectionID);
                return resolve(val?.[currentUserAccountID] ?? null);
            },
        });
    });
}

/**
 * This migration updates reportActionsDrafts data to be keyed by reportActionID.
 *
 * Before: reportActionsDrafts_reportID_reportActionID: value
 * After: reportActionsDrafts_reportID: {[reportActionID]: value}
 */
export default function (): Promise<void | void[]> {
    return getCurrentUserAccountIDFromOnyx()
        .then(getCurrentUserPersonalDetailsFromOnyx)
        .then((currentUserPersonalDetails: OnyxEntry<TPersonalDetails>) => {
            if (!currentUserPersonalDetails) {
                return;
            }

            const pronouns = currentUserPersonalDetails.pronouns?.replace(CONST.PRONOUNS.PREFIX, '') ?? '';
            const isDeprecatedPronouns = !!pronouns && !pronouns.startsWith(CONST.PRONOUNS.PREFIX);
            if (!isDeprecatedPronouns) {
                return;
            }

            const pronounsKey = Object.entries(CONST.DEPRECATED_PRONOUNS_LIST).find((deprecated) => deprecated[1] === pronouns)?.[0] ?? '';
            PersonalDetails.updatePronouns(pronounsKey ? `${CONST.PRONOUNS.PREFIX}${pronounsKey}` : '', false);
        });
}
