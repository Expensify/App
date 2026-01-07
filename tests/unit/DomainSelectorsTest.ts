import {adminAccountIDsSelector, domainEmailSelector, selectMemberIDs, technicalContactSettingsSelector} from '@selectors/Domain';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {CardFeeds, Domain} from '@src/types/onyx';

describe('domainSelectors', () => {
    describe('adminAccountIDsSelector', () => {
        it('Should return an empty array if the domain object is undefined', () => {
            expect(adminAccountIDsSelector(undefined)).toEqual([]);
        });

        it('Should return an array of admin IDs when keys start with the admin access prefix', () => {
            const domain = {
                [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}123`]: 321,
                [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}321`]: 123,
            } as unknown as OnyxEntry<Domain>;

            expect(adminAccountIDsSelector(domain)).toEqual([321, 123]);
        });

        it('Should ignore keys that do not start with the admin access prefix', () => {
            const domain = {
                [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}123`]: 321,
                somOtherProperty: 'value',
            } as unknown as OnyxEntry<Domain>;

            expect(adminAccountIDsSelector(domain)).toEqual([321]);
        });

        it('Should ignore keys with falsy values even if they have the correct prefix', () => {
            const domain = {
                [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}123`]: 123,
                [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: undefined,
                [`${CONST.DOMAIN.EXPENSIFY_ADMIN_ACCESS_PREFIX}999`]: null,
            } as unknown as OnyxEntry<Domain>;

            expect(adminAccountIDsSelector(domain)).toEqual([123]);
        });

        it('Should return an empty array if the domain object is empty', () => {
            const domain = {} as OnyxEntry<Domain>;
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
            const domainMemberSharedNVP = {} as OnyxEntry<CardFeeds>;

            expect(technicalContactSettingsSelector(domainMemberSharedNVP)).toEqual({
                technicalContactEmail: undefined,
                useTechnicalContactBillingCard: undefined,
            });
        });

        it('Should return technical contact settings when present', () => {
            const domainMemberSharedNVP = {
                settings: {
                    technicalContactEmail: 'tech@example.com',
                    useTechnicalContactBillingCard: true,
                },
            } as OnyxEntry<CardFeeds>;

            expect(technicalContactSettingsSelector(domainMemberSharedNVP)).toEqual({
                technicalContactEmail: 'tech@example.com',
                useTechnicalContactBillingCard: true,
            });
        });

        it('Should handle partial settings correctly', () => {
            const domainMemberSharedNVP = {
                settings: {
                    technicalContactEmail: 'tech@example.com',
                },
            } as OnyxEntry<CardFeeds>;

            expect(technicalContactSettingsSelector(domainMemberSharedNVP)).toEqual({
                technicalContactEmail: 'tech@example.com',
                useTechnicalContactBillingCard: undefined,
            });
        });

        it('Should return undefined values if settings are empty', () => {
            const domainMemberSharedNVP = {
                settings: {},
            } as OnyxEntry<CardFeeds>;

            expect(technicalContactSettingsSelector(domainMemberSharedNVP)).toEqual({
                technicalContactEmail: undefined,
                useTechnicalContactBillingCard: undefined,
            });
        });
    });

    describe('domainEmailSelector', () => {
        it('Should return the email when it exists in the domain object', () => {
            const domain = {
                email: '+@expensify.com',
            } as OnyxEntry<Domain>;

            expect(domainEmailSelector(domain)).toBe('+@expensify.com');
        });

        it('Should return undefined if the domain object is undefined', () => {
            expect(domainEmailSelector(undefined)).toBeUndefined();
        });

        it('Should return undefined if the email property is missing', () => {
            const domain = {} as OnyxEntry<Domain>;

            expect(domainEmailSelector(domain)).toBeUndefined();
        });
    });
    describe('selectMemberIDs', () => {
        it('Should return an empty array if the domain object is undefined', () => {
            expect(selectMemberIDs(undefined)).toEqual([]);
        });

        it('Should return an empty array if the domain object is empty', () => {
            const domain = {} as OnyxEntry<Domain>;
            expect(selectMemberIDs(domain)).toEqual([]);
        });

        it('Should return member IDs when keys start with the security group prefix', () => {
            const domain = {
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
            } as unknown as OnyxEntry<Domain>;

            expect(selectMemberIDs(domain).sort()).toEqual([100, 200, 300]);
        });

        it('Should return unique member IDs if they appear in multiple security groups', () => {
            const domain = {
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
            } as unknown as OnyxEntry<Domain>;

            expect(selectMemberIDs(domain)).toEqual([123]);
        });

        it('Should ignore keys that do not start with the security group prefix', () => {
            const domain = {
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
            } as unknown as OnyxEntry<Domain>;

            expect(selectMemberIDs(domain)).toEqual([456]);
        });

        it('Should ignore groups that do not have a shared property', () => {
            const domain = {
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}1`]: {},
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}2`]: {shared: null},
                [`${CONST.DOMAIN.DOMAIN_SECURITY_GROUP_PREFIX}3`]: {
                    shared: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        '111': 'value',
                    },
                },
            } as unknown as OnyxEntry<Domain>;

            expect(selectMemberIDs(domain)).toEqual([111]);
        });

        it('Should filter out non-numeric shared keys', () => {
            const domain = {
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
            } as unknown as OnyxEntry<Domain>;

            expect(selectMemberIDs(domain).sort()).toEqual([123, 456]);
        });
    });
});
