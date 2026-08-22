import createOnyxDerivedValueConfig from '@userActions/OnyxDerived/createOnyxDerivedValueConfig';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GuideAccountIDsDerivedValue} from '@src/types/onyx';

import {Str} from 'expensify-common';

/**
 * Derives the accountIDs of every Expensify Guide present in the personal details list.
 *
 * Guides are identified by the email domain of their login. Callers used to answer "does this report have a
 * guide participant?" by scanning the personal details list themselves, which meant every subscriber repeated
 * the same full scan (`useOnyx` selectors run per hook instance, they are not shared). Deriving the guide
 * accountIDs once turns each of those checks into a membership test against a handful of IDs.
 *
 * The sort is load-bearing, not cosmetic. Derived values are written with `skipCacheCheck`, so every recompute
 * broadcasts a brand-new array even when the guide set is unchanged; what spares subscribers a re-render is
 * `useOnyx` comparing the new value against the previous one with `shallowEqual`. Emitting the IDs in a stable
 * order is what makes two recomputes of the same set shallow-equal, so an unrelated personal-details change
 * (a new avatar, a display name edit) does not ripple out. See issue #66413.
 */
export default createOnyxDerivedValueConfig({
    key: ONYXKEYS.DERIVED.GUIDE_ACCOUNT_IDS,
    dependencies: [ONYXKEYS.PERSONAL_DETAILS_LIST],
    compute: ([personalDetailsList]) => {
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
        return guideAccountIDs.sort((a, b) => a - b);
    },
});
