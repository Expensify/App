import {render} from '@testing-library/react-native';
import React from 'react';
import type {PressableWithFeedbackProps} from '@components/Pressable/PressableWithFeedback';
import FormAlertWithSubmitButton from '@src/components/FormAlertWithSubmitButton';

const mockPressableWithFeedback = jest.fn<void, [PressableWithFeedbackProps]>();

jest.mock('@hooks/useNetwork', () => () => ({isOffline: false}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

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

describe('FormAlertWithSubmitButton disabled semantics', () => {
    beforeEach(() => {
        mockPressableWithFeedback.mockClear();
    });

    it('keeps disabled submit buttons fully hidden from accessibility through the wrapper path', () => {
        render(
            <FormAlertWithSubmitButton
                buttonText="Next"
                isDisabled
                onSubmit={jest.fn()}
            />,
        );

        expect(getLastPressableProps()).toEqual(
            expect.objectContaining({
                disabled: true,
                fullDisabled: true,
                accessible: false,
                focusable: false,
                accessibilityElementsHidden: true,
                importantForAccessibility: 'no-hide-descendants',
            }),
        );
    });
});
