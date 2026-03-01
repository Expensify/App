import Onyx from 'react-native-onyx';
import appSetup from '@src/setup';

jest.mock('array.prototype.tosorted', () => ({
    __esModule: true,
    default: {
        shim: jest.fn(),
    },
}));

jest.mock('react-native', () => ({
    I18nManager: {
        allowRTL: jest.fn(),
        forceRTL: jest.fn(),
    },
}));

jest.mock('react-native-config', () => ({}));

jest.mock('react-native-onyx', () => ({
    __esModule: true,
    default: {
        init: jest.fn(),
    },
}));

jest.mock('@libs/IntlPolyfill', () => jest.fn());
jest.mock('@userActions/Device', () => ({
    setDeviceID: jest.fn(),
}));
jest.mock('@userActions/OnyxDerived', () => jest.fn());
jest.mock('@src/setup/addUtilsToWindow', () => jest.fn());
jest.mock('@src/setup/platformSetup', () => jest.fn());
jest.mock('@src/setup/telemetry', () => jest.fn());

describe('appSetup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize Onyx with snapshotMergeKeys for pending state propagation', () => {
        appSetup();

        expect(Onyx.init).toHaveBeenCalledWith(
            expect.objectContaining({
                snapshotMergeKeys: ['pendingAction', 'pendingFields'],
            }),
        );
    });
});
