import StrictModeMountGate from '@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigatorComponent/ScreenActivityWrapper/StrictModeMountGate';

import renderGate from '../../../../utils/StrictModeMountGateTestUtils';

// The gate picks its implementation at module load, so the flag has to be mocked before the import above runs.
jest.mock('@src/CONFIG', () => ({__esModule: true, default: {USE_ACTIVITY_SCREEN_STRICT_MODE_IN_DEV: false}}));

describe('StrictModeMountGate', () => {
    it('falls back to the pass-through gate when the development flag is off, so child effects run only once', () => {
        expect(renderGate(StrictModeMountGate)).toEqual(['effect']);
    });
});
