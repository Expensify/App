import {act, render} from '@testing-library/react-native';

import type * as LHNTooltipContextModule from '@components/LHNOptionsList/LHNTooltipContext';
import {useLHNTooltipActionsContext, useLHNTooltipVisibilityContext} from '@components/LHNOptionsList/LHNTooltipContext';
import LHNTooltipContextProvider from '@components/LHNOptionsList/LHNTooltipContextProvider';

import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

let mockIsFocused = true;
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
}));

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: () => true,
}));

const mockHideTooltip = jest.fn();
const mockOnTooltipHookRender = jest.fn<void, [boolean]>();
jest.mock('@components/LHNOptionsList/OptionRowLHN/useLHNRowProductTrainingTooltip', () => ({
    __esModule: true,
    default: function useMockLHNRowProductTrainingTooltip() {
        const {useLHNTooltipVisibilityContext: useVisibilityContext} = jest.requireActual<typeof LHNTooltipContextModule>('@components/LHNOptionsList/LHNTooltipContext');
        mockOnTooltipHookRender(useVisibilityContext().isScreenFocused);
        return {hideProductTrainingTooltip: mockHideTooltip};
    },
}));

const onRowRender = jest.fn<void, [ReturnType<typeof useLHNTooltipActionsContext>]>();
function Row() {
    onRowRender(useLHNTooltipActionsContext());
    return null;
}

const onTooltipRowRender = jest.fn<void, [ReturnType<typeof useLHNTooltipVisibilityContext>]>();
function TooltipRow() {
    onTooltipRowRender(useLHNTooltipVisibilityContext());
    return null;
}

// Created once so a provider re-render reaches the rows only through context, as in the LHN list
const rows = (
    <>
        <Row />
        <TooltipRow />
    </>
);

function renderProvider() {
    const result = render(<LHNTooltipContextProvider data={['1']}>{rows}</LHNTooltipContextProvider>);
    const rerenderProvider = () => result.rerender(<LHNTooltipContextProvider data={['1']}>{rows}</LHNTooltipContextProvider>);
    return {rerenderProvider};
}

describe('LHNTooltipContextProvider', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockIsFocused = true;
        onRowRender.mockClear();
        onTooltipRowRender.mockClear();
        mockHideTooltip.mockClear();
        mockOnTooltipHookRender.mockClear();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('does not re-render rows when the screen loses focus', async () => {
        // Given the LHN is rendered while its screen is focused
        const {rerenderProvider} = renderProvider();
        await waitForBatchedUpdatesWithAct();
        const rowRendersBeforeBlur = onRowRender.mock.calls.length;

        // When an RHP opens and the screen loses focus
        mockIsFocused = false;
        rerenderProvider();
        await waitForBatchedUpdatesWithAct();

        // Then rows don't render again, since every RHP open would otherwise re-render each row, and only the tooltip row sees the new focus
        expect(onRowRender).toHaveBeenCalledTimes(rowRendersBeforeBlur);
        expect(onTooltipRowRender.mock.lastCall?.[0].isScreenFocused).toBe(false);
        expect(onRowRender.mock.lastCall?.[0].getIsScreenFocused()).toBe(false);
    });

    it('lets rows hide the tooltip through a stable function', async () => {
        // Given the LHN is rendered
        renderProvider();
        await waitForBatchedUpdatesWithAct();

        // When a row is pressed and hides the tooltip
        onRowRender.mock.lastCall?.[0].hideProductTrainingTooltip();

        // Then the provider's hide runs, so pressing a row still dismisses the Concierge tooltip
        expect(mockHideTooltip).toHaveBeenCalledTimes(1);
    });

    it('gives the tooltip hook the current screen focus', async () => {
        // Given the LHN is rendered while its screen is focused
        const {rerenderProvider} = renderProvider();
        await waitForBatchedUpdatesWithAct();
        expect(mockOnTooltipHookRender.mock.lastCall?.[0]).toBe(true);

        // When the screen loses focus
        mockIsFocused = false;
        rerenderProvider();
        await waitForBatchedUpdatesWithAct();

        // Then the hook sees the blur, which only happens while the row provider renders under the visibility provider
        expect(mockOnTooltipHookRender.mock.lastCall?.[0]).toBe(false);
    });
});
