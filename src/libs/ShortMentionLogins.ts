import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * The logins of every known personal detail, in the shape `addDomainToShortMention` expects.
 *
 * Short mentions are resolved from non-React code (`getParsedComment` alone has around thirty
 * callers), so the list cannot come from a hook until those callers thread personal details in
 * themselves. It sits in its own file rather than next to the other personal details caches
 * because every subscription to `PERSONAL_DETAILS_LIST` is being removed one file at a time, and
 * adding a consumer to one someone is mid-way through deleting sets that work back.
 */
let allPersonalDetailLogins: string[] = [];

Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (personalDetailsList) => {
        allPersonalDetailLogins = Object.values(personalDetailsList ?? {}).map((personalDetail) => personalDetail?.login ?? '');
    },
});

function getAllPersonalDetailLogins(): string[] {
    return allPersonalDetailLogins;
}

// eslint-disable-next-line import/prefer-default-export
export {getAllPersonalDetailLogins};
