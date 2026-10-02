import {render} from '@testing-library/react-native';

import YesNoAdapter from '@components/DynamicForm/adapters/YesNoAdapter';
import RadioButtons from '@components/RadioButtons';

import React from 'react';

jest.mock('@components/RadioButtons', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

describe('YesNoAdapter', () => {
    const mockedRadioButtons = jest.mocked(RadioButtons);

    it('stores the choice as a boolean and shows a stored boolean as the checked option', () => {
        // Given a question answered No
        const onInputChange = jest.fn();
        render(
            <YesNoAdapter
                value={false}
                onInputChange={onInputChange}
            />,
        );
        const radioProps = mockedRadioButtons.mock.lastCall?.[0];

        // When the user picks Yes
        radioProps?.onInputChange?.('yes');

        // Then No was shown as checked, and Yes is stored as true
        expect(radioProps?.value).toBe('no');
        expect(onInputChange).toHaveBeenCalledWith(true);
    });

    it('checks nothing while the question is unanswered', () => {
        // Given an unanswered question, which FormProvider starts as an empty string
        render(<YesNoAdapter value="" />);

        // When it renders
        const radioProps = mockedRadioButtons.mock.lastCall?.[0];

        // Then neither option is checked
        expect(radioProps?.value).toBe('');
    });
});
