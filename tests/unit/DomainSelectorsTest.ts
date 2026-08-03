import CONST from '@src/CONST';
import type {CardFeeds, Domain, DomainErrors, DomainPendingActions, DomainSecurityGroup, DomainSettings} from '@src/types/onyx';
import type {BaseVacationDelegate} from '@src/types/onyx/VacationDelegate';

import type {OnyxEntry} from 'react-native-onyx';

import {
    accountLockSelector,
    adminAccountIDsSelector,
    adminPendingActionSelector,
    defaultSecurityGroupIDSelector,
    domainEmailSelector,
    domainSecurityGroupSettingErrorsSelector,
    domainSecurityGroupSettingPendingActionSelector,
    domainSettingsPrimaryContactSelector,
    groupsSelector,
    isAdminSelector,
    isSecurityGroupEntry,
    isSecurityGroupPendingDeleteSelector,
    memberAccountIDsSelector,
    selectRestrictedPrimaryPolicyID,
    selectSecurityGroupForAccount,
    technicalContactSettingsSelector,
    vacationDelegateSelector,
} from '@selectors/Domain';

const domainDefaultSecurityGroupIDKey = 'domain_defaultSecurityGroupID' as const;

const domainFixture: Domain = {
    validated: true,
    accountID: 1,
    email: 'test@example.com',
    [domainDefaultSecurityGroupIDKey]: '',
};

const cardFeedsFixture: CardFeeds = {settings: {}};
const domainSettingsFixture: DomainSettings = {settings: {}};
const domainPendingActionsFixture: DomainPendingActions = {};
const domainErrorsFixture: DomainErrors = {errors: {}};
const domainSecurityGroupFixture: DomainSecurityGroup = {
    enableRestrictedPrimaryLogin: false,
    enableRestrictedPolicyCreation: false,
    shared: {},
};

type DomainFixtureOptions = {
    admins?: Array<[string, number]>;
    boundaryEntries?: Record<string, unknown>;
    defaultSecurityGroupID?: string;
    email?: string;
    empty?: boolean;
    lockedAccounts?: Record<number, boolean>;
    omitDefaultSecurityGroupID?: boolean;
    securityGroups?: Array<[string, DomainSecurityGroup]>;
    vacationDelegates?: Record<number, BaseVacationDelegate>;
};

const createFixture = <T extends Record<string, unknown>>(fixture: T, overrides: Partial<T> = {}): T => ({...fixture, ...overrides});

const createDomainFixture = (options: DomainFixtureOptions = {}): Domain => {
    const fixture = {...domainFixture};

    if (options.empty) {
        for (const key of Reflect.ownKeys(fixture)) {
            Reflect.deleteProperty(fixture, key);
        }
    }

    if (options.email !== undefined) {
        fixture.email = options.email;
    }
    if (options.defaultSecurityGroupID !== undefined) {
        fixture.domain_defaultSecurityGroupID = options.defaultSecurityGroupID;
    }
    if (options.omitDefaultSecurityGroupID) {
        Reflect.deleteProperty(fixture, domainDefaultSecurityGroupIDKey);
    }

    for (const [id, accountID] of options.admins ?? []) {
        Reflect.set(fixture, `${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}${id}`, accountID);
    }
    for (const [id, securityGroup] of options.securityGroups ?? []) {
        Reflect.set(fixture, `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}${id}`, securityGroup);
    }
    for (const [accountID, vacationDelegate] of Object.entries(options.vacationDelegates ?? {})) {
        Reflect.set(fixture, `${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${accountID}`, vacationDelegate);
    }
    for (const [accountID, locked] of Object.entries(options.lockedAccounts ?? {})) {
        Reflect.set(fixture, `${CONST.DOMAIN.PRIVATE_LOCKED_ACCOUNT_PREFIX}${accountID}`, locked);
    }
    for (const [key, value] of Object.entries(options.boundaryEntries ?? {})) {
        Reflect.set(fixture, key, value);
    }

    return fixture;
};

describe('domainSelectors', () => {
    const userID1 = 123;
    const userID2 = 456;
    describe('adminAccountIDsSelector', () => {
        it('Should return an empty array if the domain object is undefined', () => {
            expect(adminAccountIDsSelector(undefined)).toEqual([]);
        });

        it('Should return an array of admin IDs when keys start with the admin access prefix', () => {
            const domain = createDomainFixture({
                admins: [
                    ['123', 321],
                    ['321', 123],
                ],
            });

            expect(adminAccountIDsSelector(domain)).toEqual([321, 123]);
        });

        it('Should ignore keys that do not start with the admin access prefix', () => {
            const domain = createDomainFixture({
                admins: [['123', 321]],
                boundaryEntries: {somOtherProperty: 'value'},
            });

            expect(adminAccountIDsSelector(domain)).toEqual([321]);
        });

        it('Should ignore keys with falsy values even if they have the correct prefix', () => {
            const domain = createDomainFixture({
                admins: [['123', 123]],
                boundaryEntries: {
                    [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: undefined,
                    [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}999`]: null,
                },
            });

            expect(adminAccountIDsSelector(domain)).toEqual([123]);
        });

        it('Should return an empty array if the domain object is empty', () => {
            const domain = createDomainFixture({empty: true});
            expect(adminAccountIDsSelector(domain)).toEqual([]);
        });
    });

    describe('technicalContactSettingsSelector', () => {
        it('Should return undefined values if the domain object is undefined', () => {
            expect(technicalContactSettingsSelector(undefined)).toEqual({
                technicalContactEmail: undefined,
                useTechnicalContactBillingCard: undefined,
            });
        });

        it('Should return undefined values if shared NVP is empty', () => {
            const domainMemberSharedNVP = createFixture(cardFeedsFixture);
            Reflect.deleteProperty(domainMemberSharedNVP, 'settings');

            expect(technicalContactSettingsSelector(domainMemberSharedNVP)).toEqual({
                technicalContactEmail: undefined,
                useTechnicalContactBillingCard: undefined,
            });
        });

        it('Should return technical contact settings when present', () => {
            const domainMemberSharedNVP = createFixture(cardFeedsFixture, {
                settings: {
                    technicalContactEmail: 'tech@example.com',
                    useTechnicalContactBillingCard: true,
                },
            });

            expect(technicalContactSettingsSelector(domainMemberSharedNVP)).toEqual({
                technicalContactEmail: 'tech@example.com',
                useTechnicalContactBillingCard: true,
            });
        });

        it('Should handle partial settings correctly', () => {
            const domainMemberSharedNVP = createFixture(cardFeedsFixture, {
                settings: {
                    technicalContactEmail: 'tech@example.com',
                },
            });

            expect(technicalContactSettingsSelector(domainMemberSharedNVP)).toEqual({
                technicalContactEmail: 'tech@example.com',
                useTechnicalContactBillingCard: undefined,
            });
        });

        it('Should return undefined values if settings are empty', () => {
            const domainMemberSharedNVP = createFixture(cardFeedsFixture, {
                settings: {},
            });

            expect(technicalContactSettingsSelector(domainMemberSharedNVP)).toEqual({
                technicalContactEmail: undefined,
                useTechnicalContactBillingCard: undefined,
            });
        });
    });

    describe('domainEmailSelector', () => {
        it('Should return the email when it exists in the domain object', () => {
            const domain = createDomainFixture({email: '+@expensify.com'});

            expect(domainEmailSelector(domain)).toBe('+@expensify.com');
        });

        it('Should return undefined if the domain object is undefined', () => {
            expect(domainEmailSelector(undefined)).toBeUndefined();
        });

        it('Should return undefined if the email property is missing', () => {
            const domain = createDomainFixture({empty: true});

            expect(domainEmailSelector(domain)).toBeUndefined();
        });
    });

    describe('domainSettingsPrimaryContactSelector', () => {
        const domainSettingsWithoutSettings = createFixture(domainSettingsFixture);
        Reflect.deleteProperty(domainSettingsWithoutSettings, 'settings');

        it.each([
            ['undefined', undefined, undefined],
            ['empty object', domainSettingsWithoutSettings, undefined],
            ['settings without technicalContactEmail', createFixture(domainSettingsFixture), undefined],
        ])('Should return undefined when domainSettings is %s', (_description, domainSettings, expected) => {
            expect(domainSettingsPrimaryContactSelector(domainSettings)).toBe(expected);
        });

        it('Should return the technical contact email when it exists', () => {
            const domainSettings = createFixture(domainSettingsFixture, {
                settings: {
                    technicalContactEmail: 'admin@example.com',
                },
            });

            expect(domainSettingsPrimaryContactSelector(domainSettings)).toBe('admin@example.com');
        });
    });

    describe('adminPendingActionSelector', () => {
        it.each([
            ['undefined', undefined, {}],
            ['empty object', createFixture(domainPendingActionsFixture), {}],
        ])('Should return empty object when pendingAction is %s', (_description, pendingAction, expected) => {
            expect(adminPendingActionSelector(pendingAction)).toEqual(expected);
        });

        it('Should return the admin pending actions when they exist', () => {
            const pendingAction: OnyxEntry<DomainPendingActions> = {
                admin: {
                    [userID1]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                    [userID2]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                },
            };

            expect(adminPendingActionSelector(pendingAction)).toEqual({
                [userID1]: {pendingAction: 'update'},
                [userID2]: {pendingAction: 'delete'},
            });
        });
    });
    describe('selectMemberIDs', () => {
        it('Should return an empty array if the domain object is undefined', () => {
            expect(memberAccountIDsSelector(undefined)).toEqual([]);
        });

        it('Should return an empty array if the domain object is empty', () => {
            const domain = createDomainFixture({empty: true});
            expect(memberAccountIDsSelector(domain)).toEqual([]);
        });

        it('Should return member IDs when keys start with the security group prefix', () => {
            const domain = createDomainFixture({
                boundaryEntries: {
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                        shared: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '100': 'value',
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '200': 'value',
                        },
                    },
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}2`]: {
                        shared: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '300': 'value',
                        },
                    },
                },
            });

            expect(memberAccountIDsSelector(domain).sort()).toEqual([100, 200, 300]);
        });

        it('Should return unique member IDs if they appear in multiple security groups', () => {
            const domain = createDomainFixture({
                boundaryEntries: {
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                        shared: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '123': 'value',
                        },
                    },
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}2`]: {
                        shared: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '123': 'value',
                        },
                    },
                },
            });

            expect(memberAccountIDsSelector(domain)).toEqual([123]);
        });

        it('Should ignore keys that do not start with the security group prefix', () => {
            const domain = createDomainFixture({
                boundaryEntries: {
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                        shared: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '456': 'value',
                        },
                    },
                    someOtherKey: {
                        shared: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '789': 'value',
                        },
                    },
                },
            });

            expect(memberAccountIDsSelector(domain)).toEqual([456]);
        });

        it('Should ignore groups that do not have a shared property', () => {
            const domain = createDomainFixture({
                boundaryEntries: {
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {},
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}2`]: {shared: null},
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}3`]: {
                        shared: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '111': 'value',
                        },
                    },
                },
            });

            expect(memberAccountIDsSelector(domain)).toEqual([111]);
        });

        it('Should filter out members with null or undefined permission values', () => {
            const domain = createDomainFixture({
                boundaryEntries: {
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                        shared: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '100': 'read',
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '200': null,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '300': undefined,
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '400': 'read',
                        },
                    },
                },
            });

            expect(memberAccountIDsSelector(domain).sort()).toEqual([100, 400]);
        });

        it('Should filter out non-numeric shared keys', () => {
            const domain = createDomainFixture({
                boundaryEntries: {
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                        shared: {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '123': 'value',
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            'not-a-number': 'value',
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            '456': 'value',
                        },
                    },
                },
            });

            expect(memberAccountIDsSelector(domain).sort()).toEqual([123, 456]);
        });
    });

    describe('defaultSecurityGroupIDSelector', () => {
        it('Should return the default security group ID when it exists', () => {
            const domain = createDomainFixture({defaultSecurityGroupID: '12345'});

            expect(defaultSecurityGroupIDSelector(domain)).toBe('12345');
        });

        it('Should return undefined if the domain object is undefined', () => {
            expect(defaultSecurityGroupIDSelector(undefined)).toBeUndefined();
        });

        it('Should return undefined if the domain_defaultSecurityGroupID property is missing', () => {
            const domain = createDomainFixture({empty: true});

            expect(defaultSecurityGroupIDSelector(domain)).toBeUndefined();
        });
    });

    describe('selectSecurityGroupForAccount', () => {
        it('Should return undefined when domain has no security groups', () => {
            const domain = createDomainFixture({omitDefaultSecurityGroupID: true});

            const result = selectSecurityGroupForAccount(123)(domain);

            expect(result).toBeUndefined();
        });

        it('Should return undefined when account is not in any security group', () => {
            const securityGroup = createFixture(domainSecurityGroupFixture, {
                enableRestrictedPrimaryLogin: false,
                enableRestrictedPolicyCreation: false,
                shared: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '456': 'read',
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    '789': 'read',
                },
            });

            const domain = createDomainFixture({
                defaultSecurityGroupID: '1',
                securityGroups: [['1', securityGroup]],
            });

            const result = selectSecurityGroupForAccount(123)(domain);

            expect(result).toBeUndefined();
        });

        it('Should return the security group data when account belongs to a group', () => {
            /* eslint-disable @typescript-eslint/naming-convention */
            const group1 = createFixture(domainSecurityGroupFixture, {shared: {'123': 'read', '456': 'read'}, enableRestrictedPrimaryLogin: true, enableRestrictedPolicyCreation: true});
            const group2 = createFixture(domainSecurityGroupFixture, {shared: {'789': 'read'}, enableRestrictedPrimaryLogin: true, enableRestrictedPolicyCreation: true});

            const key1 = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`;

            const domain = createDomainFixture({
                defaultSecurityGroupID: '1',
                securityGroups: [
                    ['1', group1],
                    ['2', group2],
                ],
            });

            const result = selectSecurityGroupForAccount(123)(domain);

            expect(result).toEqual({
                key: key1,
                securityGroup: group1,
            });
        });

        it('Should skip a group whose shared entry for the account is a null tombstone and return the active group', () => {
            // After changeDomainSecurityGroup fires optimistically, the old group gets
            // shared[accountID] = null while the new group gets shared[accountID] = 'read'.
            // The selector must skip the tombstone and return the new (active) group.
            const key2 = `${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}2`;

            const domain = createDomainFixture({
                securityGroups: [
                    ['1', createFixture(domainSecurityGroupFixture, {shared: {'123': null}})],
                    ['2', createFixture(domainSecurityGroupFixture, {shared: {'123': 'read'}})],
                ],
            });

            const result = selectSecurityGroupForAccount(123)(domain);

            expect(result?.key).toBe(key2);
        });

        it('Should return undefined when the only matching shared entry is a null tombstone', () => {
            const domain = createDomainFixture({
                securityGroups: [['1', createFixture(domainSecurityGroupFixture, {shared: {'123': null}})]],
            });

            expect(selectSecurityGroupForAccount(123)(domain)).toBeUndefined();
        });
    });

    describe('isSecurityGroupEntry', () => {
        it('should return true for a valid security group entry', () => {
            const entry: [string, unknown] = [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}123`, {shared: {}}];
            expect(isSecurityGroupEntry(entry)).toBe(true);
        });

        it('should return false if the key does not start with the security group prefix', () => {
            const entry: [string, unknown] = ['invalid_prefix_123', {shared: {}}];
            expect(isSecurityGroupEntry(entry)).toBe(false);
        });

        it('should return false if the value is not an object', () => {
            const entry: [string, unknown] = [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}123`, 'not an object'];
            expect(isSecurityGroupEntry(entry)).toBe(false);
        });

        it('should return false if the value is null', () => {
            const entry: [string, unknown] = [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}123`, null];
            expect(isSecurityGroupEntry(entry)).toBe(false);
        });

        it('should return false if the value does not have a "shared" property', () => {
            const entry: [string, unknown] = [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}123`, {other: {}}];
            expect(isSecurityGroupEntry(entry)).toBe(false);
        });
    });

    describe('domainSecurityGroupSettingPendingActionSelector', () => {
        it('Should return undefined when domainPendingActions is undefined', () => {
            expect(domainSecurityGroupSettingPendingActionSelector('name', '1')(undefined)).toBeUndefined();
        });

        it('Should return undefined when domainPendingActions is empty', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture);
            expect(domainSecurityGroupSettingPendingActionSelector('name', '1')(domainPendingActions)).toBeUndefined();
        });

        it('Should return undefined when groupID is undefined', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            });
            expect(domainSecurityGroupSettingPendingActionSelector('name', undefined)(domainPendingActions)).toBeUndefined();
        });

        it('Should return undefined when the group key does not exist in domainPendingActions', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            });
            expect(domainSecurityGroupSettingPendingActionSelector('name', '999')(domainPendingActions)).toBeUndefined();
        });

        it('Should return the pending action for the given groupID', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}42`]: {
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            });
            expect(domainSecurityGroupSettingPendingActionSelector('name', '42')(domainPendingActions)).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
        });

        it('Should return the correct pending action when multiple groups are present', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}2`]: {
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            });
            expect(domainSecurityGroupSettingPendingActionSelector('name', '1')(domainPendingActions)).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
            expect(domainSecurityGroupSettingPendingActionSelector('name', '2')(domainPendingActions)).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        });
    });

    describe('domainSecurityGroupSettingErrorsSelector', () => {
        it('Should return undefined when domainErrors is undefined', () => {
            expect(domainSecurityGroupSettingErrorsSelector('nameErrors', '1')(undefined)).toBeUndefined();
        });

        it('Should return undefined when domainErrors is empty', () => {
            const domainErrors = createFixture(domainErrorsFixture);
            Reflect.deleteProperty(domainErrors, 'errors');
            expect(domainSecurityGroupSettingErrorsSelector('nameErrors', '1')(domainErrors)).toBeUndefined();
        });

        it('Should return undefined when groupID is undefined', () => {
            const domainErrors = createFixture(domainErrorsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    nameErrors: {errorMessage: 'some error'},
                },
            });
            expect(domainSecurityGroupSettingErrorsSelector('nameErrors', undefined)(domainErrors)).toBeUndefined();
        });

        it('Should return undefined when the group key does not exist in domainErrors', () => {
            const domainErrors = createFixture(domainErrorsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    nameErrors: {errorMessage: 'some error'},
                },
            });
            expect(domainSecurityGroupSettingErrorsSelector('nameErrors', '999')(domainErrors)).toBeUndefined();
        });

        it('Should return the errors for the given groupID', () => {
            const errors = {errorMessage: 'failed to update'};
            const domainErrors = createFixture(domainErrorsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}42`]: {
                    nameErrors: errors,
                },
            });
            expect(domainSecurityGroupSettingErrorsSelector('nameErrors', '42')(domainErrors)).toEqual(errors);
        });

        it('Should return the correct errors when multiple groups are present', () => {
            const errors1 = {errorMessage: 'error for group 1'};
            const errors2 = {errorMessage: 'error for group 2'};
            const domainErrors = createFixture(domainErrorsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    nameErrors: errors1,
                },
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}2`]: {
                    nameErrors: errors2,
                },
            });
            expect(domainSecurityGroupSettingErrorsSelector('nameErrors', '1')(domainErrors)).toEqual(errors1);
            expect(domainSecurityGroupSettingErrorsSelector('nameErrors', '2')(domainErrors)).toEqual(errors2);
        });
    });

    describe('isSecurityGroupPendingDeleteSelector', () => {
        it('Should return false when domainPendingActions is undefined', () => {
            expect(isSecurityGroupPendingDeleteSelector('1')(undefined)).toBe(false);
        });

        it('Should return false when domainPendingActions is empty', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture);
            expect(isSecurityGroupPendingDeleteSelector('1')(domainPendingActions)).toBe(false);
        });

        it('Should return false when groupID is undefined', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            });
            expect(isSecurityGroupPendingDeleteSelector(undefined)(domainPendingActions)).toBe(false);
        });

        it('Should return false when the group key does not exist in domainPendingActions', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            });
            expect(isSecurityGroupPendingDeleteSelector('999')(domainPendingActions)).toBe(false);
        });

        it('Should return false when the group has only non-delete pending actions', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    createGroup: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            });
            expect(isSecurityGroupPendingDeleteSelector('1')(domainPendingActions)).toBe(false);
        });

        it('Should return true when the group has a top-level delete pending action', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    deleteGroup: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            });
            expect(isSecurityGroupPendingDeleteSelector('1')(domainPendingActions)).toBe(true);
        });

        it('Should return true when at least one field-level pending action is delete', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    enableStrictPolicyRules: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            });
            expect(isSecurityGroupPendingDeleteSelector('1')(domainPendingActions)).toBe(true);
        });

        it('Should distinguish between groups when multiple are present', () => {
            const domainPendingActions = createFixture(domainPendingActionsFixture, {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {
                    name: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}2`]: {
                    deleteGroup: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            });
            expect(isSecurityGroupPendingDeleteSelector('1')(domainPendingActions)).toBe(false);
            expect(isSecurityGroupPendingDeleteSelector('2')(domainPendingActions)).toBe(true);
        });
    });

    describe('groupsSelector', () => {
        it('Should return an empty array if the domain object is undefined', () => {
            expect(groupsSelector(undefined)).toEqual([]);
        });

        it('Should return an empty array if the domain object is empty', () => {
            const domain = createDomainFixture({empty: true});
            expect(groupsSelector(domain)).toEqual([]);
        });

        it('Should return an array of groups when keys start with the security group prefix', () => {
            const domain = createDomainFixture({
                boundaryEntries: {
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}123`]: {name: 'Group 1', shared: {}},
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}456`]: {name: 'Group 2', shared: {}},
                },
            });

            const expectedGroups = [
                {id: '123', details: {name: 'Group 1', shared: {}}},
                {id: '456', details: {name: 'Group 2', shared: {}}},
            ];

            expect(groupsSelector(domain)).toEqual(expectedGroups);
        });

        it('Should ignore keys that do not start with the security group prefix', () => {
            const domain = createDomainFixture({
                boundaryEntries: {
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}123`]: {name: 'Group 1', shared: {}},
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}456`]: {name: 'Group 2', shared: null},
                    [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}789`]: {name: 'Group 3'},
                    otherKey: 'value',
                },
            });

            const expectedGroups = [{id: '123', details: {name: 'Group 1', shared: {}}}];

            expect(groupsSelector(domain)).toEqual(expectedGroups);
        });
    });
    describe('vacationDelegateSelector', () => {
        it('Should return undefined if domain is undefined', () => {
            const selector = vacationDelegateSelector(userID1);
            expect(selector(undefined)).toBeUndefined();
        });

        it('Should return the vacation delegate for a specific accountID', () => {
            const vacationDelegate: BaseVacationDelegate = {
                delegate: 'delegate@example.com',
                creator: 'creator@example.com',
            };

            const domain = createDomainFixture({vacationDelegates: {[userID1]: vacationDelegate}});

            const selector = vacationDelegateSelector(userID1);
            expect(selector(domain)).toEqual(vacationDelegate);
        });

        it('Should return undefined if the vacation delegate for a specific accountID does not exist', () => {
            const domain = createDomainFixture({vacationDelegates: {[userID2]: {delegate: 'other@example.com'}}});

            const selector = vacationDelegateSelector(userID1);
            expect(selector(domain)).toBeUndefined();
        });

        it('Should return the vacation delegate when it exists but has no properties', () => {
            const domain = createDomainFixture({vacationDelegates: {[userID1]: {}}});

            const selector = vacationDelegateSelector(userID1);
            expect(selector(domain)).toEqual({});
        });

        it('Should return the vacation delegate when only some fields are present', () => {
            const domain = createDomainFixture({vacationDelegates: {[userID1]: {delegate: 'delegate@example.com'}}});

            const selector = vacationDelegateSelector(userID1);
            expect(selector(domain)).toEqual({
                delegate: 'delegate@example.com',
            });
        });

        it('Should ignore keys that do not start with the vacation delegate prefix', () => {
            const domain = createDomainFixture({boundaryEntries: {private_otherPrefix_123: {delegate: 'wrong@example.com'}}});

            const selector = vacationDelegateSelector(userID1);
            expect(selector(domain)).toBeUndefined();
        });

        it('Should not be affected by other vacation delegate entries with different accountIDs', () => {
            const domain = createDomainFixture({vacationDelegates: {[userID2]: {delegate: 'delegate@example.com'}}});

            const selector = vacationDelegateSelector(userID1);
            expect(selector(domain)).toBeUndefined();
        });
    });

    describe('isAdminSelector', () => {
        it('Should return false if domain is undefined', () => {
            expect(isAdminSelector(userID1)(undefined)).toBe(false);
        });

        it('Should return false if accountID is 0', () => {
            const domain = createDomainFixture({admins: [['123456', userID1]]});
            expect(isAdminSelector(0)(domain)).toBe(false);
        });

        it('Should return true if the accountID is found in admin permission entries', () => {
            const domain = createDomainFixture({
                admins: [
                    ['123456', userID1],
                    ['789101', userID2],
                ],
            });

            expect(isAdminSelector(userID1)(domain)).toBe(true);
            expect(isAdminSelector(userID2)(domain)).toBe(true);
        });

        it('Should return false if the accountID is not in any admin permission entries', () => {
            const domain = createDomainFixture({admins: [['123456', userID1]]});

            expect(isAdminSelector(999)(domain)).toBe(false);
        });

        it('Should ignore null/undefined admin permission values', () => {
            const domain = createDomainFixture({
                boundaryEntries: {
                    [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}123456`]: null,
                    [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}789101`]: undefined,
                },
            });

            expect(isAdminSelector(userID1)(domain)).toBe(false);
        });

        it('Should return false for empty domain object', () => {
            const domain = createDomainFixture({empty: true});
            expect(isAdminSelector(userID1)(domain)).toBe(false);
        });
    });

    describe('accountLockSelector', () => {
        it('Should return lock state for the given account ID', () => {
            const accountID = 123;
            const domain = createDomainFixture({lockedAccounts: {[accountID]: true}});

            expect(accountLockSelector(accountID)(domain)).toBe(true);
        });

        it('Should return false when the lock state is false', () => {
            const accountID = 123;
            const domain = createDomainFixture({lockedAccounts: {[accountID]: false}});

            expect(accountLockSelector(accountID)(domain)).toBe(false);
        });

        it('Should return undefined when the domain object is undefined or account key does not exist', () => {
            const accountID = 123;
            const domain = createDomainFixture({empty: true});

            expect(accountLockSelector(accountID)(undefined)).toBeUndefined();
            expect(accountLockSelector(accountID)(domain)).toBeUndefined();
        });
    });

    describe('selectRestrictedPrimaryPolicyID', () => {
        const makeGroup = (enableRestrictedPrimaryPolicy: boolean, restrictedPrimaryPolicyID?: string): DomainSecurityGroup =>
            createFixture(domainSecurityGroupFixture, {enableRestrictedPrimaryPolicy, restrictedPrimaryPolicyID});

        const makeDomain = (groups: Record<string, DomainSecurityGroup>): OnyxEntry<Domain> => createDomainFixture({securityGroups: Object.entries(groups)});

        it('returns undefined when domain is undefined', () => {
            expect(selectRestrictedPrimaryPolicyID('g1')(undefined)).toBeUndefined();
        });

        it('returns undefined when groupID is undefined', () => {
            const domain = makeDomain({g1: makeGroup(true, 'p1')});
            expect(selectRestrictedPrimaryPolicyID(undefined)(domain)).toBeUndefined();
        });

        it('returns undefined when the group does not exist', () => {
            const domain = makeDomain({g1: makeGroup(true, 'p1')});
            expect(selectRestrictedPrimaryPolicyID('missing')(domain)).toBeUndefined();
        });

        it('returns undefined when enableRestrictedPrimaryPolicy is false', () => {
            const domain = makeDomain({g1: makeGroup(false, 'p1')});
            expect(selectRestrictedPrimaryPolicyID('g1')(domain)).toBeUndefined();
        });

        it('returns undefined when restrictedPrimaryPolicyID is not set', () => {
            const domain = makeDomain({g1: makeGroup(true, undefined)});
            expect(selectRestrictedPrimaryPolicyID('g1')(domain)).toBeUndefined();
        });

        it('returns the policyID when the group has restriction enabled', () => {
            const domain = makeDomain({g1: makeGroup(true, 'p42')});
            expect(selectRestrictedPrimaryPolicyID('g1')(domain)).toBe('p42');
        });

        it('returns the correct policyID when multiple groups exist', () => {
            const domain = makeDomain({
                g1: makeGroup(true, 'pA'),
                g2: makeGroup(true, 'pB'),
            });
            expect(selectRestrictedPrimaryPolicyID('g2')(domain)).toBe('pB');
        });
    });
});
