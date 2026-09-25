import {renderHook} from '@testing-library/react-native';

import OnyxListItemProvider from '@components/OnyxListItemProvider';

import Permissions from '@libs/Permissions';

import CONST from '@src/CONST';
import usePermissions from '@src/hooks/usePermissions';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

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
        const explicitOnlyBeta = CONST.BETAS.ASAP_SUBMIT;
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

    it('should let local beta overrides take precedence over the server-provided betas', async () => {
        // Given: An account with one beta enabled and another disabled
        Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.DEFAULT_ROOMS]);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePermissions(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(true);
        expect(result.current.isBetaEnabled(CONST.BETAS.PER_DIEM)).toBe(false);

        // When: Overrides force-disable the enabled beta and force-enable the disabled one
        Onyx.set(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.DEFAULT_ROOMS]: false, [CONST.BETAS.PER_DIEM]: true});
        await waitForBatchedUpdatesWithAct();

        // Then: The overrides win over the server state, and untouched betas keep their server state
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(false);
        expect(result.current.isBetaEnabled(CONST.BETAS.PER_DIEM)).toBe(true);
        expect(result.current.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL)).toBe(false);

        expect(Permissions.isBetaEnabled(CONST.BETAS.PER_DIEM, [], undefined, undefined)).toBe(false);
        expect(Permissions.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS, [CONST.BETAS.DEFAULT_ROOMS], undefined, undefined)).toBe(true);

        // When: The overrides are cleared
        Onyx.set(ONYXKEYS.BETA_OVERRIDES, null);
        await waitForBatchedUpdatesWithAct();

        // Then: Everything falls back to the server state
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(true);
        expect(result.current.isBetaEnabled(CONST.BETAS.PER_DIEM)).toBe(false);
    });

    it('should force-disable a beta granted by the "all" beta when overridden off', async () => {
        // Given: An account on the 'all' beta
        Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.ALL]);
        await waitForBatchedUpdatesWithAct();

        const {result} = renderHook(() => usePermissions(), {wrapper: Wrapper});
        await waitForBatchedUpdatesWithAct();

        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(true);

        // When: A single beta is overridden off
        Onyx.set(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.DEFAULT_ROOMS]: false});
        await waitForBatchedUpdatesWithAct();

        // Then: That beta is disabled while the others granted by 'all' stay enabled
        expect(result.current.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS)).toBe(false);
        expect(result.current.isBetaEnabled(CONST.BETAS.PREVENT_SPOTNANA_TRAVEL)).toBe(true);
    });

    describe('isBetaEnabledOrUnknown', () => {
        it('should return undefined while the account betas have not loaded yet', async () => {
            // Given: An account whose betas have not arrived from the server yet
            const {result} = renderHook(() => usePermissions(), {wrapper: Wrapper});
            await waitForBatchedUpdatesWithAct();

            // Then: The caller can tell "not loaded" apart from "off", while isBetaEnabled collapses both to false
            expect(result.current.isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING)).toBeUndefined();
            expect(result.current.isBetaEnabled(CONST.BETAS.VENDOR_MATCHING)).toBe(false);
        });

        it('should return false once the betas have loaded without the beta', async () => {
            // Given: An account whose betas have loaded and do not include the beta
            Onyx.set(ONYXKEYS.BETAS, []);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => usePermissions(), {wrapper: Wrapper});
            await waitForBatchedUpdatesWithAct();

            // Then: It resolves to a definite false rather than undefined
            expect(result.current.isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING)).toBe(false);
        });

        it('should return true once the betas have loaded with the beta', async () => {
            // Given: An account whose betas have loaded and include the beta
            Onyx.set(ONYXKEYS.BETAS, [CONST.BETAS.VENDOR_MATCHING]);
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => usePermissions(), {wrapper: Wrapper});
            await waitForBatchedUpdatesWithAct();

            expect(result.current.isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING)).toBe(true);
        });

        it('should apply a local override once the betas have loaded', async () => {
            // Given: An account without the beta that pinned it on locally
            Onyx.set(ONYXKEYS.BETAS, []);
            Onyx.set(ONYXKEYS.BETA_OVERRIDES, {[CONST.BETAS.VENDOR_MATCHING]: true});
            await waitForBatchedUpdatesWithAct();

            const {result} = renderHook(() => usePermissions(), {wrapper: Wrapper});
            await waitForBatchedUpdatesWithAct();

            // Then: The override wins, the same way it does for isBetaEnabled
            expect(result.current.isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING)).toBe(true);
        });
    });
});
