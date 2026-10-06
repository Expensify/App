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

    it('should return the current value when the guides are unchanged', () => {
        // Given the guide accountIDs computed from the current personal details
        const personalDetailsList: PersonalDetailsList = {
            [guideAccountID]: {accountID: guideAccountID, login: guideLogin},
            [memberAccountID]: {accountID: memberAccountID, login: 'member@example.com'},
        };
        const currentValue = guideAccountIDsConfig.compute([personalDetailsList], {});

        // When a member changes their name, which leaves the set of guides as it was
        const renamedMember: PersonalDetailsList = {...personalDetailsList, [memberAccountID]: {accountID: memberAccountID, login: 'member@example.com', displayName: 'Renamed'}};

        // Then the same array comes back, so consumers comparing by reference don't re-render
        expect(guideAccountIDsConfig.compute([renamedMember], {currentValue})).toBe(currentValue);
    });

    it('should return a new array when a guide is removed', () => {
        // Given two guides
        const twoGuides: PersonalDetailsList = {
            [guideAccountID]: {accountID: guideAccountID, login: guideLogin},
            [otherGuideAccountID]: {accountID: otherGuideAccountID, login: otherGuideLogin},
        };
        const currentValue = guideAccountIDsConfig.compute([twoGuides], {});

        // When one of them leaves the personal details
        const oneGuide: PersonalDetailsList = {[guideAccountID]: {accountID: guideAccountID, login: guideLogin}};
        const result = guideAccountIDsConfig.compute([oneGuide], {currentValue});

        // Then a shorter list must not be mistaken for the current one
        expect(result).not.toBe(currentValue);
        expect(result).toEqual([guideAccountID]);
    });
});
