import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import PressableWithDelayToggle from '@components/Pressable/PressableWithDelayToggle';

jest.mock('@components/Tooltip', () => {
    return function MockTooltip({children}: {children: React.ReactNode}) {
        return children;
    };
});

describe('PressableWithDelayToggle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('remains pressable for non-inline invite/resend buttons', () => {
        const onPress = jest.fn();

        render(
            <PressableWithDelayToggle
                text="Invite"
                textChecked="Resend"
                tooltipText=""
                tooltipTextChecked=""
                inline={false}
                onPress={onPress}
                accessibilityLabel="Invite or resend"
            />,
        );

        fireEvent.press(screen.getByLabelText('Invite or resend'));

        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
