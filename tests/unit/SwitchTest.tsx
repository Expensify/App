import {render, screen} from '@testing-library/react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Switch from '@components/Switch';
import CONST from '@src/CONST';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string) => key),
    })),
);

describe('Switch', () => {
    it('passes checked accessibility state through to the pressable', () => {
        render(
            <Switch
                isOn
                accessibilityLabel="Default Rate"
                onToggle={jest.fn()}
            />,
        );

        screen.getByLabelText('Default Rate');
        const pressable = screen.UNSAFE_getByType(PressableWithFeedback);

        expect(pressable.props.role).toBe(CONST.ROLE.SWITCH);
        expect(pressable.props['aria-checked']).toBe(true);
        expect(pressable.props.accessibilityState).toEqual({checked: true, disabled: false});
    });

    it('marks the switch disabled in accessibility state when there is no disabled action', () => {
        render(
            <Switch
                isOn={false}
                accessibilityLabel="Archived Rate"
                onToggle={jest.fn()}
                disabled
            />,
        );

        screen.getByLabelText('Archived Rate, common.locked');
        const pressable = screen.UNSAFE_getByType(PressableWithFeedback);

        expect(pressable.props.disabled).toBe(true);
        expect(pressable.props.accessibilityState).toEqual({checked: false, disabled: true});
    });
});
