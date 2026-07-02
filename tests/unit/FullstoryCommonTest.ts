import {normalizeFullstoryPropertiesForNative} from '@src/libs/Fullstory/common';

describe('FullstoryCommon', () => {
    it('normalizes FullStory properties for native V1 APIs', () => {
        expect(
            normalizeFullstoryPropertiesForNative(
                {
                    account_type: 'business',
                    workspace_count: 3,
                    paid_member: true,
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
            displayName: 'Jane Doe',
            email: 'jane@example.com',
        });
    });
});
