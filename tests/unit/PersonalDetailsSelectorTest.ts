import {personalDetailsSelector} from '@selectors/PersonalDetails';
import type {PersonalDetailsList} from '@src/types/onyx';

describe('PersonalDetailsSelector', () => {
    describe('personalDetailsSelector', () => {
        const accountID = 123;
        const personalDetails = {
            accountID,
            displayName: 'Test User',
        };
        const personalDetailsList = {
            [accountID]: personalDetails,
        } as unknown as PersonalDetailsList;

        it('should return the personal details for the given accountID', () => {
            const result = personalDetailsSelector(accountID)(personalDetailsList);
            expect(result).toEqual(personalDetails);
        });

        it('should return undefined if the accountID is not in the list', () => {
            const result = personalDetailsSelector(999)(personalDetailsList);
            expect(result).toBeUndefined();
        });

        it('should return undefined if the personalDetailsList is undefined', () => {
            const result = personalDetailsSelector(accountID)(undefined);
            expect(result).toBeUndefined();
        });
    });
});
