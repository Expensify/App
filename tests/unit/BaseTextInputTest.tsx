import {render} from '@testing-library/react-native';

import BaseTextInput from '@components/TextInput/BaseTextInput';

import variables from '@styles/variables';

import React from 'react';

/* eslint-disable react/no-unused-prop-types -- this types the props captured from the mock, not a component's declared PropTypes */
type ForwardedProps = {
    onKeyPress?: (event: unknown) => void;
    autoGrowHeight?: boolean;
    maxAutoGrowHeight?: number;
    submitBehavior?: string;
    returnKeyType?: string;
};
/* eslint-enable react/no-unused-prop-types */

// Capture the props BaseTextInput forwards to its implementation so we can inspect the resolved `onKeyPress`
// handler and the grow/submit props, without rendering the real input.
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

// jest-expo resolves the `.native` variant by default, so this file exercises the native implementation. Native
// intentionally skips the web-only Shift+Enter keypress wiring — see BaseTextInputWebTest for that behavior.
describe('BaseTextInput (native) - autoGrowSingleLine', () => {
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

    it('forwards onKeyPress untouched even with the flag, adding no keypress subscription', () => {
        const onKeyPress = jest.fn();
        render(
            <BaseTextInput
                autoGrowSingleLine
                onKeyPress={onKeyPress}
            />,
        );

        // Native must not wrap onKeyPress — doing so subscribes the native input to every keystroke for no benefit.
        expect(getForwardedProps()).toHaveProperty('onKeyPress', onKeyPress);
    });

    it('passes props through untouched without the flag', () => {
        const onKeyPress = jest.fn();
        render(<BaseTextInput onKeyPress={onKeyPress} />);

        const forwarded = getForwardedProps();
        // The consumer's own handler is forwarded verbatim (not wrapped) and no grow/submit defaults are injected.
        expect(forwarded).toHaveProperty('onKeyPress', onKeyPress);
        expect(forwarded.autoGrowHeight).toBeFalsy();
        expect(forwarded.submitBehavior).toBeUndefined();
        expect(forwarded.returnKeyType).toBeUndefined();
    });
});
