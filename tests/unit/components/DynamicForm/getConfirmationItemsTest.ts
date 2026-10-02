import getConfirmationItems from '@components/DynamicForm/utils/getConfirmationItems';
import groupFieldsIntoPages from '@components/DynamicForm/utils/groupFieldsIntoPages';
import type {SummaryGroupRow} from '@components/SubStepForms/ConfirmationStep';

import type {DynamicFormField} from '@src/types/onyx';

import {translateLocal} from '../../../utils/TestHelper';

function getRowTitles(rows: SummaryGroupRow[]) {
    return rows.map((row) => ({id: row.id, title: row.title, ...(row.kind === 'field' ? {shouldShowRightIcon: row.shouldShowRightIcon} : {})}));
}

describe('getConfirmationItems', () => {
    it('lists every visible answer under its page, and opens the page when an editable row is tapped', () => {
        // Given a readonly name on the first page and a hidden and a visible field on the second
        const fields: DynamicFormField[] = [
            {key: 'legalName', label: 'Legal name', type: 'text', required: true, readonly: true, group: 'Business'},
            {key: 'legalType', label: 'Type', type: 'radio', required: true, group: 'Details', values: [{key: 'PRIVATE', label: 'Person'}]},
            {key: 'companyNumber', label: 'Company number', type: 'text', required: true, group: 'Details', showWhen: {key: 'legalType', equals: ['BUSINESS']}},
        ];
        const onEditGroup = jest.fn();

        // When the confirmation sections are built and the type row is tapped
        const sections = getConfirmationItems(groupFieldsIntoPages(fields), {legalName: 'Acme Inc', legalType: 'PRIVATE'}, translateLocal, {onEditGroup, onEditListItem: jest.fn()});
        sections.at(1)?.rows.at(0)?.onPress();

        // Then each page is a section named after it, the hidden field has no row, the readonly row has no arrow, and tapping the type opens the second page
        expect(sections.map((section) => ({name: section.name, rows: getRowTitles(section.rows)}))).toEqual([
            {name: 'Business', rows: [{id: 'legalName', title: 'Acme Inc', shouldShowRightIcon: false}]},
            {name: 'Details', rows: [{id: 'legalType', title: 'Person', shouldShowRightIcon: true}]},
        ]);
        expect(onEditGroup).toHaveBeenCalledWith(1);
    });

    it('hides all but the last four characters of a sensitive answer', () => {
        // Given a sensitive SSN
        const fields: DynamicFormField[] = [{key: 'ssn', type: 'text', required: true, sensitive: true}];

        // When the confirmation sections are built
        const sections = getConfirmationItems(groupFieldsIntoPages(fields), {ssn: '123456789'}, translateLocal, {onEditGroup: jest.fn(), onEditListItem: jest.fn()});

        // Then the row shows only the last four digits, enough for the user to recognize the number
        expect(sections.at(0)?.rows.at(0)?.title).toBe('•••••6789');
    });

    it('shows each list entry as its own row that opens the entry', () => {
        // Given a list of directors with one entry
        const fields: DynamicFormField[] = [
            {
                key: 'directors',
                type: 'list',
                required: true,
                itemFields: [
                    {key: 'firstName', type: 'text', required: true},
                    {key: 'lastName', type: 'text', required: true},
                ],
            },
        ];
        const values = {directors: [{id: 'jane', answers: {firstName: 'Jane', lastName: 'Doe'}}]};
        const onEditListItem = jest.fn();

        // When the confirmation sections are built and the entry row is tapped
        const row = getConfirmationItems(groupFieldsIntoPages(fields), values, translateLocal, {onEditGroup: jest.fn(), onEditListItem}).at(0)?.rows.at(0);
        row?.onPress();

        // Then the entry is an avatar row named by its leading text answers, and tapping it opens that entry rather than the page
        expect(row).toMatchObject({kind: 'item', title: 'Jane Doe'});
        expect(onEditListItem).toHaveBeenCalledWith('directors', 'jane');
    });
});
