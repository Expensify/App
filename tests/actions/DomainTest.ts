import Onyx from 'react-native-onyx';
import {
    addAdminToDomain,
    addMemberToDomain,
    clearDomainErrors,
    clearDomainMemberError,
    clearVacationDelegateError,
    closeUserAccount,
    createDomain,
    deleteDomainVacationDelegate,
    resetCreateDomainForm,
    resetDomain,
    setDomainVacationDelegate,
} from '@libs/actions/Domain';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {generateAccountID} from '@libs/UserUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import OnyxUpdateManager from '@src/libs/actions/OnyxUpdateManager';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain, DomainSecurityGroup, UserSecurityGroupData} from '@src/types/onyx';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';
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

    it('addMemberToDomain', () => {
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        const domainAccountID = 123;
        const email = 'test@example.com';
        const defaultSecurityGroupID = '1';

        addMemberToDomain(domainAccountID, email, defaultSecurityGroupID);

        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.ADD_DOMAIN_MEMBER,
            {email, domainAccountID},
            {
                optimisticData: [
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        value: expect.any(Object),
                    }),
                    expect.objectContaining({
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        value: expect.any(Object),
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                        value: {member: {[email]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}}},
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                        value: {memberErrors: {[email]: {errors: null}}},
                    }),
                ],
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                        value: {memberErrors: {[email]: {errors: null}}},
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        value: {memberErrors: {[email]: {errors: expect.any(Object)}}},
                    }),
                    expect.objectContaining({
                        key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                        value: {member: {[email]: {pendingAction: null}}},
                    }),
                ]),
            },
        );

        apiWriteSpy.mockRestore();
    });

    it('addAdminToDomain - adds and clears optimistic personal details for optimistic accounts', () => {
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        const domainAccountID = 123;
        const accountID = 456;
        const targetEmail = 'test@example.com';
        const domainName = 'test.com';

        addAdminToDomain(domainAccountID, accountID, targetEmail, domainName, true);

        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.ADD_DOMAIN_ADMIN,
            {domainName, targetEmail},
            {
                optimisticData: expect.arrayContaining([
                    expect.objectContaining({
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        value: {
                            [accountID]: {
                                accountID,
                                login: targetEmail,
                                displayName: targetEmail,
                                isOptimisticPersonalDetail: true,
                            },
                        },
                    }),
                ]),
                successData: expect.arrayContaining([
                    expect.objectContaining({
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        value: {[accountID]: null},
                    }),
                ]),
                failureData: expect.arrayContaining([
                    expect.objectContaining({
                        key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                        value: {[accountID]: null},
                    }),
                ]),
            },
        );

        apiWriteSpy.mockRestore();
    });

    it('addAdminToDomain - does not update optimistic personal details for non-optimistic accounts', () => {
        const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
        const domainAccountID = 123;
        const accountID = 456;
        const targetEmail = 'test@example.com';
        const domainName = 'test.com';

        addAdminToDomain(domainAccountID, accountID, targetEmail, domainName, false);

        expect(apiWriteSpy).toHaveBeenCalledWith(
            WRITE_COMMANDS.ADD_DOMAIN_ADMIN,
            {domainName, targetEmail},
            expect.objectContaining({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                optimisticData: expect.not.arrayContaining([expect.objectContaining({key: ONYXKEYS.PERSONAL_DETAILS_LIST})]),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                successData: expect.not.arrayContaining([expect.objectContaining({key: ONYXKEYS.PERSONAL_DETAILS_LIST})]),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                failureData: expect.not.arrayContaining([expect.objectContaining({key: ONYXKEYS.PERSONAL_DETAILS_LIST})]),
            }),
        );

        apiWriteSpy.mockRestore();
    });

    it('clearAddMemberError - clears member errors and optimistic data', async () => {
        const domainAccountID = 123;
        const email = 'test@example.com';
        const optimisticAccountID = generateAccountID(email);
        const defaultSecurityGroupID = '1';
        const DOMAIN_SECURITY_GROUP = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${defaultSecurityGroupID}`;
        const timestamp = 456;

        await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}` as const, {
            memberErrors: {
                [email]: {
                    errors: {[timestamp]: 'error'},
                },
            },
        });

        await Onyx.set(
            `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}` as const,
            {
                [DOMAIN_SECURITY_GROUP]: {
                    shared: {
                        [optimisticAccountID]: 'read',
                    },
                },
            } as PrefixedRecord<typeof CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX, Partial<DomainSecurityGroup>>,
        );

        clearDomainMemberError(domainAccountID, optimisticAccountID, email, defaultSecurityGroupID, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

        await TestHelper.getOnyxData({
            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
            waitForCollectionCallback: false,
            callback: (errors) => {
                expect(errors?.memberErrors?.[email]).toBeFalsy();
                expect(errors?.memberErrors?.[optimisticAccountID]).toBeFalsy();
            },
        });

        await TestHelper.getOnyxData({
            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
            waitForCollectionCallback: false,
            callback: (domain) => {
                const securityGroup = domain?.[DOMAIN_SECURITY_GROUP as keyof typeof domain] as {shared?: Record<number, string>} | undefined;
                expect(securityGroup?.shared?.[optimisticAccountID]).toBeFalsy();
            },
        });
    });

    describe('closeUserAccount', () => {
        it('closeUserAccount - sends DELETE_DOMAIN_MEMBER API request with correct data', () => {
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const domainAccountID = 123;
            const domainName = 'test.com';
            const accountID = 456;
            const targetEmail = 'user@test.com';
            const securityGroupKey = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1` as const;

            const securityGroupsData: UserSecurityGroupData = {
                key: securityGroupKey,
                securityGroup: {
                    shared: {
                        [accountID]: 'read',
                    },
                },
            };

            closeUserAccount(domainAccountID, domainName, targetEmail, securityGroupsData);

            expect(apiWriteSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_DOMAIN_MEMBER,
                {domain: domainName, targetEmail, overrideProcessingReports: false},
                {
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                            value: {member: {[targetEmail]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                            value: {memberErrors: {[targetEmail]: null}},
                        }),
                    ]),
                    successData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                            value: {member: {[targetEmail]: null}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                            value: {memberErrors: {[targetEmail]: null}},
                        }),
                    ]),
                    failureData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            value: {memberErrors: {[targetEmail]: expect.any(Object)}},
                        }),
                        // This restores the user to the security group if the API call fails
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                            value: {[securityGroupKey]: {shared: {[accountID]: 'read'}}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                            value: {member: {[targetEmail]: null}},
                        }),
                    ]),
                },
            );

            apiWriteSpy.mockRestore();
        });

        it('closeUserAccount - handles overrideProcessingReports flag', () => {
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const domainAccountID = 123;
            const domainName = 'test.com';
            const targetEmail = 'user@test.com';

            closeUserAccount(domainAccountID, domainName, targetEmail, undefined, true);

            expect(apiWriteSpy).toHaveBeenCalledWith(WRITE_COMMANDS.DELETE_DOMAIN_MEMBER, {domain: domainName, targetEmail, overrideProcessingReports: true}, expect.any(Object));

            apiWriteSpy.mockRestore();
        });
    });

    describe('setDomainVacationDelegate', () => {
        it('sends SET_VACATION_DELEGATE request with ADD pending action when no existing delegate', () => {
            const apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve());
            const domainAccountID = 123;
            const domainMemberAccountID = 456;
            const creator = 'admin@test.com';
            const vacationer = 'vacationer@test.com';
            const delegate = 'delegate@test.com';
            const PRIVATE_VACATION_DELEGATE_KEY = `${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${domainMemberAccountID}`;

            setDomainVacationDelegate(domainAccountID, domainMemberAccountID, creator, vacationer, delegate);

            expect(apiSideEffectSpy).toHaveBeenCalledWith(
                SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE,
                {creator, vacationerEmail: vacationer, vacationDelegateEmail: delegate, overridePolicyDiffWarning: true, domainAccountID},
                {
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                            value: {[PRIVATE_VACATION_DELEGATE_KEY]: {delegate, creator, previousDelegate: undefined}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                            value: {member: {[vacationer]: {vacationDelegate: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                            value: {memberErrors: {[vacationer]: {vacationDelegateErrors: null}}},
                        }),
                    ]),
                    successData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                            value: {[PRIVATE_VACATION_DELEGATE_KEY]: {previousDelegate: null}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                            value: {memberErrors: {[vacationer]: {vacationDelegateErrors: null}}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                            value: {member: {[vacationer]: {vacationDelegate: null}}},
                        }),
                    ]),
                    failureData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            value: {memberErrors: {[vacationer]: {vacationDelegateErrors: expect.any(Object)}}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                            value: {member: {[vacationer]: {vacationDelegate: null}}},
                        }),
                    ]),
                },
            );

            apiSideEffectSpy.mockRestore();
        });

        it('uses UPDATE pending action when existing delegate is present', () => {
            const apiSideEffectSpy = jest.spyOn(require('@libs/API'), 'makeRequestWithSideEffects').mockImplementation(() => Promise.resolve());
            const domainAccountID = 123;
            const domainMemberAccountID = 456;
            const creator = 'admin@test.com';
            const vacationer = 'vacationer@test.com';
            const delegate = 'newdelegate@test.com';
            const existingVacationDelegate: BaseVacationDelegate = {delegate: 'olddelegate@test.com'};

            setDomainVacationDelegate(domainAccountID, domainMemberAccountID, creator, vacationer, delegate, existingVacationDelegate);

            expect(apiSideEffectSpy).toHaveBeenCalledWith(
                SIDE_EFFECT_REQUEST_COMMANDS.SET_VACATION_DELEGATE,
                expect.any(Object),
                expect.objectContaining({
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                            value: {member: {[vacationer]: {vacationDelegate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}}},
                        }),
                    ]),
                }),
            );

            apiSideEffectSpy.mockRestore();
        });
    });

    describe('deleteDomainVacationDelegate', () => {
        it('deleteDomainVacationDelegate - sends DELETE_VACATION_DELEGATE request with correct data', () => {
            const apiWriteSpy = jest.spyOn(require('@libs/API'), 'write').mockImplementation(() => Promise.resolve());
            const domainAccountID = 123;
            const domainMemberAccountID = 456;
            const vacationer = 'vacationer@test.com';
            const vacationDelegate: BaseVacationDelegate = {delegate: 'delegate@test.com', creator: 'admin@test.com'};
            const PRIVATE_VACATION_DELEGATE_KEY = `${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${domainMemberAccountID}`;

            deleteDomainVacationDelegate(domainAccountID, domainMemberAccountID, vacationer, vacationDelegate);

            expect(apiWriteSpy).toHaveBeenCalledWith(
                WRITE_COMMANDS.DELETE_VACATION_DELEGATE,
                {vacationerEmail: vacationer, domainAccountID},
                {
                    optimisticData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                            value: {[PRIVATE_VACATION_DELEGATE_KEY]: {creator: null, delegate: null, previousDelegate: vacationDelegate.delegate}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                            value: {member: {[vacationer]: {vacationDelegate: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                            value: {memberErrors: {[vacationer]: {vacationDelegateErrors: null}}},
                        }),
                    ]),
                    successData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                            value: {member: {[vacationer]: {vacationDelegate: null}}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                            value: {memberErrors: {[vacationer]: {vacationDelegateErrors: null}}},
                        }),
                    ]),
                    failureData: expect.arrayContaining([
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                            value: {[PRIVATE_VACATION_DELEGATE_KEY]: vacationDelegate},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                            value: {member: {[vacationer]: {vacationDelegate: null}}},
                        }),
                        expect.objectContaining({
                            key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            value: {memberErrors: {[vacationer]: {vacationDelegateErrors: expect.any(Object)}}},
                        }),
                    ]),
                },
            );

            apiWriteSpy.mockRestore();
        });
    });

    describe('clearVacationDelegateError', () => {
        it('restores the previous delegate and clears errors and pending actions', async () => {
            const domainAccountID = 123;
            const domainMemberAccountID = 456;
            const domainMemberEmail = 'member@test.com';
            const previousDelegate = 'olddelegate@test.com';
            const PRIVATE_VACATION_DELEGATE_KEY = `${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${domainMemberAccountID}`;
            const timestamp = 789;

            await Onyx.set(
                `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}` as const,
                {[PRIVATE_VACATION_DELEGATE_KEY]: {delegate: 'currentdelegate@test.com', creator: 'admin@test.com'}} as PrefixedRecord<
                    typeof CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX,
                    BaseVacationDelegate
                >,
            );
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}` as const, {
                memberErrors: {[domainMemberEmail]: {vacationDelegateErrors: {[timestamp]: 'error'}}},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}` as const, {
                member: {[domainMemberEmail]: {vacationDelegate: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}},
            });

            clearVacationDelegateError(domainAccountID, domainMemberAccountID, domainMemberEmail, previousDelegate);

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                waitForCollectionCallback: false,
                callback: (domain) => {
                    const delegateData = domain?.[PRIVATE_VACATION_DELEGATE_KEY as keyof typeof domain] as BaseVacationDelegate | undefined;
                    expect(delegateData?.delegate).toBe(previousDelegate);
                },
            });
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`,
                waitForCollectionCallback: false,
                callback: (errors) => {
                    expect(errors?.memberErrors?.[domainMemberEmail]?.vacationDelegateErrors).toBeFalsy();
                },
            });
            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`,
                waitForCollectionCallback: false,
                callback: (pendingActions) => {
                    expect(pendingActions?.member?.[domainMemberEmail]?.vacationDelegate).toBeFalsy();
                },
            });
        });

        it('sets delegate to null when no previousDelegate is provided', async () => {
            const domainAccountID = 123;
            const domainMemberAccountID = 456;
            const domainMemberEmail = 'member@test.com';
            const PRIVATE_VACATION_DELEGATE_KEY = `${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${domainMemberAccountID}`;

            await Onyx.set(
                `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}` as const,
                {[PRIVATE_VACATION_DELEGATE_KEY]: {delegate: 'currentdelegate@test.com', creator: 'admin@test.com'}} as PrefixedRecord<
                    typeof CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX,
                    BaseVacationDelegate
                >,
            );

            clearVacationDelegateError(domainAccountID, domainMemberAccountID, domainMemberEmail);

            await TestHelper.getOnyxData({
                key: `${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`,
                waitForCollectionCallback: false,
                callback: (domain) => {
                    const delegateData = domain?.[PRIVATE_VACATION_DELEGATE_KEY as keyof typeof domain] as BaseVacationDelegate | undefined;
                    expect(delegateData?.delegate).toBeFalsy();
                },
            });
        });
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
            member: {
                [email]: {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
            },
        });

        clearDomainMemberError(domainAccountID, accountID, email, '');

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
                expect(pendingActions?.member?.[email]).toBeFalsy();
            },
        });
    });
});
