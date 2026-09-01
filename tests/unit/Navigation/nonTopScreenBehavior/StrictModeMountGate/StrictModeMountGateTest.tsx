import StrictModeMountGate from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/StrictModeMountGate';

import renderGate from '../../../../utils/StrictModeMountGateTestUtils';

// The gate picks its implementation at module load, so the flag has to be mocked before the import above runs.
jest.mock('@src/CONFIG', () => ({__esModule: true, default: {USE_ACTIVITY_SCREEN_STRICT_MODE_IN_DEV: true}}));

describe('StrictModeMountGate', () => {
    it('mounts the children into an already committed StrictMode, so their effects run the full effect, cleanup, effect cycle', () => {
        // Given the gate loaded with the development flag on
        // When children that record their effect cycle are mounted through it
        // Then their effects run twice around a cleanup, which is what surfaces effects that break when a screen is revealed again
        expect(renderGate(StrictModeMountGate)).toEqual(['effect', 'cleanup', 'effect']);
    });
});
