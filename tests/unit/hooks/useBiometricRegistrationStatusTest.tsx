import {renderHook, waitFor} from '@testing-library/react-native';
// eslint-disable-next-line @typescript-eslint/naming-convention
import useBiometricRegistrationStatus from '@hooks/useBiometricRegistrationStatus';
import MULTIFACTOR_AUTHENTICATION_VALUES from '@libs/MultifactorAuthentication/VALUES';

const REGISTRATION_STATUS = MULTIFACTOR_AUTHENTICATION_VALUES.REGISTRATION_STATUS;

let mockGetLocalCredentialID: jest.Mock;
let mockServerKnownCredentialIDs: string[];
let mockHaveCredentialsEverBeenConfigured: boolean;

jest.mock('@components/MultifactorAuthentication/biometrics/useBiometrics', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        getLocalCredentialID: mockGetLocalCredentialID,
        serverKnownCredentialIDs: mockServerKnownCredentialIDs,
        haveCredentialsEverBeenConfigured: mockHaveCredentialsEverBeenConfigured,
    }),
}));

function resetMocks({
    localCredentialID = undefined as string | undefined,
    serverKnownCredentialIDs = [] as string[],
    haveCredentialsEverBeenConfigured = false,
}: {
    localCredentialID?: string | undefined;
    serverKnownCredentialIDs?: string[];
    haveCredentialsEverBeenConfigured?: boolean;
} = {}) {
    mockGetLocalCredentialID = jest.fn().mockResolvedValue(localCredentialID);
    mockServerKnownCredentialIDs = serverKnownCredentialIDs;
    mockHaveCredentialsEverBeenConfigured = haveCredentialsEverBeenConfigured;
}

describe('useBiometricRegistrationStatus', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registrationStatus', () => {
        it('returns NEVER_REGISTERED when credentials have never been configured', async () => {
            resetMocks({haveCredentialsEverBeenConfigured: false});

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            await waitFor(() => {
                expect(result.current.registrationStatus).toBe(REGISTRATION_STATUS.NEVER_REGISTERED);
            });
        });

        it('returns NOT_REGISTERED when credentials were configured but no devices exist', async () => {
            resetMocks({
                haveCredentialsEverBeenConfigured: true,
                serverKnownCredentialIDs: [],
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            await waitFor(() => {
                expect(result.current.registrationStatus).toBe(REGISTRATION_STATUS.NOT_REGISTERED);
            });
        });

        it('returns REGISTERED_THIS_DEVICE when the local key is in the server list', async () => {
            resetMocks({
                localCredentialID: 'local-key-abc',
                serverKnownCredentialIDs: ['local-key-abc'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            await waitFor(() => {
                expect(result.current.registrationStatus).toBe(REGISTRATION_STATUS.REGISTERED_THIS_DEVICE);
            });
        });

        it('returns REGISTERED_OTHER_DEVICE when devices exist but local key is not among them', async () => {
            resetMocks({
                localCredentialID: 'local-key-abc',
                serverKnownCredentialIDs: ['other-key-xyz'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            await waitFor(() => {
                expect(result.current.registrationStatus).toBe(REGISTRATION_STATUS.REGISTERED_OTHER_DEVICE);
            });
        });

        it('returns REGISTERED_OTHER_DEVICE when local key is undefined and devices exist', async () => {
            resetMocks({
                localCredentialID: undefined,
                serverKnownCredentialIDs: ['other-key-xyz'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            await waitFor(() => {
                expect(result.current.registrationStatus).toBe(REGISTRATION_STATUS.REGISTERED_OTHER_DEVICE);
            });
        });
    });

    describe('computed values', () => {
        it('sets isCurrentDeviceRegistered to true when local key matches a server key', async () => {
            resetMocks({
                localCredentialID: 'my-key',
                serverKnownCredentialIDs: ['my-key', 'other-key'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            await waitFor(() => {
                expect(result.current.isCurrentDeviceRegistered).toBe(true);
            });
            expect(result.current.totalDeviceCount).toBe(2);
            expect(result.current.otherDeviceCount).toBe(1);
        });

        it('sets isCurrentDeviceRegistered to false when local key is undefined', async () => {
            resetMocks({
                localCredentialID: undefined,
                serverKnownCredentialIDs: ['other-key'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            await waitFor(() => {
                expect(result.current.isCurrentDeviceRegistered).toBe(false);
            });
            expect(result.current.totalDeviceCount).toBe(1);
            expect(result.current.otherDeviceCount).toBe(1);
        });

        it('sets isCurrentDeviceRegistered to false when local key does not match any server key', async () => {
            resetMocks({
                localCredentialID: 'unknown-key',
                serverKnownCredentialIDs: ['other-key'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            await waitFor(() => {
                expect(result.current.isCurrentDeviceRegistered).toBe(false);
            });
            expect(result.current.otherDeviceCount).toBe(1);
        });

        it('returns zero counts when no credentials exist', async () => {
            resetMocks({
                serverKnownCredentialIDs: [],
                haveCredentialsEverBeenConfigured: false,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            await waitFor(() => {
                expect(result.current.totalDeviceCount).toBe(0);
            });
            expect(result.current.otherDeviceCount).toBe(0);
            expect(result.current.isCurrentDeviceRegistered).toBe(false);
        });

        it('returns the local public key after async resolution', async () => {
            resetMocks({
                localCredentialID: 'resolved-key',
                serverKnownCredentialIDs: ['resolved-key'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            await waitFor(() => {
                expect(result.current.localCredentialID).toBe('resolved-key');
            });
        });
    });

    describe('initial state before async resolution', () => {
        it('localCredentialID is undefined before getLocalCredentialID resolves', () => {
            resetMocks({
                localCredentialID: 'pending-key',
                serverKnownCredentialIDs: ['pending-key'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            expect(result.current.localCredentialID).toBeUndefined();
        });
    });
});
