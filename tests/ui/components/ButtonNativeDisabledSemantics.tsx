import {render} from '@testing-library/react-native';
import React from 'react';
import type {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import Button from '@src/components/Button';

const mockPressableWithFeedback = jest.fn<void, [PressableWithFeedbackProps]>();

jest.mock('@components/Pressable/PressableWithFeedback', () => {
    function MockPressableWithFeedback({children, ...props}: PressableWithFeedbackProps) {
        mockPressableWithFeedback(props);

        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        const {View} = jest.requireActual<typeof import('react-native')>('react-native');
        const content =
            typeof children === 'function'
                ? children({
                      pressed: false,
                      hovered: false,
                      focused: false,
                      isScreenReaderActive: false,
                      isDisabled: false,
                  })
                : children;

        return <View>{content}</View>;
    }

    return MockPressableWithFeedback;
});

function getLastPressableProps(): PressableWithFeedbackProps {
    const lastCall = mockPressableWithFeedback.mock.calls.at(-1);

    if (!lastCall) {
        return {} as PressableWithFeedbackProps;
    }

    return lastCall[0];
}

describe('Button native disabled semantics on web', () => {
    beforeEach(() => {
        mockPressableWithFeedback.mockClear();
    });

    it('maps disabled state to fullDisabled when web native semantics are enabled', () => {
        render(
            <Button
                text="Next"
                isDisabled
                enableNativeDisabled
            />,
        );

        expect(getLastPressableProps()).toEqual(
            expect.objectContaining({
                disabled: true,
                fullDisabled: true,
            }),
        );
    });

    it('keeps logical disabled while allowing explicit web opt-out', () => {
        render(
            <Button
                text="Next"
                isDisabled
                enableNativeDisabled={false}
            />,
        );

        expect(getLastPressableProps()).toEqual(
            expect.objectContaining({
                disabled: true,
                fullDisabled: false,
            }),
        );
    });

    it('keeps fullDisabled false when button is enabled', () => {
        render(<Button text="Next" />);

        expect(getLastPressableProps()).toEqual(
            expect.objectContaining({
                disabled: false,
                fullDisabled: false,
            }),
        );
    });
});
