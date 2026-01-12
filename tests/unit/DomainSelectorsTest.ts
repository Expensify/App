import {adminAccountIDsSelector, adminPendingActionSelector, domainEmailSelector, domainSettingsPrimaryContactSelector, technicalContactSettingsSelector} from '@selectors/Domain';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, Domain, DomainPendingActions, DomainSettings} from '@src/types/onyx';

describe('domainSelectors', () => {
    const userID1 = 123;
    const userID2 = 456;
    describe('adminAccountIDsSelector', () => {
        it('Should return an empty array if the domain object is undefined', () => {
            expect(adminAccountIDsSelector(undefined)).toEqual([]);
        });

        it('Should return an array of admin IDs when keys start with the admin access prefix', () => {
            const domain = {
                [`${ONYXKEYS.COLLECTION.EXPENSIFY_ADMIN_ACCESS_PREFIX}123`]: 321,
                [`${ONYXKEYS.COLLECTION.EXPENSIFY_ADMIN_ACCESS_PREFIX}321`]: 123,
            } as unknown as OnyxEntry<Domain>;

            expect(adminAccountIDsSelector(domain)).toEqual([321, 123]);
        });

        it('Should ignore keys that do not start with the admin access prefix', () => {
            const domain = {
                [`${ONYXKEYS.COLLECTION.EXPENSIFY_ADMIN_ACCESS_PREFIX}123`]: 321,
                somOtherProperty: 'value',
            } as unknown as OnyxEntry<Domain>;

            expect(adminAccountIDsSelector(domain)).toEqual([321]);
        });

        it('Should ignore keys with falsy values even if they have the correct prefix', () => {
            const domain = {
                [`${ONYXKEYS.COLLECTION.EXPENSIFY_ADMIN_ACCESS_PREFIX}123`]: 123,
                [`${ONYXKEYS.COLLECTION.EXPENSIFY_ADMIN_ACCESS_PREFIX}0`]: undefined,
                [`${ONYXKEYS.COLLECTION.EXPENSIFY_ADMIN_ACCESS_PREFIX}999`]: null,
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

    describe('domainSettingsPrimaryContactSelector', () => {
        it.each([
            ['undefined', undefined, undefined],
            ['empty object', {} as OnyxEntry<DomainSettings>, undefined],
            ['settings without technicalContactEmail', {settings: {}} as OnyxEntry<DomainSettings>, undefined],
        ])('Should return undefined when domainSettings is %s', (_description, domainSettings, expected) => {
            expect(domainSettingsPrimaryContactSelector(domainSettings)).toBe(expected);
        });

        it('Should return the technical contact email when it exists', () => {
            const domainSettings = {
                settings: {
                    technicalContactEmail: 'admin@example.com',
                },
            } as OnyxEntry<DomainSettings>;

            expect(domainSettingsPrimaryContactSelector(domainSettings)).toBe('admin@example.com');
        });
    });

    describe('adminPendingActionSelector', () => {
        it.each([
            ['undefined', undefined, {}],
            ['empty object', {} as OnyxEntry<DomainPendingActions>, {}],
        ])('Should return empty object when pendingAction is %s', (_description, pendingAction, expected) => {
            expect(adminPendingActionSelector(pendingAction)).toEqual(expected);
        });

        it('Should return the admin pending actions when they exist', () => {
            const pendingAction: OnyxEntry<DomainPendingActions> = {
                admin: {
                    [userID1]: {pendingAction: 'update'},
                    [userID2]: {pendingAction: 'delete'},
                },
            };

            expect(adminPendingActionSelector(pendingAction)).toEqual({
                [userID1]: {pendingAction: 'update'},
                [userID2]: {pendingAction: 'delete'},
            });
        });
    });
});
