import summarizeListItem, {getListItemFallbackTitle} from '@components/DynamicForm/utils/summarizeListItem';

import type {DynamicFormField} from '@src/types/onyx';

import {translateLocal} from '../../../utils/TestHelper';

describe('summarizeListItem', () => {
    it('names an entry by its leading text answers and describes it with up to two short ones', () => {
        // Given an owner with a name, an SSN, a date of birth and three short answers
        const itemFields: DynamicFormField[] = [
            {key: 'firstName', type: 'text', required: true},
            {key: 'lastName', type: 'text', required: true},
            {key: 'ssn', type: 'text', required: true, sensitive: true},
            {key: 'dateOfBirth', type: 'date', required: true},
            {key: 'ownership', type: 'percent', required: true},
            {key: 'role', type: 'select', required: true, values: [{key: 'CEO', label: 'Chief executive'}]},
            {key: 'title', type: 'text', required: false},
        ];
        const owner = {id: 'jane', firstName: 'Jane', lastName: 'Doe', ssn: '123456789', dateOfBirth: '1980-04-19', ownership: '40', role: 'CEO', title: 'Founder'};

        // When the entry is summarized
        const summary = summarizeListItem(owner, itemFields, translateLocal, 'Owner');

        // Then the name is the title, and the description holds the first two short answers, leaving out the SSN and the long date
        expect(summary).toEqual({title: 'Jane Doe', description: '40%, Chief executive'});
    });

    it('names an entry without text answers by its first answer', () => {
        // Given an entry holding only a choice
        const itemFields: DynamicFormField[] = [{key: 'role', type: 'select', required: true, values: [{key: 'CEO', label: 'Chief executive'}]}];

        // When it is summarized
        const summary = summarizeListItem({id: 'one', role: 'CEO'}, itemFields, translateLocal, 'Owner');

        // Then the choice names the row, so it is never left without a title
        expect(summary).toEqual({title: 'Chief executive', description: ''});
    });

    it('names an entry whose shown answers are all sensitive by the fallback title', () => {
        // Given an entry whose only answer is sensitive
        const itemFields: DynamicFormField[] = [{key: 'ssn', type: 'text', required: true, sensitive: true}];

        // When it is summarized
        const summary = summarizeListItem({id: 'one', ssn: '123456789'}, itemFields, translateLocal, 'Owner');

        // Then the fallback names the row, so its row and its Edit and Remove labels are never blank
        expect(summary).toEqual({title: 'Owner', description: ''});
    });

    it('leaves out answers the entry now hides', () => {
        // Given a company entry still holding the name it had while it was an individual
        const itemFields: DynamicFormField[] = [
            {
                key: 'ownerType',
                type: 'select',
                required: true,
                values: [
                    {key: 'INDIVIDUAL', label: 'Individual'},
                    {key: 'COMPANY', label: 'Company'},
                ],
            },
            {key: 'firstName', type: 'text', required: true, showWhen: {key: 'ownerType', equals: ['INDIVIDUAL']}},
            {key: 'companyName', type: 'text', required: true, showWhen: {key: 'ownerType', equals: ['COMPANY']}},
        ];

        // When it is summarized
        const summary = summarizeListItem({id: 'acme', ownerType: 'COMPANY', firstName: 'Jane', companyName: 'Acme'}, itemFields, translateLocal, 'Owner');

        // Then the hidden name is ignored, as validation and submission ignore it
        expect(summary).toEqual({title: 'Acme', description: 'Company'});
    });

    it('numbers the fallback name of an entry, so two unnamed entries sound different', () => {
        // Given a list of owners whose second entry holds only sensitive answers
        const owners: DynamicFormField = {key: 'owners', type: 'list', required: true, itemLabel: 'owner', itemFields: [{key: 'ssn', type: 'text', required: true, sensitive: true}]};

        // When its fallback name is taken
        const title = getListItemFallbackTitle(owners, 1, translateLocal);

        // Then the noun is capitalized and numbered by the entry's place in the list
        expect(title).toBe(translateLocal('dynamicForm.numberedItem', {item: 'Owner', number: 2}));
    });
});
