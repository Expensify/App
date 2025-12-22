import {adminAccountIDsSelector} from '@selectors/Domain';
import type {OnyxEntry} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain} from '@src/types/onyx';

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
});
