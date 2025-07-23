import Onyx from 'react-native-onyx';
import {getPersonalDetailsOnyxDataForOptimisticUsers} from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {formatPhoneNumber} from '../../utils/TestHelper';

describe('PersonalDetailsUtils', () => {
    beforeAll(() => {
        Onyx.merge(ONYXKEYS.COUNTRY_CODE, 1);
    });
    test('getPersonalDetailsOnyxDataForOptimisticUsers should return correct optimistic and finally data', () => {
        const newLogins = ['3322076524', 'test2@test.com'];
        const newAccountIDs = [1, 2];

        // Call the function with the mock formatPhoneNumber
        const result = getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs, formatPhoneNumber);

        // Construct the expected output based on the function's logic and the mock behavior.
        const expected = {
            optimisticData: [
                {
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST, // Expecting 'personalDetailsList'
                    onyxMethod: 'merge', // Use string literal as expected
                    value: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '1': {
                            // Use numeric key as per lint rule (no quotes)
                            accountID: 1,
                            displayName: '3322076524', // This comes from mockFormatPhoneNumber('test1@test.com')
                            isOptimisticPersonalDetail: true,
                            login: '3322076524',
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '2': {
                            accountID: 2,
                            displayName: 'test2@test.com', // This comes from mockFormatPhoneNumber('test2@test.com')
                            isOptimisticPersonalDetail: true,
                            login: 'test2@test.com',
                        },
                    },
                },
            ],
            finallyData: [
                {
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST, // Expecting 'personalDetailsList'
                    onyxMethod: Onyx.METHOD.MERGE, // Expecting 'merge'
                    value: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '1': null, // Cleanup for accountID 1
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '2': null, // Cleanup for accountID 2
                    },
                },
            ],
        };

        expect(result).toEqual(expected);
    });
});
