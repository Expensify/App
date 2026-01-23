import Onyx from 'react-native-onyx';
import {clearDomainErrors, clearDomainMemberError, closeUserAccount, createDomain, resetCreateDomainForm, resetDomain} from '@libs/actions/Domain';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain, DomainSecurityGroup} from '@src/types/onyx';
import type PrefixedRecord from '@src/types/utils/PrefixedRecord';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

OnyxUpdateManager();
describe('actions/Domain', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        IntlStore.load(CONST.LOCALES.EN);
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('createDomain', () => {
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        createDomain('test.com');

        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.CREATE_DOMAIN,
            {domainName: 'test.com'},
            {
                successData: [expect.objectContaining({value: {hasCreationSucceeded: true, isLoading: null}})],
                optimisticData: [expect.objectContaining({value: {hasCreationSucceeded: null, isLoading: true}})],
                failureData: [expect.objectContaining({value: {isLoading: null}})],
            },
        );

        apiWriteSpy.mockRestore();
    });

    it('resetCreateDomainForm - clears form onyx data', async () => {
        const timestamp = 123;

        await Onyx.set(ONYXKEYS.FORMS.CREATE_DOMAIN_FORM, {
            hasCreationSucceeded: true,
            errors: {[timestamp]: 'error'},
        });

        resetCreateDomainForm();

        await TestHelper.getOnyxData({
            key: ONYXKEYS.FORMS.CREATE_DOMAIN_FORM,
            waitForCollectionCallback: false,
            callback: (form) => {
                expect(form?.hasCreationSucceeded).toBeFalsy();
                expect(form?.errors).toBeFalsy();
            },
        });
    });

    it('resetDomain', () => {
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        const domainAccountID = 123;
        const domainName = 'test.com';
        const domain = {
            accountID: domainAccountID,
        } as Domain;

        resetDomain(domainAccountID, domainName, domain);

        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.DELETE_DOMAIN,
            {domainAccountID, domainName},
            {
                optimisticData: [expect.objectContaining({value: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}}), expect.objectContaining({value: null})],
                successData: [expect.objectContaining({value: {pendingAction: null}}), expect.objectContaining({value: {errors: null}})],
                failureData: [
                    expect.objectContaining({value: domain}),
                    expect.objectContaining({value: {pendingAction: null}}),
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    expect.objectContaining({value: {errors: expect.any(Object)}}),
                ],
            },
        );

        apiWriteSpy.mockRestore();
    });

    it('clearDomainErrors- clears domain errors and pending actions', async () => {
        const domainAccountID = 123;
        const timestamp = 456;

        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}` as const, {
            errors: {[timestamp]: 'error'},
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}` as const, {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        });

        clearDomainErrors(domainAccountID);

        await TestHelper.getOnyxData({
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            waitForCollectionCallback: false,
            callback: (errors) => {
                expect(errors?.errors).toBeFalsy();
            },
        });

        await TestHelper.getOnyxData({
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            waitForCollectionCallback: false,
            callback: (pendingActions) => {
                expect(pendingActions?.pendingAction).toBeFalsy();
            },
        });
    });

    it('closeUserAccount - sends DELETE_DOMAIN_MEMBER API request with correct data', () => {
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        const domainAccountID = 123;
        const domainName = 'test.com';
        const accountID = 456;
        const targetEmail = 'user@test.com';
        const securityGroupKey = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1` as const;
        const securityGroupIDs = [securityGroupKey];
        const securityGroups: PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, Partial<DomainSecurityGroup>> = {
            [securityGroupKey]: {
                shared: {
                    [accountID]: 'read',
                },
            },
        };

        closeUserAccount(domainAccountID, domainName, accountID, targetEmail, securityGroupIDs, securityGroups);

        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.DELETE_DOMAIN_MEMBER,
            {domain: domainName, targetEmail, overrideProcessingReports: false},
            {
                optimisticData: [
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                        value: {[securityGroupKey]: {shared: {[accountID]: null}}},
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                        value: {members: {[targetEmail]: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}},
                    }),
                ],
                successData: [
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                        value: {members: {[targetEmail]: null}},
                    }),
                ],
                failureData: [
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        value: {memberErrors: {[targetEmail]: expect.any(Object)}},
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                        value: {[securityGroupKey]: {shared: {[accountID]: 'read'}}},
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                        value: {members: {[targetEmail]: null}},
                    }),
                ],
            },
        );

        apiWriteSpy.mockRestore();
    });

    it('closeUserAccount - handles multiple security groups', () => {
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        const domainAccountID = 123;
        const domainName = 'test.com';
        const accountID = 456;
        const targetEmail = 'user@test.com';
        const securityGroupKey1 = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1` as const;
        const securityGroupKey2 = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}2` as const;
        const securityGroupIDs = [securityGroupKey1, securityGroupKey2];
        const securityGroups: PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, Partial<DomainSecurityGroup>> = {
            [securityGroupKey1]: {
                shared: {[accountID]: 'read'},
            },
            [securityGroupKey2]: {
                shared: {[accountID]: 'read'},
            },
        };
        closeUserAccount(domainAccountID, domainName, accountID, targetEmail, securityGroupIDs, securityGroups);

        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.DELETE_DOMAIN_MEMBER,
            expect.any(Object),
            expect.objectContaining({
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                        value: {
                            [securityGroupKey1]: {shared: {[accountID]: null}},
                            [securityGroupKey2]: {shared: {[accountID]: null}},
                        },
                    }),
                ]),
            }),
        );

        apiWriteSpy.mockRestore();
    });

    it('closeUserAccount - handles overrideProcessingReports flag', () => {
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        const domainAccountID = 123;
        const domainName = 'test.com';
        const accountID = 456;
        const targetEmail = 'user@test.com';

        closeUserAccount(domainAccountID, domainName, accountID, targetEmail, [], {}, true);

        expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.DELETE_DOMAIN_MEMBER, {domain: domainName, targetEmail, overrideProcessingReports: true}, expect.any(Object));

        apiWriteSpy.mockRestore();
    });

    it('clearDomainMemberError - clears member errors and pending actions', async () => {
        const domainAccountID = 123;
        const accountID = 456;
        const email = 'user@test.com';

        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}` as const, {
            memberErrors: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                [accountID]: {errors: {123: 'error'}},
                // eslint-disable-next-line @typescript-eslint/naming-convention
                [email]: {errors: {456: 'error'}},
            },
        });

        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}` as const, {
            members: {[email]: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
        });

        clearDomainMemberError(domainAccountID, accountID, email);

        await TestHelper.getOnyxData({
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            waitForCollectionCallback: false,
            callback: (errors) => {
                expect(errors?.memberErrors?.[accountID]).toBeFalsy();
                expect(errors?.memberErrors?.[email]).toBeFalsy();
            },
        });

        await TestHelper.getOnyxData({
            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
            waitForCollectionCallback: false,
            callback: (pendingActions) => {
                expect(pendingActions?.members?.[email]).toBeFalsy();
            },
        });
    });
});
