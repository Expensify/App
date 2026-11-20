import {renderHook, waitFor} from '@testing-library/react-native';

import useContactImport from '@hooks/useContactImport';

import contactImport from '@libs/ContactImport';
import type {DeviceContact} from '@libs/ContactImport/types';
import {getContactPermission} from '@libs/ContactPermission';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as NativeNavigation from '@react-navigation/native';
import type React from 'react';
import type {AppStateStatus} from 'react-native';
import type {PermissionStatus} from 'react-native-permissions';

import Onyx from 'react-native-onyx';
import {RESULTS} from 'react-native-permissions';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

jest.mock('@libs/ContactImport', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/ContactPermission', () => ({
    getContactPermission: jest.fn(),
    requestContactPermission: jest.fn(),
}));

let mockOnAppStateChange: ((nextAppState: AppStateStatus) => void) | undefined;
jest.mock('@hooks/useAppState', () => ({
    __esModule: true,
    default: ({onAppStateChange}: {onAppStateChange?: (nextAppState: AppStateStatus) => void}) => {
        mockOnAppStateChange = onAppStateChange;
        return {isForeground: true, isInactive: false, isBackground: false};
    },
}));

// Like React Navigation on a focused screen: the effect runs on focus and again whenever the callback changes
jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    const {useEffect} = jest.requireActual<typeof React>('react');
    return {
        ...actualNavigation,
        useFocusEffect: (callback: () => undefined | (() => void)) => {
            useEffect(callback, [callback]);
        },
    };
});

const mockContactImport = jest.mocked(contactImport);
const mockGetContactPermission = jest.mocked(getContactPermission);

const deviceContacts: DeviceContact[] = [{firstName: 'Fake', lastName: 'One', phoneNumbers: [{value: '+1 201 555 0123'}]}];

function givenContactAccess(status: PermissionStatus) {
    mockGetContactPermission.mockResolvedValue(status);
    const isGranted = status === RESULTS.GRANTED || status === RESULTS.LIMITED;
    mockContactImport.mockResolvedValue({contactList: isGranted ? deviceContacts : [], permissionStatus: status});
}

describe('useContactImport', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        // Every input of the import is ready before the screen renders, as in the app, so only a change of the contact
        // access status could make the focus effect run again. The default locale context is used for the same reason.
        await Onyx.set(ONYXKEYS.COUNTRY_CODE, 1);
        await waitForBatchedUpdates();
    });

    it('imports the device contacts once when the screen gains focus with contact access', async () => {
        // Given the user has given access to their contacts
        givenContactAccess(RESULTS.GRANTED);

        // When a screen that lists contacts gains focus
        const {result} = renderHook(() => useContactImport());
        await waitFor(() => expect(result.current.contacts).toHaveLength(1));
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        // Then the contacts are read and their rows built once, and the status shows the access
        expect(mockContactImport).toHaveBeenCalledTimes(1);
        expect(result.current.contactPermissionState).toBe(RESULTS.GRANTED);
        expect(result.current.contacts.at(0)?.login).toBe('+12015550123@expensify.sms');
    });

    it('imports the device contacts once more when the app returns to the foreground', async () => {
        // Given a screen that already imported the contacts when it gained focus
        givenContactAccess(RESULTS.GRANTED);
        const {result} = renderHook(() => useContactImport());
        await waitFor(() => expect(result.current.contacts).toHaveLength(1));
        await waitForBatchedUpdates();
        const importsOnFocus = mockContactImport.mock.calls.length;

        // When the app returns to the foreground
        mockOnAppStateChange?.('active');
        await waitForBatchedUpdates();
        await waitForBatchedUpdates();

        // Then the contacts are imported exactly once more, to pick up changes made in the address book
        expect(mockContactImport).toHaveBeenCalledTimes(importsOnFocus + 1);
        expect(result.current.contacts).toHaveLength(1);
    });

    it('lists no device contacts and keeps the status when contact access is not given', async () => {
        // Given the user hasn't given access to their contacts
        givenContactAccess(RESULTS.BLOCKED);

        // When a screen that lists contacts gains focus
        const {result} = renderHook(() => useContactImport());

        // Then the status is set, the contacts aren't read and no contact is listed
        await waitFor(() => expect(result.current.contactPermissionState).toBe(RESULTS.BLOCKED));
        await waitForBatchedUpdates();
        expect(mockContactImport).not.toHaveBeenCalled();
        expect(result.current.contacts).toHaveLength(0);
    });

    it('clears the contacts when access is turned off while the app is in the background', async () => {
        // Given a screen that imported the contacts with access given
        givenContactAccess(RESULTS.GRANTED);
        const {result} = renderHook(() => useContactImport());
        await waitFor(() => expect(result.current.contacts).toHaveLength(1));

        // When the user turns off contact access in Settings and returns to the app
        givenContactAccess(RESULTS.BLOCKED);
        mockOnAppStateChange?.('active');

        // Then the contacts are cleared and the new status is set
        await waitFor(() => expect(result.current.contactPermissionState).toBe(RESULTS.BLOCKED));
        expect(result.current.contacts).toHaveLength(0);
    });
});
