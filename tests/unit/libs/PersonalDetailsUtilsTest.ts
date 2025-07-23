import Onyx from 'react-native-onyx';
import {getPersonalDetailsOnyxDataForOptimisticUsers} from '@libs/PersonalDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {formatPhoneNumber} from '../../utils/TestHelper';

describe('PersonalDetailsUtils', () => {
    beforeAll(async () => {
        await Onyx.merge(ONYXKEYS.COUNTRY_CODE, 1);
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
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    onyxMethod: 'merge',
                    value: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '1': {
                            accountID: 1,
                            displayName: '3322076524',
                            isOptimisticPersonalDetail: true,
                            login: '3322076524',
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '2': {
                            accountID: 2,
                            // This comes from mockFormatPhoneNumber('test2@test.com')
                            displayName: 'test2@test.com',
                            isOptimisticPersonalDetail: true,
                            login: 'test2@test.com',
                        },
                    },
                },
            ],
            finallyData: [
                {
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    onyxMethod: Onyx.METHOD.MERGE,
                    value: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '1': null,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '2': null,
                    },
                },
            ],
        };

        expect(result).toEqual(expected);
    });
});
