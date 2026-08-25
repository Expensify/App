import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import BetaOverridesModal from '@components/BetaOverridesModal';

import CONST from '@src/CONST';

import React from 'react';

const mockSetBetaOverride = jest.fn<void, [string, boolean]>();
const mockClearBetaOverrides = jest.fn<void, []>();
jest.mock('@userActions/User', () => ({
    setBetaOverride: (beta: string, value: boolean): void => {
        mockSetBetaOverride(beta, value);
    },
    clearBetaOverrides: (): void => {
        mockClearBetaOverrides();
    },
}));

let mockBetasOverride: Partial<Record<string, boolean>> | undefined;
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [mockBetasOverride],
}));

let mockEnabledBetas: string[] = [];
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: (beta: string) => mockEnabledBetas.includes(beta)}),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    }),
}));

describe('BetaOverridesModal', () => {
    beforeEach(() => {
        mockBetasOverride = undefined;
        mockEnabledBetas = [];
        mockSetBetaOverride.mockClear();
        mockClearBetaOverrides.mockClear();
    });

    it('renders a switch for every beta except the "all" beta', () => {
        render(
            <BetaOverridesModal
                isVisible
                onClose={jest.fn()}
            />,
        );

        expect(screen.getAllByRole(CONST.ROLE.SWITCH).length).toBe(Object.values(CONST.BETAS).length - 1);
        expect(screen.queryByLabelText(CONST.BETAS.ALL)).toBeNull();
    });

    it('pins the opposite value when a beta that is off is toggled', async () => {
        render(
            <BetaOverridesModal
                isVisible
                onClose={jest.fn()}
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: CONST.BETAS.DEFAULT_ROOMS}));

        await waitFor(() => expect(mockSetBetaOverride).toHaveBeenCalledWith(CONST.BETAS.DEFAULT_ROOMS, true));
    });

    it('pins false when a beta that is on is toggled', async () => {
        mockEnabledBetas = [CONST.BETAS.DEFAULT_ROOMS];
        render(
            <BetaOverridesModal
                isVisible
                onClose={jest.fn()}
            />,
        );

        fireEvent.press(screen.getByRole(CONST.ROLE.SWITCH, {name: CONST.BETAS.DEFAULT_ROOMS}));

        await waitFor(() => expect(mockSetBetaOverride).toHaveBeenCalledWith(CONST.BETAS.DEFAULT_ROOMS, false));
    });

    it('marks only the betas that have an override stored', () => {
        mockBetasOverride = {[CONST.BETAS.DEFAULT_ROOMS]: false};
        render(
            <BetaOverridesModal
                isVisible
                onClose={jest.fn()}
            />,
        );

        expect(screen.getAllByText('initialSettingsPage.troubleshoot.overridden').length).toBe(1);
    });

    it('clears every override when reset is pressed', () => {
        mockBetasOverride = {[CONST.BETAS.DEFAULT_ROOMS]: true};
        render(
            <BetaOverridesModal
                isVisible
                onClose={jest.fn()}
            />,
        );

        fireEvent.press(screen.getByText('initialSettingsPage.troubleshoot.resetAllOverrides'));

        expect(mockClearBetaOverrides).toHaveBeenCalled();
    });
});
