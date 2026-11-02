import formatDynamicFieldValue from '@components/DynamicForm/utils/formatDynamicFieldValue';

import type {DynamicFormField} from '@src/types/onyx';

import {translateLocal} from '../../../utils/TestHelper';

const description: DynamicFormField = {key: 'description', type: 'text', required: true, multiline: true};
const name: DynamicFormField = {key: 'name', type: 'text', required: true};
const ssn: DynamicFormField = {key: 'ssn', type: 'text', required: true, rule: 'ssn'};

describe('formatDynamicFieldValue', () => {
    it.each([
        ['123451234', '123-45-1234'],
        ['000012345', '000-01-2345'],
    ])('groups the SSN %s as %s', (answer, expected) => {
        // Given an SSN answer, including one starting with zeros that the SSN validator rejects but the schema accepts
        // When it is shown on a confirmation or readonly row
        const shown = formatDynamicFieldValue(ssn, {ssn: answer}, translateLocal);

        // Then it is grouped the way an SSN is usually written
        expect(shown).toBe(expected);
    });

    it('leaves an SSN answer that is not nine digits as typed', () => {
        // Given an SSN answer with a wrong number of digits
        // When it is shown on a row
        const shown = formatDynamicFieldValue(ssn, {ssn: '12345'}, translateLocal);

        // Then it is not grouped, since the grouping only fits nine digits
        expect(shown).toBe('12345');
    });

    it.each(['A\nB', 'A \r\n  B'])('joins the lines of a multiline answer %j into one', (answer) => {
        // Given a multiline answer typed on two lines, with or without spaces and a Windows line break around the break
        // When it is shown on a confirmation or readonly row
        const shown = formatDynamicFieldValue(description, {description: answer}, translateLocal);

        // Then it reads as one line, since a row shows one line and cuts a longer answer with an ellipsis
        expect(shown).toBe('A B');
    });

    it('shows a single-line answer as it was typed', () => {
        // Given a single-line text field whose answer holds a line break, as a pasted value would
        // When it is shown on a row
        const shown = formatDynamicFieldValue(name, {name: 'A\nB'}, translateLocal);

        // Then it is not changed, since only multiline fields are joined
        expect(shown).toBe('A\nB');
    });
});
