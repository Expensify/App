import groupFieldsIntoPages, {CONFIRMATION_PAGE_SLUG} from '@components/DynamicForm/utils/groupFieldsIntoPages';

import type {DynamicFormField} from '@src/types/onyx';

describe('groupFieldsIntoPages', () => {
    it('makes one page per group, in the order the groups first appear', () => {
        // Given fields of two groups, interleaved
        const fields: DynamicFormField[] = [
            {key: 'firstName', type: 'text', required: true, group: 'Personal details'},
            {key: 'companyName', type: 'text', required: true, group: 'Business'},
            {key: 'lastName', type: 'text', required: true, group: 'Personal details'},
        ];

        // When they are grouped
        const groups = groupFieldsIntoPages(fields);

        // Then each group is one page holding its fields, in first-appearance order
        expect(groups.map((group) => [group.slug, group.fields.map((field) => field.key)])).toEqual([
            ['personal-details', ['firstName', 'lastName']],
            ['business', ['companyName']],
        ]);
    });

    it('keeps slugs unique and away from the confirmation page', () => {
        // Given groups whose names reduce to the same slug, one of them the confirmation page's
        const fields: DynamicFormField[] = [
            {key: 'a', type: 'text', required: true, group: 'Confirm'},
            {key: 'b', type: 'text', required: true, group: 'Business info'},
            {key: 'c', type: 'text', required: true, group: 'Business, info'},
            {key: 'd', type: 'text', required: true},
        ];

        // When they are grouped
        const slugs = groupFieldsIntoPages(fields).map((group) => group.slug);

        // Then every slug is unique, none is the confirmation page's, and a field without a group gets a numbered page
        expect(slugs).toEqual(['confirm-2', 'business-info', 'business-info-2', 'page-4']);
        expect(slugs).not.toContain(CONFIRMATION_PAGE_SLUG);
    });
});
