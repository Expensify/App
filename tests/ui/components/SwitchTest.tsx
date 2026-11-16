import {render, screen} from '@testing-library/react-native';

import Switch from '@components/Switch';
import Tooltip from '@components/Tooltip';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => (key === 'common.locked' ? 'Locked' : key),
    })),
);

const LABEL = 'Auto-pay approved reports';
const LOCKED_LABEL = `${LABEL}, Locked`;
const SENTRY_LABEL = CONST.SENTRY_LABEL.WORKSPACE.RULES.AUTO_PAY_APPROVED_REPORTS_SWITCH;

function renderSwitch(props: Partial<React.ComponentProps<typeof Switch>> = {}) {
    return render(
        <Switch
            isOn={false}
            onToggle={jest.fn()}
            accessibilityLabel={LABEL}
            sentryLabel={SENTRY_LABEL}
            {...props}
        />,
    );
}

describe('Switch', () => {
    it('anchors the explanation to the lock icon without wrapping the switch', () => {
        // Given a disabled switch with a reason for being locked
        const lockTooltip = 'Please enable at least one category.';
        renderSwitch({disabled: true, lockTooltip});

        // When inspecting the tooltip anchor
        const tooltip = screen.UNSAFE_getByType(Tooltip);

        // Then only the lock is inside it, not the track or accessible switch
        expect(tooltip.props.text).toBe(lockTooltip);
        expect(tooltip.props.shouldRender).toBe(true);
        expect(tooltip.findAll((node) => node.props.testID === CONST.SWITCH_LOCK_ICON_TEST_ID).length).toBeGreaterThan(0);
        expect(tooltip.findAll((node) => node.props.role === CONST.ROLE.SWITCH)).toHaveLength(0);
    });

    it('does not add a tooltip to existing locked switches without an explanation', () => {
        // Given an existing caller that only disables the switch
        renderSwitch({disabled: true});

        // When inspecting the optional tooltip
        const tooltip = screen.UNSAFE_getByType(Tooltip);

        // Then tooltip behavior remains disabled for that caller
        expect(tooltip.props.shouldRender).toBe(false);
    });

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

    it('reports taps to Sentry with the given label, not the accessibility label', () => {
        // Given a switch whose accessibility label could contain user data, like a category name
        renderSwitch({accessibilityLabel: 'Enable category: Client dinners'});

        // When Sentry reads the label of the tapped switch
        const switchElement = screen.getByRole(CONST.ROLE.SWITCH);

        // Then it gets the constant label, so no user data is sent to Sentry or FullStory
        expect(switchElement).toHaveProp('sentryLabel', SENTRY_LABEL);
    });
});
