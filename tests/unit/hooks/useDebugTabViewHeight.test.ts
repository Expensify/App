import {renderHook} from '@testing-library/react-native';

import {useDebugTabViewHeight} from '@components/Navigation/DebugTabView';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

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
                    phoneNumber: CONST.ERROR.API_EXCEPTION,
                },
            },
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useDebugTabViewHeight());

        expect(result.current).toBe(0);
    });
});
