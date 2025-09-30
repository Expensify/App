import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import resetUSDBankAccount from '@src/libs/actions/ReimbursementAccount/resetUSDBankAccount';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ACHAccount} from '@src/types/onyx/Policy';
import type {MockFetch} from '../utils/TestHelper';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const TEST_EMAIL = 'test@test.com';
const TEST_ACCOUNT_ID = 1;
const bankAccountID = 1;
const policyID = '1234567890';
const session = {email: TEST_EMAIL, accountID: TEST_ACCOUNT_ID};

describe('ReimbursementAccount', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    let mockFetch: MockFetch;
    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        mockFetch = fetch as MockFetch;
        IntlStore.load(CONST.LOCALES.EN);
        return Onyx.clear().then(waitForBatchedUpdates);
    });
    describe('resetUSDBankAccount', () => {
        afterEach(() => {
            mockFetch?.resume?.();
        });

        it('should reset the USDBankAccount', async () => {
            (fetch as MockFetch)?.pause?.();
            const achAccount: ACHAccount = {
                bankAccountID,
                addressName: 'Test Address',
                bankName: 'Test Bank',
                reimburser: TEST_EMAIL,
                accountNumber: '1234567890',
                routingNumber: '123456789',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {achAccount});
            resetUSDBankAccount(bankAccountID, session, policyID, achAccount);

            return waitForBatchedUpdates().then(
                () =>
                    new Promise<void>((resolve) => {
                        const connection = Onyx.connect({
                            key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                            callback: (policy) => {
                                Onyx.disconnect(connection);
                                expect(policy?.achAccount).toBeUndefined();
                                resolve();
                            },
                        });
                    }),
            );
        });
    });
});
