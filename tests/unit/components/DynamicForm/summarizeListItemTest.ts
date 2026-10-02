import summarizeListItem from '@components/DynamicForm/utils/summarizeListItem';

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
        const summary = summarizeListItem(owner, itemFields, translateLocal);

        // Then the name is the title, and the description holds the first two short answers, leaving out the SSN and the long date
        expect(summary).toEqual({title: 'Jane Doe', description: '40%, Chief executive'});
    });

    it('names an entry without text answers by its first answer', () => {
        // Given an entry holding only a choice
        const itemFields: DynamicFormField[] = [{key: 'role', type: 'select', required: true, values: [{key: 'CEO', label: 'Chief executive'}]}];

        // When it is summarized
        const summary = summarizeListItem({id: 'one', role: 'CEO'}, itemFields, translateLocal);

        // Then the choice names the row, so it is never left without a title
        expect(summary).toEqual({title: 'Chief executive', description: ''});
    });
});
