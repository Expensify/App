import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GuideAccountIDsDerivedValue} from '@src/types/onyx';

import {Str} from 'expensify-common';
import {shallowEqual} from 'fast-equals';

/**
 * Derives the accountIDs of every Expensify Guide (identified by login domain) in the personal details list.
 * Sorted so an unrelated personal-details change recomputes to a shallow-equal array. See issue #66413.
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS,
    dependencies: [ONYXKEYS.PERSONAL_DETAILS_LIST],
    compute: ([personalDetailsList], {currentValue}) => {
        if (!personalDetailsList) {
            return [];
        }

        const guideAccountIDs: GuideAccountIDsDerivedValue = [];
        for (const personalDetails of Object.values(personalDetailsList)) {
            if (!personalDetails?.login || Str.extractEmailDomain(personalDetails.login) !== CONST.EMAIL.GUIDES_DOMAIN) {
                continue;
            }
            guideAccountIDs.push(personalDetails.accountID);
        }
        guideAccountIDs.sort((a, b) => a - b);
        return currentValue && shallowEqual(currentValue, guideAccountIDs) ? currentValue : guideAccountIDs;
    },
});
