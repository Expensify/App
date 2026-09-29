import guideAccountIDsConfig from '@libs/actions/OnyxDerived/configs/guideAccountIDs';

import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';

describe('guideAccountIDs', () => {
    const guideAccountID = 8;
    const otherGuideAccountID = 3;
    const memberAccountID = 1;
    const guideLogin = `guide@${CONST.EMAIL.GUIDES_DOMAIN}`;
    const otherGuideLogin = `another.guide@${CONST.EMAIL.GUIDES_DOMAIN}`;

    it('returns an empty list when there are no personal details', () => {
        expect(guideAccountIDsConfig.compute([undefined], {})).toEqual([]);
        expect(guideAccountIDsConfig.compute([{}], {})).toEqual([]);
    });

    it('collects only the accounts whose login is on the guides domain', () => {
        const personalDetailsList: PersonalDetailsList = {
            [memberAccountID]: {accountID: memberAccountID, login: 'member@example.com'},
            [guideAccountID]: {accountID: guideAccountID, login: guideLogin},
        };

        expect(guideAccountIDsConfig.compute([personalDetailsList], {})).toEqual([guideAccountID]);
    });

    it('ignores entries without a login', () => {
        const personalDetailsList: PersonalDetailsList = {
            [memberAccountID]: {accountID: memberAccountID},
            [guideAccountID]: {accountID: guideAccountID, login: guideLogin},
        };

        expect(guideAccountIDsConfig.compute([personalDetailsList], {})).toEqual([guideAccountID]);
    });

    it('sorts the result so an unrelated personal-details change recomputes to a shallow-equal array', () => {
        const guideListedLast: PersonalDetailsList = {
            [otherGuideAccountID]: {accountID: otherGuideAccountID, login: otherGuideLogin},
            [guideAccountID]: {accountID: guideAccountID, login: guideLogin},
        };
        const sameGuidesPlusAnAvatarChange: PersonalDetailsList = {
            [guideAccountID]: {accountID: guideAccountID, login: guideLogin, avatar: 'https://example.com/avatar.png'},
            [memberAccountID]: {accountID: memberAccountID, login: 'member@example.com'},
            [otherGuideAccountID]: {accountID: otherGuideAccountID, login: otherGuideLogin},
        };

        expect(guideAccountIDsConfig.compute([guideListedLast], {})).toEqual([otherGuideAccountID, guideAccountID]);
        expect(guideAccountIDsConfig.compute([sameGuidesPlusAnAvatarChange], {})).toEqual([otherGuideAccountID, guideAccountID]);
    });
});
