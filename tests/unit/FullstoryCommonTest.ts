/* eslint-disable @typescript-eslint/naming-convention -- Test assertions use FullStory's external snake_case keys. */
import {normalizeFullstoryPropertiesForNative} from '@src/libs/Fullstory/common';

describe('FullstoryCommon', () => {
    it('normalizes FullStory properties for native V1 APIs', () => {
        const freeTrialEndDate = new Date('2099-05-31T23:59:59Z');

        expect(
            normalizeFullstoryPropertiesForNative(
                {
                    account_type: 'business',
                    workspace_count: 3,
                    paid_member: true,
                    free_trial_end_date: freeTrialEndDate,
                    displayName: 'Jane Doe',
                    email: 'jane@example.com',
                    optional_value: undefined,
                },
                {
                    preserveKeys: ['displayName', 'email'],
                },
            ),
        ).toEqual({
            account_type_str: 'business',
            workspace_count_real: 3,
            paid_member_bool: true,
            free_trial_end_date_date: freeTrialEndDate.toISOString(),
            displayName: 'Jane Doe',
            email: 'jane@example.com',
        });
    });
});
