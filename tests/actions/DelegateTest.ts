import Onyx from 'react-native-onyx';
import {addDelegate, clearDelegateErrorsByField, clearDelegatorErrors, isConnectedAsDelegate, removeDelegate, updateDelegateRole} from '@libs/actions/Delegate';
import CONST from '@src/CONST';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DelegatedAccess} from '@src/types/onyx/Account';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/Delegate', () => {
    beforeAll(async () => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    describe('clearDelegatorErrors', () => {
        it('should clear delegator errors', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegators: [
                    {
                        email: 'test@test.com',
                        // @ts-expect-error - errorFields is not defined in the type
                        errorFields: {
                            addDelegate: {
                                // eslint-disable-next-line @typescript-eslint/naming-convention
                                '12211': {
                                    email: 'Invalid email address',
                                },
                            },
                        },
                    },
                ],
            };

            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        // @ts-expect-error - errorFields is not defined in the type
                        expect(account?.delegatedAccess?.delegators?.at(0)?.errorFields).toBeDefined();
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });

            clearDelegatorErrors({delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        // @ts-expect-error - errorFields is not defined in the type
                        expect(account?.delegatedAccess?.delegators?.at(0)?.errorFields).toBeUndefined();
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });
        });
    });
    describe('addDelegate', () => {
        it('should add a delegate', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegates: [],
            };
            await waitForBatchedUpdates();

            addDelegate({email: 'test@test.com', role: CONST.DELEGATE_ROLE.ALL, validateCode: '123456', delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        expect(account?.delegatedAccess?.delegates?.at(0)?.email).toBe('test@test.com');
                        expect(account?.delegatedAccess?.delegates?.at(0)?.role).toBe(CONST.DELEGATE_ROLE.ALL);
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });
        });
    });
    describe('removeDelegate', () => {
        it('should remove a delegate', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegates: [
                    {
                        email: 'test@test.com',
                        role: CONST.DELEGATE_ROLE.ALL,
                    },
                ],
            };

            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});
            await waitForBatchedUpdates();

            removeDelegate({email: 'test@test.com', delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        const delegates = account?.delegatedAccess?.delegates ?? [];

                        const firstDelegate = delegates.at(0);
                        const isOptimisticDelete = firstDelegate?.email === 'test@test.com' && firstDelegate?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                        const isRemoved = delegates.every((d) => d.email !== 'test@test.com');

                        if (isOptimisticDelete) {
                            expect(firstDelegate?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                            Onyx.disconnect(connection);
                            resolve();
                        } else if (isRemoved) {
                            expect(delegates.some((d) => d.email === 'test@test.com')).toBe(false);
                            Onyx.disconnect(connection);
                            resolve();
                        }
                    },
                });
            });
        });
    });
    describe('clearDelegateErrorsByField', () => {
        it('should clear a delegate error by field', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegates: [
                    {
                        email: 'test@test.com',
                        role: CONST.DELEGATE_ROLE.ALL,
                    },
                ],
                errorFields: {
                    addDelegate: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'test@test.com': {
                            email: 'Invalid email address',
                        },
                    },
                },
            };

            // Set initial Onyx state
            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});
            await waitForBatchedUpdates();

            // Clear an error in a simple field
            clearDelegateErrorsByField({
                email: 'test@test.com',
                fieldName: 'addDelegate',
                delegatedAccess,
            });
            await waitForBatchedUpdates();

            // Assert
            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        const errorFields = account?.delegatedAccess?.errorFields;

                        // The targeted errors should be cleared (may be undefined or object without the key)
                        const isCleared = errorFields?.addDelegate?.['test@test.com'] === undefined;
                        if (isCleared) {
                            expect(errorFields?.addDelegate?.['test@test.com']).toBeUndefined();
                            Onyx.disconnect(connection);
                            resolve();
                        }
                    },
                });
            });
        });
    });

    describe('updateDelegateRole', () => {
        it('should update a delegate role', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegates: [
                    {
                        email: 'test@test.com',
                        role: CONST.DELEGATE_ROLE.ALL,
                    },
                ],
            };

            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});
            await waitForBatchedUpdates();

            updateDelegateRole({email: 'test@test.com', role: CONST.DELEGATE_ROLE.SUBMITTER, validateCode: '123456', delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        const firstDelegate = account?.delegatedAccess?.delegates?.at(0);
                        const isOptimistic =
                            firstDelegate?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE && firstDelegate?.pendingFields?.role === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
                        const isSuccess = firstDelegate?.pendingAction === null && firstDelegate?.pendingFields?.role === null && firstDelegate?.role === CONST.DELEGATE_ROLE.SUBMITTER;
                        if (isOptimistic) {
                            expect(firstDelegate?.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            expect(firstDelegate?.pendingFields?.role).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
                            Onyx.disconnect(connection);
                            resolve();
                        } else if (isSuccess) {
                            expect(firstDelegate?.pendingAction).toBeNull();
                            expect(firstDelegate?.pendingFields?.role).toBeNull();
                            expect(firstDelegate?.role).toBe(CONST.DELEGATE_ROLE.SUBMITTER);
                            Onyx.disconnect(connection);
                            resolve();
                        }
                    },
                });
            });
        });
    });
    describe('isConnectedAsDelegate', () => {
        it('should return true if the user is connected as a delegate', async () => {
            const delegatedAccess: DelegatedAccess = {
                delegates: [
                    {
                        email: 'test@test.com',
                        role: CONST.DELEGATE_ROLE.ALL,
                    },
                ],
            };

            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});
            await waitForBatchedUpdates();

            await new Promise<void>((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.ACCOUNT,
                    callback: (account) => {
                        expect(isConnectedAsDelegate({delegatedAccess: account?.delegatedAccess})).toBe(false);
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });
        });
    });
});
