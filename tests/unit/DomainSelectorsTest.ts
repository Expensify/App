import {adminAccountIDsSelector, domainEmailSelector, technicalContactSettingsSelector} from '@selectors/Domain';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, Domain} from '@src/types/onyx';

describe('domainSelectors', () => {
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
});
