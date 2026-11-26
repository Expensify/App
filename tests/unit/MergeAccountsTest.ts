/** Regression coverage for identifiers shared by merge code requests and submissions. */
import {mergeWithValidateCode, requestValidationCodeForAccountMerge} from '@libs/actions/MergeAccounts';
import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

jest.mock('@libs/API', () => ({write: jest.fn()}));

describe('merge account identifiers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        {login: '+1-(202)-555-0123)', countryCode: 1, expected: '+12025550123'},
        {login: '202-555-0123', countryCode: 1, expected: '+12025550123'},
        {login: '20 7946 0123', countryCode: 44, expected: '+442079460123'},
        {login: '+44 20 7946 0123', countryCode: 1, expected: '+442079460123'},
        {login: '+12025550123@expensify.sms', countryCode: 1, expected: '+12025550123'},
        {login: ' Merge.Test@Example.com ', countryCode: 44, expected: 'merge.test@example.com'},
    ])('uses the same account when requesting a code, requesting it again and submitting $login', ({login, countryCode, expected}) => {
        // Given an identifier that may contain display formatting or need the selected country code
        const validateCode = '123456';

        // When a user requests a code, requests it again and submits the merge
        requestValidationCodeForAccountMerge(login, false, countryCode);
        requestValidationCodeForAccountMerge(login, true, countryCode);
        mergeWithValidateCode(login, validateCode, countryCode);

        // Then every API request identifies the same account without display formatting
        expect(write).toHaveBeenNthCalledWith(1, WRITE_COMMANDS.GET_VALIDATE_CODE_FOR_ACCOUNT_MERGE, {email: expected}, expect.any(Object));
        expect(write).toHaveBeenNthCalledWith(2, WRITE_COMMANDS.GET_VALIDATE_CODE_FOR_ACCOUNT_MERGE, {email: expected}, expect.any(Object));
        expect(write).toHaveBeenNthCalledWith(3, WRITE_COMMANDS.MERGE_WITH_VALIDATE_CODE, {email: expected, validateCode}, expect.any(Object));
    });
});
