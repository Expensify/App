import {renderHook} from '@testing-library/react-native';

import {dismissProductTraining} from '@libs/actions/Welcome';

import useConnectionsMovedTooltip from '@pages/workspace/connections/useConnectionsMovedTooltip';

import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';

jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: (_tooltipName: string, shouldShow: boolean) => ({
        shouldShowProductTrainingTooltip: shouldShow,
        hideProductTrainingTooltip: jest.fn(),
    }),
}));
jest.mock('@libs/actions/Welcome', () => ({dismissProductTraining: jest.fn()}));
jest.mock('@hooks/useBeforeRemove', () => jest.fn());

describe('useConnectionsMovedTooltip', () => {
    beforeEach(() => {
        jest.mocked(dismissProductTraining).mockClear();
    });

    it('should hide and dismiss the tooltip when the user is already on Connections', () => {
        // Given the tooltip would show and the focused page is Connections, for example opened from an old /accounting link
        // When the workspace menu renders
        const {result} = renderHook(() => useConnectionsMovedTooltip(true, SCREENS.WORKSPACE.ACCOUNTING.ROOT, true, true));

        // Then it does not point at the page the user is already on, and it is dismissed so it does not come back later
        expect(result.current.shouldShowTooltip).toBe(false);
        expect(dismissProductTraining).toHaveBeenCalledWith(CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.CONNECTIONS_MOVED);
    });

    it('should show the tooltip on other workspace pages until the user leaves them', () => {
        // Given the tooltip would show and the focused page is not Connections
        // When the workspace menu renders
        const {result} = renderHook(() => useConnectionsMovedTooltip(true, SCREENS.WORKSPACE.PROFILE, false, true));

        // Then it shows and is not dismissed, since the user has not found Connections yet
        expect(result.current.shouldShowTooltip).toBe(true);
        expect(dismissProductTraining).not.toHaveBeenCalled();
    });
});
