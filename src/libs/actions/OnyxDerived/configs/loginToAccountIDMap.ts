import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';
import ONYXKEYS from '@src/ONYXKEYS';
import type {LoginToAccountIDMapDerivedValue} from '@src/types/onyx';

/**
 * Derives a map of login (lowercased) -> accountID from the personal details list.
 *
 * This is the reactive, persisted replacement for the imperative `emailToPersonalDetailsCache`
 * login lookup that was built via `Onyx.connect` in `PersonalDetailsUtils` (see issue #66391).
 * Keys are lowercased since logins/emails are case-insensitive, matching the previous cache behavior.
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.LOGIN_TO_ACCOUNT_ID_MAP,
    dependencies: [ONYXKEYS.PERSONAL_DETAILS_LIST],
    compute: ([personalDetailsList]) => {
        if (!personalDetailsList) {
            return {};
        }

        const loginToAccountIDMap: LoginToAccountIDMapDerivedValue = {};
        for (const personalDetails of Object.values(personalDetailsList)) {
            if (!personalDetails?.login) {
                continue;
            }
            loginToAccountIDMap[personalDetails.login.toLowerCase()] = personalDetails.accountID;
        }
        return loginToAccountIDMap;
    },
});
