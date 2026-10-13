import {render, screen} from '@testing-library/react-native';

import RadioButtons from '@components/RadioButtons';

import CONST from '@src/CONST';

import React from 'react';

const items = [
    {label: 'Yes', value: 'yes'},
    {label: 'No', value: 'no'},
];

describe('RadioButtons', () => {
    it('names the group after the question when given one', () => {
        // Given radio buttons answering a question
        const question = 'Does anyone else own 25% or more?';

        // When they render with the question as their label
        render(
            <RadioButtons
                items={items}
                accessibilityLabel={question}
            />,
        );

        // Then screen readers find a radio group named after the question
        expect(screen.getByLabelText(question)).toHaveProp('role', CONST.ROLE.RADIOGROUP);
    });

    it('adds no group when no question is given', () => {
        // Given radio buttons used without a question, as on existing screens
        const unlabeledItems = items;

        // When they render
        render(<RadioButtons items={unlabeledItems} />);

        // Then no radio group is added, so those screens read as before
        expect(screen.UNSAFE_queryAllByProps({role: CONST.ROLE.RADIOGROUP})).toHaveLength(0);
    });
});
