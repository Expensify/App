import {act, renderHook} from '@testing-library/react-native';
// eslint-disable-next-line @typescript-eslint/naming-convention
import useBiometricRegistrationStatus from '@hooks/useBiometricRegistrationStatus';
import MULTIFACTOR_AUTHENTICATION_VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';

const REGISTRATION_STATUS = MULTIFACTOR_AUTHENTICATION_VALUES.REGISTRATION_STATUS;

let mockGetLocalPublicKey: jest.Mock;
let mockServerKnownCredentialIDs: string[];
let mockHaveCredentialsEverBeenConfigured: boolean;

jest.mock('@components/MultifactorAuthentication/Context/useNativeBiometrics', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        getLocalPublicKey: mockGetLocalPublicKey,
        serverKnownCredentialIDs: mockServerKnownCredentialIDs,
        haveCredentialsEverBeenConfigured: mockHaveCredentialsEverBeenConfigured,
    }),
}));

function resetMocks({
    localPublicKey = undefined as string | undefined,
    serverKnownCredentialIDs = [] as string[],
    haveCredentialsEverBeenConfigured = false,
}: {
    localPublicKey?: string | undefined;
    serverKnownCredentialIDs?: string[];
    haveCredentialsEverBeenConfigured?: boolean;
} = {}) {
    mockGetLocalPublicKey = jest.fn().mockResolvedValue(localPublicKey);
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
            await act(async () => {});

            expect(result.current.registrationStatus).toBe(REGISTRATION_STATUS.NEVER_REGISTERED);
        });

        it('returns NOT_REGISTERED when credentials were configured but no devices exist', async () => {
            resetMocks({
                haveCredentialsEverBeenConfigured: true,
                serverKnownCredentialIDs: [],
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());
            await act(async () => {});

            expect(result.current.registrationStatus).toBe(REGISTRATION_STATUS.NOT_REGISTERED);
        });

        it('returns REGISTERED_THIS_DEVICE when the local key is in the server list', async () => {
            resetMocks({
                localPublicKey: 'local-key-abc',
                serverKnownCredentialIDs: ['local-key-abc'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());
            await act(async () => {});

            expect(result.current.registrationStatus).toBe(REGISTRATION_STATUS.REGISTERED_THIS_DEVICE);
        });

        it('returns REGISTERED_OTHER_DEVICE when devices exist but local key is not among them', async () => {
            resetMocks({
                localPublicKey: 'local-key-abc',
                serverKnownCredentialIDs: ['other-key-xyz'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());
            await act(async () => {});

            expect(result.current.registrationStatus).toBe(REGISTRATION_STATUS.REGISTERED_OTHER_DEVICE);
        });

        it('returns REGISTERED_OTHER_DEVICE when local key is undefined and devices exist', async () => {
            resetMocks({
                localPublicKey: undefined,
                serverKnownCredentialIDs: ['other-key-xyz'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());
            await act(async () => {});

            expect(result.current.registrationStatus).toBe(REGISTRATION_STATUS.REGISTERED_OTHER_DEVICE);
        });
    });

    describe('computed values', () => {
        it('sets isCurrentDeviceRegistered to true when local key matches a server key', async () => {
            resetMocks({
                localPublicKey: 'my-key',
                serverKnownCredentialIDs: ['my-key', 'other-key'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());
            await act(async () => {});

            expect(result.current.isCurrentDeviceRegistered).toBe(true);
            expect(result.current.totalDeviceCount).toBe(2);
            expect(result.current.otherDeviceCount).toBe(1);
        });

        it('sets isCurrentDeviceRegistered to false when local key is undefined', async () => {
            resetMocks({
                localPublicKey: undefined,
                serverKnownCredentialIDs: ['other-key'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());
            await act(async () => {});

            expect(result.current.isCurrentDeviceRegistered).toBe(false);
            expect(result.current.totalDeviceCount).toBe(1);
            expect(result.current.otherDeviceCount).toBe(1);
        });

        it('sets isCurrentDeviceRegistered to false when local key does not match any server key', async () => {
            resetMocks({
                localPublicKey: 'unknown-key',
                serverKnownCredentialIDs: ['other-key'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());
            await act(async () => {});

            expect(result.current.isCurrentDeviceRegistered).toBe(false);
            expect(result.current.otherDeviceCount).toBe(1);
        });

        it('returns zero counts when no credentials exist', async () => {
            resetMocks({
                serverKnownCredentialIDs: [],
                haveCredentialsEverBeenConfigured: false,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());
            await act(async () => {});

            expect(result.current.totalDeviceCount).toBe(0);
            expect(result.current.otherDeviceCount).toBe(0);
            expect(result.current.isCurrentDeviceRegistered).toBe(false);
        });

        it('returns the local public key after async resolution', async () => {
            resetMocks({
                localPublicKey: 'resolved-key',
                serverKnownCredentialIDs: ['resolved-key'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());
            await act(async () => {});

            expect(result.current.localPublicKey).toBe('resolved-key');
        });
    });

    describe('initial state before async resolution', () => {
        it('localPublicKey is undefined before getLocalPublicKey resolves', () => {
            resetMocks({
                localPublicKey: 'pending-key',
                serverKnownCredentialIDs: ['pending-key'],
                haveCredentialsEverBeenConfigured: true,
            });

            const {result} = renderHook(() => useBiometricRegistrationStatus());

            expect(result.current.localPublicKey).toBeUndefined();
        });
    });
});
