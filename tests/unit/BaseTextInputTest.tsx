import {render} from '@testing-library/react-native';

import BaseTextInput from '@components/TextInput/BaseTextInput';

import variables from '@styles/variables';

import React from 'react';

// A key event shaped like what react-native-web hands to `onKeyPress`; the code under test only reads these fields.
type KeyEventLike = {key: string; shiftKey: boolean; preventDefault: () => void};

/* eslint-disable react/no-unused-prop-types -- this types the props captured from the mock, not a component's declared PropTypes */
type ForwardedProps = {
    onKeyPress?: (event: KeyEventLike) => void;
    autoGrowHeight?: boolean;
    maxAutoGrowHeight?: number;
    submitBehavior?: string;
    returnKeyType?: string;
};
/* eslint-enable react/no-unused-prop-types */

// Capture the props BaseTextInput forwards to its implementation so we can invoke the resolved `onKeyPress`
// handler and inspect the grow/submit props, without rendering the real input.
const mockCaptureProps = jest.fn<void, [ForwardedProps]>();
jest.mock('@components/TextInput/BaseTextInput/implementation', () => {
    function MockImplementation(props: ForwardedProps) {
        mockCaptureProps(props);
        return null;
    }
    return {__esModule: true, default: MockImplementation};
});

/** The props BaseTextInput forwarded to its implementation on the latest render. */
function getForwardedProps(): ForwardedProps {
    return mockCaptureProps.mock.calls.at(-1)?.[0] ?? {};
}

// BaseTextInput is a single shared component across platforms. Only web actually passes a keyboard event to the
// keypress handler, but the Shift+Enter wiring below is exercised the same way in Jest regardless of platform.
describe('BaseTextInput - autoGrowSingleLine', () => {
    beforeEach(() => {
        mockCaptureProps.mockClear();
    });

    it('enables the grow and submit props', () => {
        render(<BaseTextInput autoGrowSingleLine />);

        const forwarded = getForwardedProps();
        expect(forwarded.autoGrowHeight).toBe(true);
        expect(forwarded.maxAutoGrowHeight).toBe(variables.textInputAutoGrowMaxHeight);
        expect(forwarded.submitBehavior).toBe('blurAndSubmit');
        expect(forwarded.returnKeyType).toBe('go');
    });

    it('submits and prevents the default line break on Shift+Enter', () => {
        const onSubmitEditing = jest.fn();
        render(
            <BaseTextInput
                autoGrowSingleLine
                onSubmitEditing={onSubmitEditing}
            />,
        );

        const preventDefault = jest.fn();
        getForwardedProps().onKeyPress?.({key: 'Enter', shiftKey: true, preventDefault});

        expect(onSubmitEditing).toHaveBeenCalledTimes(1);
        expect(preventDefault).toHaveBeenCalled();
    });

    it('does not submit on plain Enter', () => {
        const onSubmitEditing = jest.fn();
        render(
            <BaseTextInput
                autoGrowSingleLine
                onSubmitEditing={onSubmitEditing}
            />,
        );

        getForwardedProps().onKeyPress?.({key: 'Enter', shiftKey: false, preventDefault: jest.fn()});

        expect(onSubmitEditing).not.toHaveBeenCalled();
    });

    it('does not prevent the default on Shift+Enter when there is no submit handler', () => {
        render(<BaseTextInput autoGrowSingleLine />);

        const preventDefault = jest.fn();
        getForwardedProps().onKeyPress?.({key: 'Enter', shiftKey: true, preventDefault});

        // With nothing to submit there is no reason to swallow the keystroke.
        expect(preventDefault).not.toHaveBeenCalled();
    });

    it('passes props through untouched without the flag', () => {
        const onKeyPress = jest.fn();
        render(<BaseTextInput onKeyPress={onKeyPress} />);

        const forwarded = getForwardedProps();
        // Without the flag the consumer's own handler is forwarded verbatim (not wrapped) and no grow/submit defaults are injected.
        expect(forwarded).toHaveProperty('onKeyPress', onKeyPress);
        expect(forwarded.autoGrowHeight).toBeFalsy();
        expect(forwarded.submitBehavior).toBeUndefined();
        expect(forwarded.returnKeyType).toBeUndefined();
    });
});
