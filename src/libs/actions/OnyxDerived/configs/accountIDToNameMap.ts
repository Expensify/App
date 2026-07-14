import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Builds a mapping from accountID to user name (login or displayName).
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.ACCOUNT_ID_TO_NAME_MAP,
    dependencies: [ONYXKEYS.PERSONAL_DETAILS_LIST],
    compute: ([personalDetailsList]) => {
        const accountIDToNameMap: Record<string, string> = {};

        for (const personalDetails of Object.values(personalDetailsList ?? {})) {
            if (!personalDetails) {
                continue;
            }

            accountIDToNameMap[personalDetails.accountID] = personalDetails.login ?? personalDetails.displayName ?? '';
        }

        return accountIDToNameMap;
    },
});
