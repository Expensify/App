import {fireEvent, render, screen} from '@testing-library/react-native';

import DynamicFormFormattedTextInput from '@components/DynamicForm/components/DynamicFormFormattedTextInput';

import type {DynamicFormTextField} from '@src/types/onyx';

import React, {useState} from 'react';

const SORT_CODE: DynamicFormTextField = {
    key: 'sortCode',
    type: 'text',
    label: 'UK sort code',
    required: true,
    displayFormat: '**-**-**',
    regex: String.raw`^\d{2}-?\d{2}-?\d{2}$`,
    maxLength: 8,
};

function SortCodeInput() {
    const [answer, setAnswer] = useState('');
    return (
        <DynamicFormFormattedTextInput
            field={SORT_CODE}
            label={SORT_CODE.label}
            accessibilityLabel={SORT_CODE.label}
            value={answer}
            onInputChange={setAnswer}
        />
    );
}

describe('DynamicFormFormattedTextInput', () => {
    it('lays the answer out once the user leaves the input', () => {
        // Given a sort code typed without dashes
        render(<SortCodeInput />);
        const input = screen.getByLabelText('UK sort code');
        fireEvent.changeText(input, '231470');

        // Then typing is left alone
        expect(screen.getByDisplayValue('231470')).toBeOnTheScreen();

        // When the user leaves the input
        fireEvent(input, 'blur');

        // Then the answer shows with its dashes
        expect(screen.getByDisplayValue('23-14-70')).toBeOnTheScreen();
    });
});
