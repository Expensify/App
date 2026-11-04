import {fireEvent, render, screen} from '@testing-library/react-native';

import ToggleLinkAdapter from '@components/DynamicForm/adapters/ToggleLinkAdapter';

import React from 'react';

/** TextLink cancels the browser's default link handling, so a tap carries an event */
const TAP_EVENT = {preventDefault: jest.fn()};

describe('ToggleLinkAdapter', () => {
    it('turns the answer on with a tap, then shows the wording that undoes it', () => {
        // Given an opt-out link that is off
        const onInputChange = jest.fn();
        const {rerender} = render(
            <ToggleLinkAdapter
                value={false}
                onInputChange={onInputChange}
                label="I don't have an SSN"
                toggledLabel="I have an SSN"
            />,
        );

        // When the user taps it
        fireEvent.press(screen.getByText("I don't have an SSN"), TAP_EVENT);

        // Then the answer is stored as true, and once on, the link offers the way back
        expect(onInputChange).toHaveBeenCalledWith(true);
        rerender(
            <ToggleLinkAdapter
                value
                onInputChange={onInputChange}
                label="I don't have an SSN"
                toggledLabel="I have an SSN"
            />,
        );
        fireEvent.press(screen.getByText('I have an SSN'), TAP_EVENT);
        expect(onInputChange).toHaveBeenLastCalledWith(false);
    });

    it('reads an unanswered link as off and keeps its wording when the schema gives no toggled wording', () => {
        // Given a link with no answer yet and a single wording
        const onInputChange = jest.fn();
        render(
            <ToggleLinkAdapter
                value=""
                onInputChange={onInputChange}
                label="Skip this step"
            />,
        );

        // When the user taps it
        fireEvent.press(screen.getByText('Skip this step'), TAP_EVENT);

        // Then the tap turns it on, since an unanswered link has not been tapped yet
        expect(onInputChange).toHaveBeenCalledWith(true);
    });
});
