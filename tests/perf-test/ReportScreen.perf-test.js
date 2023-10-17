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
        translate: (text) => text,
    })),
);
jest.mock('../../src/hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
    })),
);

jest.mock('../../src/hooks/useKeyboardState', () =>
    jest.fn(() => ({
        isKeyboardShown: false,
    })),
);

jest.mock('../../src/hooks/useWindowDimensions', () =>
    jest.fn(() => ({
        windowHeight: 1000,
        isSmallScreenWidth: false,
        isMediumScreenWidth: false,
        isLargeScreenWidth: false,
    })),
);

jest.mock('../../src/components/withLocalize', () => (Component) => (props) => (
    <Component
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        translate={(text) => text}
    />
));

jest.mock('../../src/components/withWindowDimensions', () => (Component) => (props) => (
    <Component
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        windowHeight={1000}
        isSmallScreenWidth={false}
        isMediumScreenWidth={false}
        isLargeScreenWidth={false}
    />
));

jest.mock('../../src/components/withKeyboardState', () => (Component) => (props) => (
    <Component
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        isKeyboardShown={false}
    />
));

jest.mock('../../src/hooks/useEnvironment', () =>
    jest.fn(() => ({
        environment: 'development',
        environmentURL: 'https://new.expensify.com',
        isProduction: false,
        isDevelopment: true,
    })),
);

jest.mock('../../src/libs/Permissions', () => ({
    canUseTasks: jest.fn(() => true),
}));

jest.mock('../../src/libs/Navigation/Navigation');
jest.mock('../../src/components/Icon/Expensicons');

const mockedNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => ({
            navigate: mockedNavigate,
        }),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: jest.fn(),
        }),
        createNavigationContainerRef: jest.fn(),
    };
});

// mock PortalStateContext
jest.mock('@gorhom/portal');

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
        safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        registerStorageEventListener: () => {
        },
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
    measurePerformance(<ReportScreen/>, {scenario});
});
