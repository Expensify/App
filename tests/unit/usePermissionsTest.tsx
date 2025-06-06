import {renderHook} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import OnyxProvider from '@components/OnyxProvider';
import CONST from '@src/CONST';
import usePermissions from '@src/hooks/usePermissions';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type ChildrenProps = {
    children: React.ReactNode;
};
function Wrapper({children}: ChildrenProps) {
    return <OnyxProvider>{children}</OnyxProvider>;
}

describe('usePermissions', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('should handle empty betas gracefully via Onyx', async () => {
        Onyx.set(ONYXKEYS.BETAS, []);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePermissions(), {wrapper: Wrapper});

        await waitForBatchedUpdatesWithAct();

        expect(result.current.isBetaEnabled(CONST.BETAS.ALL)).toBe(false);
    });

    it('should return correct permissions when betas are provided via Onyx', async () => {
        const mockBetas = [CONST.BETAS.ALL];

        Onyx.set(ONYXKEYS.BETAS, mockBetas);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePermissions(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // Ensure result.current is not null or undefined before accessing properties
        expect(result.current.isBetaEnabled(CONST.BETAS.ALL)).toBe(true);
        expect(result.current.isBlockedFromSpotnanaTravel).toBe(false);
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(true);
    });

    it('should react to updates in Betas context via Onyx and give correct value for isBetaEnabled', async () => {
        const initialBetas = [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.PER_DIEM, CONST.BETAS.PREVENT_SPOTNANA_TRAVEL];
        const updatedBetas = [CONST.BETAS.ALL];

        Onyx.set(ONYXKEYS.BETAS, initialBetas);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePermissions(), {wrapper: Wrapper});

        await waitForBatchedUpdatesWithAct();

        // Initially, check the value for the initial betas
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(true);
        expect(result.current.isBlockedFromSpotnanaTravel).toBe(true);
        expect(result.current.isBetaEnabled(CONST.BETAS.MULTI_LEVEL_TAGS)).toBe(false);
        expect(result.current.isBetaEnabled(CONST.BETAS.ALL)).toBe(false);

        Onyx.merge(ONYXKEYS.BETAS, updatedBetas);

        await waitForBatchedUpdatesWithAct();

        // After update, check the value for the updated betas
        expect(result.current.isBlockedFromSpotnanaTravel).toBe(false);
        expect(result.current.isBetaEnabled(CONST.BETAS.ALL)).toBe(true);
        expect(result.current.isBetaEnabled(CONST.BETAS.MULTI_LEVEL_TAGS)).toBe(true);
    });
});
