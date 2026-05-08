import {personalDetailsLoginSelector, personalDetailsSelector, personalDetailsWithCustomNameSelector} from '@selectors/PersonalDetails';
import {newGetPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import type {PersonalDetailsList} from '@src/types/onyx';
import {translateLocal} from '../utils/TestHelper';

describe('PersonalDetailsSelector', () => {
    const accountID = 123;
    const personalDetails = {
        accountID,
        displayName: 'Test User',
        login: 'test@user.com',
    };
    const personalDetailsList = {
        [accountID]: personalDetails,
    } as unknown as PersonalDetailsList;
    describe('personalDetailsSelector', () => {
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

    describe('personalDetailsLoginSelector', () => {
        it('should return the personal details login for the given accountID', () => {
            const result = personalDetailsLoginSelector(accountID)(personalDetailsList);
            expect(result).toEqual(personalDetails.login);
        });

        it('should return undefined if the accountID is not in the list', () => {
            const result = personalDetailsLoginSelector(999)(personalDetailsList);
            expect(result).toBeUndefined();
        });

        it('should return undefined if the personalDetailsList is undefined', () => {
            const result = personalDetailsLoginSelector(accountID)(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('personalDetailsWithCustomNameSelector', () => {
        it('should match the result from newGetPersonalDetailsByIDs when shouldChangeUserDisplayName is false', () => {
            const accountIDs = [accountID];
            const result = personalDetailsWithCustomNameSelector({accountIDs})(personalDetailsList);

            const expected = newGetPersonalDetailsByIDs({
                accountIDs,
                personalDetails: personalDetailsList,
            });

            expect(result).toEqual(expected);
        });

        it('should match the result from newGetPersonalDetailsByIDs when shouldChangeUserDisplayName is true', () => {
            const accountIDs = [accountID];
            const result = personalDetailsWithCustomNameSelector({
                accountIDs,
                currentUserAccountID: accountID,
                shouldChangeUserDisplayName: true,
                translate: translateLocal,
            })(personalDetailsList);

            const expected = newGetPersonalDetailsByIDs({
                accountIDs,
                personalDetails: personalDetailsList,
                shouldChangeUserDisplayName: true,
                currentUserAccountID: accountID,
                translate: translateLocal,
            });

            expect(result).toEqual(expected);
        });
    });
});
