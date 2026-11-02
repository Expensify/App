import formatDynamicFieldValue from '@components/DynamicForm/utils/formatDynamicFieldValue';

import type {DynamicFormField} from '@src/types/onyx';

import {translateLocal} from '../../../utils/TestHelper';

const description: DynamicFormField = {key: 'description', type: 'text', required: true, multiline: true};
const name: DynamicFormField = {key: 'name', type: 'text', required: true};

describe('formatDynamicFieldValue', () => {
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
