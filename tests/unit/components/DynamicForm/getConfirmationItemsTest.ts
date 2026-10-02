import getConfirmationItems from '@components/DynamicForm/utils/getConfirmationItems';
import groupFieldsIntoPages from '@components/DynamicForm/utils/groupFieldsIntoPages';

import type {DynamicFormField} from '@src/types/onyx';

import {translateLocal} from '../../../utils/TestHelper';

describe('getConfirmationItems', () => {
    it('lists every visible answer, and opens its page when an editable row is tapped', () => {
        // Given a readonly name on the first page and a hidden and a visible field on the second
        const fields: DynamicFormField[] = [
            {key: 'legalName', label: 'Legal name', type: 'text', required: true, readonly: true, group: 'Business'},
            {key: 'legalType', label: 'Type', type: 'radio', required: true, group: 'Details', values: [{key: 'PRIVATE', label: 'Person'}]},
            {key: 'companyNumber', label: 'Company number', type: 'text', required: true, group: 'Details', showWhen: {key: 'legalType', equals: ['BUSINESS']}},
        ];
        const onEditGroup = jest.fn();

        // When the confirmation rows are built and the type row is tapped
        const items = getConfirmationItems(groupFieldsIntoPages(fields), {legalName: 'Acme Inc', legalType: 'PRIVATE'}, translateLocal, onEditGroup);
        items.at(1)?.onPress();

        // Then the hidden field has no row, the readonly row has no arrow, and tapping the type opens the second page
        expect(items.map(({id, title, shouldShowRightIcon}) => ({id, title, shouldShowRightIcon}))).toEqual([
            {id: 'legalName', title: 'Acme Inc', shouldShowRightIcon: false},
            {id: 'legalType', title: 'Person', shouldShowRightIcon: true},
        ]);
        expect(onEditGroup).toHaveBeenCalledWith(1);
    });
});
