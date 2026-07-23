import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsListByLoginDerivedValue} from '@src/types/onyx';

/**
 * Derives a map of login -> personal details from the personal details list.
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.PERSONAL_DETAILS_LIST_BY_LOGIN,
    dependencies: [ONYXKEYS.PERSONAL_DETAILS_LIST],
    compute: ([personalDetailsList]) => {
        if (!personalDetailsList) {
            return {};
        }

        const personalDetailsListByLogin: PersonalDetailsListByLoginDerivedValue = {};
        for (const personalDetails of Object.values(personalDetailsList)) {
            if (!personalDetails?.login) {
                continue;
            }
            personalDetailsListByLogin[personalDetails.login] = personalDetails;
        }
        return personalDetailsListByLogin;
    },
});
