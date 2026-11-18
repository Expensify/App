import {renderHook, waitFor} from '@testing-library/react-native';

import {getContactPermission} from '@libs/ContactPermission';
import useContactPermissions from '@libs/ContactPermission/useContactPermissions';

import type {AppStateStatus} from 'react-native';

import {RESULTS} from 'react-native-permissions';

jest.mock('@libs/ContactPermission', () => ({
    getContactPermission: jest.fn(),
}));

let mockOnAppStateChange: ((nextAppState: AppStateStatus) => void) | undefined;
jest.mock('@hooks/useAppState', () => ({
    __esModule: true,
    default: ({onAppStateChange}: {onAppStateChange?: (nextAppState: AppStateStatus) => void}) => {
        mockOnAppStateChange = onAppStateChange;
        return {isForeground: true, isInactive: false, isBackground: false};
    },
}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (callback: () => undefined | (() => void)) => {
        jest.requireActual<{useEffect: (effect: () => undefined | (() => void), deps: unknown[]) => void}>('react').useEffect(callback, []);
    },
}));

const mockGetContactPermission = jest.mocked(getContactPermission);

function renderContactPermissions() {
    const params = {importAndSaveContacts: jest.fn(), setContacts: jest.fn(), contactPermissionState: RESULTS.DENIED, setContactPermissionState: jest.fn()};
    renderHook(() => useContactPermissions(params));
    return params;
}

describe('useContactPermissions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('imports the picked contacts when the app comes back with limited contact access', async () => {
        // Given contact access isn't decided yet when the page opens
        mockGetContactPermission.mockResolvedValue(RESULTS.DENIED);
        const params = renderContactPermissions();
        await waitFor(() => expect(mockGetContactPermission).toHaveBeenCalled());
        expect(params.importAndSaveContacts).not.toHaveBeenCalled();

        // When the user picks some contacts in the iOS prompt and the app becomes active again
        mockGetContactPermission.mockResolvedValue(RESULTS.LIMITED);
        mockOnAppStateChange?.('active');

        // Then the picked contacts are imported, since limited access counts as granted
        await waitFor(() => expect(params.importAndSaveContacts).toHaveBeenCalledTimes(1));
    });
});
