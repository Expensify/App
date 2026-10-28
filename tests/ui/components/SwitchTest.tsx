import {render, screen} from '@testing-library/react-native';

import Switch from '@components/Switch';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => (key === 'common.locked' ? 'Locked' : key),
    })),
);

const LABEL = 'Auto-pay approved reports';
const LOCKED_LABEL = `${LABEL}, Locked`;

function renderSwitch(props: Partial<React.ComponentProps<typeof Switch>> = {}) {
    return render(
        <Switch
            isOn={false}
            onToggle={jest.fn()}
            accessibilityLabel={LABEL}
            {...props}
        />,
    );
}

describe('Switch', () => {
    it('does not announce a locked state when the switch is enabled and shows no lock icon', () => {
        // Given an enabled switch without a lock icon
        renderSwitch();

        // When a screen reader reads the switch
        const switchElement = screen.getByRole(CONST.ROLE.SWITCH);

        // Then the label is left as is
        expect(switchElement).toHaveProp('accessibilityLabel', LABEL);
    });

    it('announces a locked state when the switch is disabled', () => {
        // Given a disabled switch
        renderSwitch({disabled: true});

        // When a screen reader reads the switch
        const switchElement = screen.getByRole(CONST.ROLE.SWITCH);

        // Then the label says the switch is locked
        expect(switchElement).toHaveProp('accessibilityLabel', LOCKED_LABEL);
    });

    it('announces a locked state when the switch is pressable but shows the lock icon', () => {
        // Given a pressable switch that shows the lock icon, e.g. one that routes to an upgrade page
        renderSwitch({showLockIcon: true});

        // When a screen reader reads the switch
        const switchElement = screen.getByRole(CONST.ROLE.SWITCH);

        // Then the label says the switch is locked, matching the icon
        expect(switchElement).toHaveProp('accessibilityLabel', LOCKED_LABEL);
    });
});
