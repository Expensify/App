import {render} from '@testing-library/react-native';

import YesNoAdapter from '@components/DynamicForm/adapters/YesNoAdapter';
import RadioButtons from '@components/RadioButtons';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {createRef} from 'react';

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

        // Then No shows as checked, and Yes is stored as true
        expect(radioProps?.value).toBe('no');
        expect(onInputChange).toHaveBeenCalledWith(true);
    });

    it('stores No as false, since No answers the question', () => {
        // Given an unanswered question
        const onInputChange = jest.fn();
        render(
            <YesNoAdapter
                value=""
                onInputChange={onInputChange}
            />,
        );

        // When the user picks No
        mockedRadioButtons.mock.lastCall?.[0]?.onInputChange?.('no');

        // Then false is stored, which validation counts as an answer, rather than the empty string of an unanswered question
        expect(onInputChange).toHaveBeenCalledWith(false);
    });

    it('checks nothing while the question is unanswered', () => {
        // Given an unanswered question, which FormProvider starts as an empty string
        const value = '';

        // When it renders
        render(<YesNoAdapter value={value} />);

        // Then neither option is checked, so the user is not nudged towards an answer
        expect(mockedRadioButtons.mock.lastCall?.[0]?.value).toBe('');
    });

    it('passes the FullStory mask on to the radio buttons', () => {
        // Given a question whose answer must stay out of session recordings
        const forwardedFSClass = CONST.FULLSTORY.CLASS.MASK;

        // When it renders
        render(
            <YesNoAdapter
                value=""
                forwardedFSClass={forwardedFSClass}
            />,
        );

        // Then the radio buttons get the mask, since they are what draws the answer
        expect(mockedRadioButtons.mock.lastCall?.[0]?.forwardedFSClass).toBe(forwardedFSClass);
    });

    it('names the Yes/No group after its question for screen readers', () => {
        // Given a Yes/No question
        const question = 'Does anyone else own 25% or more?';

        // When it renders
        render(
            <YesNoAdapter
                value=""
                accessibilityLabel={question}
            />,
        );

        // Then the radio buttons announce the question as their group name
        expect(mockedRadioButtons.mock.lastCall?.[0]?.accessibilityLabel).toBe(question);
    });

    it('hands the form ref to the radio buttons, so the form can scroll to the question to show its error', () => {
        // Given a ref the form holds for the question
        const ref = createRef<ComponentRef<typeof View>>();

        // When the question renders
        render(<YesNoAdapter ref={ref} />);

        // Then the radio buttons get it, which attach it to their own view
        expect(mockedRadioButtons.mock.lastCall?.[0].ref).toBe(ref);
    });
});
