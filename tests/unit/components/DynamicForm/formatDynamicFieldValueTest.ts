import formatDynamicFieldValue from '@components/DynamicForm/utils/formatDynamicFieldValue';
import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';

import type {DynamicFormField} from '@src/types/onyx';

import {translateLocal} from '../../../utils/TestHelper';

const description: DynamicFormField = {key: 'description', type: 'text', required: true, multiline: true};
const name: DynamicFormField = {key: 'name', type: 'text', required: true};
const address: DynamicFormField = {key: 'address', type: 'address', required: true};
const addressKeys = getAddressInputKeys(address.key);

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

    it.each([
        {country: 'US', street: '350 5th Avenue', city: 'New York', state: 'NY', zipCode: '10118', expected: `350 5th Avenue, New York, NY 10118, ${translateLocal('allCountries.US')}`},
        // cspell:disable
        {
            country: 'PL',
            street: 'Marszałkowska 10',
            city: 'Warszawa',
            state: 'Województwo mazowieckie',
            zipCode: '00-001',
            expected: `Marszałkowska 10, Warszawa, 00-001, ${translateLocal('allCountries.PL')}`,
        },
        // cspell:enable
    ])('shows the state of a $country address only where the form asks for it', ({country, street, city, state, zipCode, expected}) => {
        // Given an address whose draft holds a state, which address search fills in even where the form has no state picker
        const values = {[addressKeys.street]: street, [addressKeys.city]: city, [addressKeys.state]: state, [addressKeys.zipCode]: zipCode, [addressKeys.country]: country};

        // When it is shown on a confirmation row
        const shown = formatDynamicFieldValue(address, values, translateLocal);

        // Then a state the form does not ask for is left out, since it is not submitted either
        expect(shown).toBe(expected);
    });
});
