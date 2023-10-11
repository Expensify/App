import Onyx from 'react-native-onyx';
import {measurePerformance} from 'reassure';
import React from 'react';
import {screen} from '@testing-library/react-native';
import ReportScreen from '../../src/pages/home/ReportScreen';

const ONYXKEYS = {
    PERSONAL_DETAILS: 'personalDetails',
    NVP_PRIORITY_MODE: 'nvp_priorityMode',
    SESSION: 'session',
    BETAS: 'betas',
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
    },
    NETWORK: 'network',
};

jest.mock('../../src/hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn(),
    })),
);
jest.mock('../../src/hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
    })),
);

jest.mock('../../src/hooks/useEnvironment', () =>
    jest.fn(() => ({
        environment: 'development',
        environmentURL: 'https://new.expensify.com',
        isProduction: false,
        isDevelopment: true,
    })),
);

jest.mock('../../src/libs/Permissions');
jest.mock('../../src/libs/Navigation/Navigation');
jest.mock('../../src/components/Icon/Expensicons');

// TODO: there are still some problems with navigation mocking
jest.mock('@react-navigation/native');

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        registerStorageEventListener: () => {},
    }),
);

// Initialize the network key for OfflineWithFeedback
beforeEach(() => Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false}));

// Clear out Onyx after each test so that each test starts with a clean slate
afterEach(() => {
    Onyx.clear();
});

test('should render report screen', () => {
    const scenario = async () => {
        await screen.findByTestId('report-actions-list');
        await screen.findByTestId('composer');
    };
    measurePerformance(<ReportScreen />, {scenario});
});
