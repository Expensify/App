import getConfirmationItems from '@components/DynamicForm/utils/getConfirmationItems';
import {getAllFields} from '@components/DynamicForm/utils/paginate';

import type {DynamicFormPage} from '@src/types/onyx';

import {translateLocal} from '../../../utils/TestHelper';

const pages: DynamicFormPage[] = [
    {
        key: 'identity',
        title: 'Identity',
        content: [
            {key: 'name', type: 'text', required: true, label: 'Name'},
            {key: 'ssn', type: 'text', required: true, label: 'SSN', sensitive: true},
            {key: 'country', type: 'text', required: false, label: 'Country', readonly: true},
        ],
    },
    {key: 'business', title: 'Business', showWhen: {key: 'type', equals: ['BUSINESS']}, content: [{key: 'ein', type: 'text', required: true, label: 'EIN'}]},
];

describe('getConfirmationItems', () => {
    it('masks sensitive answers and opens the page of an editable row', () => {
        // Given answers with an SSN
        const onEditPage = jest.fn();
        const [group] = getConfirmationItems(pages, getAllFields(pages), {name: 'Ada', ssn: '123451234', country: 'US'}, translateLocal, onEditPage);

        // When the user taps the SSN row
        const ssnRow = group.rows.find((row) => row.id === 'ssn');
        ssnRow?.onPress();

        // Then the SSN is masked to its last four digits and the page is opened
        expect(ssnRow?.title).toBe('•••-••-1234');
        expect(onEditPage).toHaveBeenCalledWith(0);
    });

    it('shows a readonly row with no chevron and no action', () => {
        // Given a readonly field
        const onEditPage = jest.fn();
        const [group] = getConfirmationItems(pages, getAllFields(pages), {name: 'Ada', ssn: '123451234', country: 'US'}, translateLocal, onEditPage);

        // When its row is tapped
        const row = group.rows.find((candidate) => candidate.id === 'country');
        row?.onPress();

        // Then it is not editable
        expect(row?.shouldShowRightIcon).toBe(false);
        expect(onEditPage).not.toHaveBeenCalled();
    });

    it('has no group for a page that is not shown', () => {
        // Given a private recipient, so the business page is skipped
        const values = {type: 'PRIVATE', name: 'Ada', ein: '1'};

        // When the confirmation page lists the answers
        const groups = getConfirmationItems(pages, getAllFields(pages), values, translateLocal, jest.fn());

        // Then only the identity page is summarized
        expect(groups.map((group) => group.id)).toEqual(['identity']);
    });
});
