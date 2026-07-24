import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import resetNonUSDBankAccount from '@src/libs/actions/ReimbursementAccount/resetNonUSDBankAccount';
import resetUSDBankAccount from '@src/libs/actions/ReimbursementAccount/resetUSDBankAccount';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ACHAccount} from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import type {MockFetch} from '../utils/TestHelper';

import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const TEST_EMAIL = 'test@test.com';
const TEST_ACCOUNT_ID = 1;
const bankAccountID = 1;
const policyID = '1234567890';
const session = {email: TEST_EMAIL, accountID: TEST_ACCOUNT_ID};

function expectDisconnectedAchAccount(achAccount: ACHAccount | null | undefined, reimburser: string) {
    expect(achAccount?.reimburser).toBe(reimburser);
    expect(achAccount?.bankAccountID).toBeFalsy();
    expect(achAccount?.accountNumber).toBeFalsy();
    expect(achAccount?.addressName).toBeFalsy();
    expect(achAccount?.bankName).toBeFalsy();
    expect(achAccount?.state).toBeFalsy();
    expect(achAccount?.routingNumber).toBeFalsy();
    expect(achAccount?.sharees).toBeFalsy();
}

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
            mockFetch.pause?.();
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
                                expectDisconnectedAchAccount(policy?.achAccount, TEST_EMAIL);
                                resolve();
                            },
                        });
                    }),
            );
        });

        it('should optimistically mark bank account as pending deletion', async () => {
            mockFetch.pause?.();
            const achAccount: ACHAccount = {
                bankAccountID,
                addressName: 'Test Address',
                bankName: 'Test Bank',
                reimburser: TEST_EMAIL,
                accountNumber: '1234567890',
                routingNumber: '123456789',
            };
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {bankCurrency: 'USD', bankCountry: 'US'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {achAccount});
            resetUSDBankAccount(bankAccountID, session, policyID, achAccount);

            await waitForBatchedUpdates();
            return new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.BANK_ACCOUNT_LIST,
                    callback: (bankAccountList) => {
                        Onyx.disconnect(connection);
                        expect(bankAccountList?.[bankAccountID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                        resolve();
                    },
                });
            });
        });

        it('should remove bank account from list on success', async () => {
            const achAccount: ACHAccount = {
                bankAccountID,
                addressName: 'Test Address',
                bankName: 'Test Bank',
                reimburser: TEST_EMAIL,
                accountNumber: '1234567890',
                routingNumber: '123456789',
            };
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {bankCurrency: 'USD', bankCountry: 'US'},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {achAccount});
            resetUSDBankAccount(bankAccountID, session, policyID, achAccount);

            await waitForBatchedUpdates();
            return new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.BANK_ACCOUNT_LIST,
                    callback: (bankAccountList) => {
                        Onyx.disconnect(connection);
                        expect(bankAccountList?.[bankAccountID]).toBeUndefined();
                        resolve();
                    },
                });
            });
        });
    });

    describe('resetNonUSDBankAccount', () => {
        afterEach(() => {
            mockFetch?.resume?.();
        });

        it('should optimistically mark bank account as pending deletion', async () => {
            mockFetch.pause?.();
            const achAccount: ACHAccount = {
                bankAccountID,
                addressName: 'Test Address',
                bankName: 'Test Bank',
                reimburser: TEST_EMAIL,
                accountNumber: '1234567890',
                routingNumber: '123456789',
            };
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {bankCurrency: 'CAD', bankCountry: 'CA'},
            });
            resetNonUSDBankAccount(policyID, achAccount, bankAccountID);

            await waitForBatchedUpdates();
            return new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.BANK_ACCOUNT_LIST,
                    callback: (bankAccountList) => {
                        Onyx.disconnect(connection);
                        expect(bankAccountList?.[bankAccountID]?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                        resolve();
                    },
                });
            });
        });

        it('should remove bank account from list on success', async () => {
            const achAccount: ACHAccount = {
                bankAccountID,
                addressName: 'Test Address',
                bankName: 'Test Bank',
                reimburser: TEST_EMAIL,
                accountNumber: '1234567890',
                routingNumber: '123456789',
            };
            await Onyx.set(ONYXKEYS.BANK_ACCOUNT_LIST, {
                [bankAccountID]: {bankCurrency: 'CAD', bankCountry: 'CA'},
            });
            resetNonUSDBankAccount(policyID, achAccount, bankAccountID);

            await waitForBatchedUpdates();
            return new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.BANK_ACCOUNT_LIST,
                    callback: (bankAccountList) => {
                        Onyx.disconnect(connection);
                        expect(bankAccountList?.[bankAccountID]).toBeUndefined();
                        resolve();
                    },
                });
            });
        });

        it('should preserve designated payer and clear bank fields optimistically', async () => {
            mockFetch.pause?.();
            const achAccount: ACHAccount = {
                bankAccountID,
                addressName: 'Test Address',
                bankName: 'Test Bank',
                reimburser: TEST_EMAIL,
                accountNumber: '1234567890',
                routingNumber: '123456789',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {achAccount});
            resetNonUSDBankAccount(policyID, achAccount, bankAccountID);

            await waitForBatchedUpdates();
            return new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expectDisconnectedAchAccount(policy?.achAccount, TEST_EMAIL);
                        resolve();
                    },
                });
            });
        });

        it('should reset locally without API call when no bankAccountID', async () => {
            const achAccount: ACHAccount = {
                bankAccountID: 0,
                addressName: 'Test Address',
                bankName: 'Test Bank',
                reimburser: TEST_EMAIL,
                accountNumber: '1234567890',
                routingNumber: '123456789',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {achAccount});
            resetNonUSDBankAccount(policyID, achAccount);

            await waitForBatchedUpdates();
            return new Promise<void>((resolve) => {
                const reimbursementConnection = Onyx.connect({
                    key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                    callback: (reimbursementAccount) => {
                        Onyx.disconnect(reimbursementConnection);
                        expect(reimbursementAccount).toEqual(CONST.REIMBURSEMENT_ACCOUNT.DEFAULT_DATA);
                    },
                });
                const policyConnection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (policy) => {
                        Onyx.disconnect(policyConnection);
                        expectDisconnectedAchAccount(policy?.achAccount, TEST_EMAIL);
                        resolve();
                    },
                });
            });
        });

        it('should preserve designated payer when it differs from owner', async () => {
            const designatedPayer = 'payer@test.com';
            const policyOwner = 'owner@test.com';
            const achAccount: ACHAccount = {
                bankAccountID,
                addressName: 'Test Address',
                bankName: 'Test Bank',
                reimburser: designatedPayer,
                accountNumber: '1234567890',
                routingNumber: '123456789',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {achAccount});
            resetNonUSDBankAccount(policyID, achAccount, bankAccountID, undefined, policyOwner);

            await waitForBatchedUpdates();
            return new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expectDisconnectedAchAccount(policy?.achAccount, designatedPayer);
                        resolve();
                    },
                });
            });
        });

        it('should fall back to owner when achAccount has no reimburser', async () => {
            const policyOwner = 'owner@test.com';
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {});
            resetNonUSDBankAccount(policyID, undefined, bankAccountID, undefined, policyOwner);

            await waitForBatchedUpdates();
            return new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.POLICY}${policyID}`,
                    callback: (policy) => {
                        Onyx.disconnect(connection);
                        expectDisconnectedAchAccount(policy?.achAccount, policyOwner);
                        resolve();
                    },
                });
            });
        });
    });
});
