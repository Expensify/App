import {renderHook} from '@testing-library/react-native';

import {getSettingsMessage, getSettingsRoute, useDebugTabViewHeight} from '@components/Navigation/DebugTabView';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import createMock from '../../utils/createMock';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe('useDebugTabViewHeight', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        jest.clearAllMocks();
        jest.mocked(useResponsiveLayout).mockReturnValue(
            createMock<ReturnType<typeof useResponsiveLayout>>({
                shouldUseNarrowLayout: false,
            }),
        );
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('maps UK fuel VAT errors to a localized message and the affected workspace settings', () => {
        // Given a fuel VAT indicator associated with a specific workspace
        const status = CONST.INDICATOR_STATUS.HAS_UK_FUEL_RATE_TAX_ERROR;
        const policyID = 'fuelWorkspace';

        // When either Settings or Workspaces resolves the debug banner content and destination
        const message = getSettingsMessage(status);
        const route = getSettingsRoute(status, undefined, policyID);

        // Then the banner is not hidden and View opens the warning's settings, without changing the generic custom-unit route
        expect(message).toBe('debug.indicatorStatus.theresAWorkspaceWithCustomUnitsErrors');
        expect(route).toBe(ROUTES.WORKSPACE_DISTANCE_RATES_SETTINGS.getRoute(policyID));
        expect(getSettingsRoute(CONST.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR, undefined, policyID)).toBe(ROUTES.WORKSPACE_DISTANCE_RATES.getRoute(policyID));
    });

    it('returns debugTabViewHeight on wide layout with debug mode and a mapped indicator status', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.IS_DEBUG_MODE_ENABLED]: true,
            [ONYXKEYS.LOGINS]: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1_foo@bar.com': {
                    partnerID: 1,
                    partnerUserID: 'foo@bar.com',
                    errorFields: {
                        addedLogin: {
                            message: 'Partner name is missing!',
                        },
                    },
                },
            },
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDebugTabViewHeight());

        expect(result.current).toBe(variables.debugTabViewHeight);
    });

    it('returns 0 when debug mode is off', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.IS_DEBUG_MODE_ENABLED]: false,
            [ONYXKEYS.LOGINS]: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1_foo@bar.com': {
                    partnerID: 1,
                    partnerUserID: 'foo@bar.com',
                    errorFields: {
                        addedLogin: {
                            message: 'Partner name is missing!',
                        },
                    },
                },
            },
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDebugTabViewHeight());

        expect(result.current).toBe(0);
    });

    it('returns 0 on narrow layout', async () => {
        jest.mocked(useResponsiveLayout).mockReturnValue(
            createMock<ReturnType<typeof useResponsiveLayout>>({
                shouldUseNarrowLayout: true,
            }),
        );

        await Onyx.multiSet({
            [ONYXKEYS.IS_DEBUG_MODE_ENABLED]: true,
            [ONYXKEYS.LOGINS]: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '1_foo@bar.com': {
                    partnerID: 1,
                    partnerUserID: 'foo@bar.com',
                    errorFields: {
                        addedLogin: {
                            message: 'Partner name is missing!',
                        },
                    },
                },
            },
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDebugTabViewHeight());

        expect(result.current).toBe(0);
    });

    it('returns 0 for a truthy status with no mapped debug message', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.IS_DEBUG_MODE_ENABLED]: true,
            [ONYXKEYS.PRIVATE_PERSONAL_DETAILS]: {
                errorFields: {
                    phoneNumber: {error: 'Invalid phone number'},
                },
            },
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDebugTabViewHeight());

        expect(getSettingsMessage(CONST.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR)).toBeUndefined();
        expect(result.current).toBe(0);
    });
});
