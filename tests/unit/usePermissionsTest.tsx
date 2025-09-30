import {renderHook} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import CONST from '@src/CONST';
import usePermissions from '@src/hooks/usePermissions';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type ChildrenProps = {
    children: React.ReactNode;
};
function Wrapper({children}: ChildrenProps) {
    return <OnyxListItemProvider>{children}</OnyxListItemProvider>;
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
        expect(result.current.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL)).toBe(true);
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
        expect(result.current.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL)).toBe(true);
        expect(result.current.isBetaEnabled(CONST.BETAS.ALL)).toBe(false);

        Onyx.merge(ONYXKEYS.BETAS, updatedBetas);

        await waitForBatchedUpdatesWithAct();

        // After update, check the value for the updated betas
        expect(result.current.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL)).toBe(true);
        expect(result.current.isBetaEnabled(CONST.BETAS.ALL)).toBe(true);
    });

    it('should handle explicit only and exclusion betas correctly', async () => {
        // Given: A beta configuration with both explicit only and exclusion betas
        const explicitOnlyBeta = CONST.BETAS.CUSTOM_REPORT_NAMES;
        const exclusionBeta = CONST.BETAS.PREVENT_SPOTNANA_TRAVEL;
        const betaConfiguration = {
            explicitOnly: [explicitOnlyBeta],
            exclusion: [exclusionBeta],
        };

        // Test explicit only beta behavior
        // Given: Account with 'all' beta enabled, but not the explicit only beta
        Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.ALL]);
        Onyx.set(ONYXKEYS.BETA_CONFIGURATION, betaConfiguration);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePermissions(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        // When: Checking if the account is in the explicit only beta
        // Then: The beta check should return false because explicit-only betas override the 'all' beta
        expect(result.current.isBetaEnabled(explicitOnlyBeta)).toBe(false);

        // Given: The explicit only beta is explicitly enabled
        Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.ALL, explicitOnlyBeta]);
        await waitForBatchedUpdatesWithAct();

        // When: Checking if the account is in the explicit only beta
        // Then: The beta check should return true because the beta is explicitly enabled
        expect(result.current.isBetaEnabled(explicitOnlyBeta)).toBe(true);

        // Test exclusion beta behavior
        // Given: Account with 'all' beta enabled, but not the exclusion beta
        Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.ALL]);
        await waitForBatchedUpdatesWithAct();

        // When: Checking if the account is in the exclusion beta
        // Then: The beta check should return false because exclusion betas are not enabled by 'all' beta
        expect(result.current.isBetaEnabled(exclusionBeta)).toBe(false);

        // Given: The exclusion beta is explicitly enabled
        Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.ALL, exclusionBeta]);
        await waitForBatchedUpdatesWithAct();

        // When: Checking if the account is in the exclusion beta
        // Then: The beta check should return true because the beta is explicitly enabled
        expect(result.current.isBetaEnabled(exclusionBeta)).toBe(true);

        // Given: Neither 'all' nor the exclusion beta are enabled
        Onyx.set(ONYXKEYS.BETAS, []);
        await waitForBatchedUpdatesWithAct();

        // When: Checking if the account is in the exclusion beta
        // Then: The beta check should return false since neither beta is enabled
        expect(result.current.isBetaEnabled(exclusionBeta)).toBe(false);
    });
});
