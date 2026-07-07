/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import {fireEvent, render, screen} from '@testing-library/react-native';

import TestToolMenu from '@components/TestToolMenu';

import MULTIFACTOR_AUTHENTICATION_VALUES from '@libs/MultifactorAuthentication/VALUES';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

const REGISTRATION_STATUS = MULTIFACTOR_AUTHENTICATION_VALUES.REGISTRATION_STATUS;

let mockBiometricStatus = {
    localCredentialID: undefined as string | undefined,
    isCurrentDeviceRegistered: false,
    otherDeviceCount: 0,
    totalDeviceCount: 0,
    registrationStatus: REGISTRATION_STATUS.NEVER_REGISTERED as string,
};

jest.mock('@hooks/useBiometricRegistrationStatus', () => {
    const actual = require('@libs/MultifactorAuthentication/shared/VALUES') as {default: {REGISTRATION_STATUS: Record<string, string>}};
    return {
        __esModule: true,
        default: () => mockBiometricStatus,
        REGISTRATION_STATUS: actual.default.REGISTRATION_STATUS,
    };
});

jest.mock('@hooks/useIsAuthenticated', () => ({
    __esModule: true,
    default: () => true,
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string, params?: Record<string, string | number>) => {
            if (params && 'status' in params) {
                return `${key}:${params.status}`;
            }
            if (params && 'otherDeviceCount' in params) {
                return `${key}:${params.otherDeviceCount}`;
            }
            return key;
        },
    }),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));

jest.mock('@hooks/useSidebarOrderedReports', () => ({
    useSidebarOrderedReportsActions: () => ({clearLHNCache: jest.fn()}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () =>
        new Proxy(
            {},
            {
                get: () => ({}),
            },
        ),
}));

const mockRevokeCredentials = jest.fn().mockResolvedValue({httpStatusCode: 200});
jest.mock('@libs/actions/MultifactorAuthentication', () => ({
    revokeMultifactorAuthenticationCredentials: (...args: unknown[]): Promise<{httpStatusCode: number}> => mockRevokeCredentials(...args) as Promise<{httpStatusCode: number}>,
}));

jest.mock('@libs/ApiUtils', () => ({
    isUsingStagingApi: () => false,
    getCommandURL: () => 'https://test-api.expensify.com/api/Ping?',
}));

const mockExecuteScenario = jest.fn().mockResolvedValue(undefined);
jest.mock('@components/MultifactorAuthentication/Context', () => ({
    useMultifactorAuthentication: () => ({
        executeScenario: mockExecuteScenario,
        cancel: jest.fn(),
        requestCancel: jest.fn(),
        hideCancelConfirm: jest.fn(),
        confirmCancel: jest.fn(),
    }),
}));

const mockDismissModal = jest.fn();
const mockGetActiveRoute = jest.fn(() => '');
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getActiveRoute: () => mockGetActiveRoute(),
        dismissModal: (...args: unknown[]) => mockDismissModal(...args),
    },
}));

jest.mock('@userActions/Network', () => ({
    setShouldFailAllRequests: jest.fn(),
    setShouldForceOffline: jest.fn(),
    setShouldSimulatePoorConnection: jest.fn(),
}));

jest.mock('@userActions/Session', () => ({
    expireSessionWithDelay: jest.fn(),
    invalidateAuthToken: jest.fn(),
    invalidateCredentials: jest.fn(),
}));

jest.mock('@userActions/User', () => ({
    setIsDebugModeEnabled: jest.fn(),
    setShouldUseStagingServer: jest.fn(),
}));

jest.mock('@src/CONFIG', () => ({
    IS_USING_LOCAL_WEB: false,
    EXPENSIFY: {
        DEFAULT_API_ROOT: 'https://www.expensify.com.dev/',
    },
}));

jest.mock('@components/Button', () => {
    const RN = require('react-native');
    const ReactModule = require('react');
    function MockButton({text, onPress}: {text: string; onPress?: () => void}) {
        return ReactModule.createElement(RN.TouchableOpacity, {onPress}, ReactModule.createElement(RN.Text, null, text));
    }
    MockButton.displayName = 'Button';
    return MockButton;
});

jest.mock('@components/Switch', () => {
    function MockSwitch() {
        return null;
    }
    MockSwitch.displayName = 'Switch';
    return MockSwitch;
});

jest.mock('@components/TestToolRow', () => {
    const RN = require('react-native');
    const ReactModule = require('react');
    function MockTestToolRow({title, children}: {title: string; children: React.ReactNode}) {
        return ReactModule.createElement(ReactModule.Fragment, null, ReactModule.createElement(RN.Text, null, title), children);
    }
    MockTestToolRow.displayName = 'TestToolRow';
    return MockTestToolRow;
});

jest.mock('@components/Text', () => {
    const RN = require('react-native');
    const ReactModule = require('react');
    function MockText({children}: {children: React.ReactNode}) {
        return ReactModule.createElement(RN.Text, null, children);
    }
    MockText.displayName = 'Text';
    return MockText;
});

jest.mock('@components/SoftKillTestToolRow', () => {
    function MockSoftKillTestToolRow() {
        return null;
    }
    MockSoftKillTestToolRow.displayName = 'SoftKillTestToolRow';
    return MockSoftKillTestToolRow;
});

jest.mock('@components/TestCrash', () => {
    function MockTestCrash() {
        return null;
    }
    MockTestCrash.displayName = 'TestCrash';
    return MockTestCrash;
});

function setBiometricStatus(overrides: Partial<typeof mockBiometricStatus>) {
    mockBiometricStatus = {
        localCredentialID: undefined,
        isCurrentDeviceRegistered: false,
        otherDeviceCount: 0,
        totalDeviceCount: 0,
        registrationStatus: REGISTRATION_STATUS.NEVER_REGISTERED,
        ...overrides,
    };
}

describe('TestToolMenu biometrics', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders biometrics title with "Never registered" status', () => {
        setBiometricStatus({registrationStatus: REGISTRATION_STATUS.NEVER_REGISTERED});

        render(<TestToolMenu />);

        screen.getByText(/troubleshootBiometricsStatus.*statusNeverRegistered/);
    });

    it('renders biometrics title with "Registered" status when this device is registered', () => {
        setBiometricStatus({
            localCredentialID: 'key-abc',
            isCurrentDeviceRegistered: true,
            registrationStatus: REGISTRATION_STATUS.REGISTERED_THIS_DEVICE,
        });

        render(<TestToolMenu />);

        screen.getByText(/troubleshootBiometricsStatus.*statusRegisteredThisDevice/);
    });

    it('renders biometrics title with other device status', () => {
        setBiometricStatus({
            otherDeviceCount: 2,
            registrationStatus: REGISTRATION_STATUS.REGISTERED_OTHER_DEVICE,
        });

        render(<TestToolMenu />);

        screen.getByText(/troubleshootBiometricsStatus.*statusRegisteredOtherDevice/);
    });

    it('renders biometrics title with "Not registered" status', () => {
        setBiometricStatus({registrationStatus: REGISTRATION_STATUS.NOT_REGISTERED});

        render(<TestToolMenu />);

        screen.getByText(/troubleshootBiometricsStatus.*statusNotRegistered/);
    });

    it('does not show the Revoke button when device is not registered', () => {
        setBiometricStatus({isCurrentDeviceRegistered: false});

        render(<TestToolMenu />);

        expect(screen.queryByText('multifactorAuthentication.revoke.revoke')).toBeNull();
    });

    it('shows the Revoke button when this device is registered with a local key', () => {
        setBiometricStatus({
            localCredentialID: 'key-abc',
            isCurrentDeviceRegistered: true,
            registrationStatus: REGISTRATION_STATUS.REGISTERED_THIS_DEVICE,
        });

        render(<TestToolMenu />);

        screen.getByText('multifactorAuthentication.revoke.revoke');
    });

    it('calls revokeMultifactorAuthenticationCredentials with onlyKeyID when Revoke is pressed', () => {
        setBiometricStatus({
            localCredentialID: 'key-abc',
            isCurrentDeviceRegistered: true,
            registrationStatus: REGISTRATION_STATUS.REGISTERED_THIS_DEVICE,
        });

        render(<TestToolMenu />);

        const revokeButton = screen.getByText('multifactorAuthentication.revoke.revoke');
        fireEvent.press(revokeButton);

        expect(mockRevokeCredentials).toHaveBeenCalledWith({onlyKeyID: 'key-abc'});
    });

    it('always shows the Test button and invokes executeScenario with BIOMETRICS_TEST when pressed', () => {
        setBiometricStatus({registrationStatus: REGISTRATION_STATUS.NEVER_REGISTERED});

        render(<TestToolMenu />);

        const testButton = screen.getByText('multifactorAuthentication.biometricsTest.test');
        fireEvent.press(testButton);

        expect(mockExecuteScenario).toHaveBeenCalledWith(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);
    });

    it('dismisses the Test Tools modal when Test is pressed from inside the modal', () => {
        setBiometricStatus({registrationStatus: REGISTRATION_STATUS.NEVER_REGISTERED});
        mockGetActiveRoute.mockReturnValue(ROUTES.TEST_TOOLS_MODAL.route);

        render(<TestToolMenu />);

        fireEvent.press(screen.getByText('multifactorAuthentication.biometricsTest.test'));

        expect(mockDismissModal).toHaveBeenCalledTimes(1);
        expect(mockExecuteScenario).toHaveBeenCalledWith(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);
    });

    it('does not dismiss any modal when Test is pressed inline on the Troubleshoot page', () => {
        setBiometricStatus({registrationStatus: REGISTRATION_STATUS.NEVER_REGISTERED});
        mockGetActiveRoute.mockReturnValue(ROUTES.SETTINGS_TROUBLESHOOT);

        render(<TestToolMenu />);

        fireEvent.press(screen.getByText('multifactorAuthentication.biometricsTest.test'));

        expect(mockDismissModal).not.toHaveBeenCalled();
        expect(mockExecuteScenario).toHaveBeenCalledWith(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);
    });
});
