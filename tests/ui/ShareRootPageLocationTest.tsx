import {act, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import getCurrentPosition from '@libs/getCurrentPosition';

import ShareRootPage from '@pages/Share/ShareRootPage';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {UserLocation} from '@src/types/onyx';

import type {AppStateStatus} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
import {AppState} from 'react-native';
import Onyx from 'react-native-onyx';
import {check} from 'react-native-permissions';

import type * as FileUtilsModule from '../../src/libs/fileDownload/FileUtils';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

type SharedFile = {id: string; content: string; mimeType: string; processedAt: string; aspectRatio: number};

// The file the mocked native share handler hands back. The `mock` prefix lets the hoisted jest.mock factory read it.
let mockSharedFiles: SharedFile[] = [];

jest.mock('@libs/ShareActionHandlerModule', () => ({
    __esModule: true,
    default: {
        processFiles: jest.fn((callback: (files: SharedFile[]) => void) => callback(mockSharedFiles)),
    },
}));

jest.mock('@libs/getCurrentPosition', () => jest.fn());

jest.mock('@libs/fileDownload/FileUtils', () => {
    const actual = jest.requireActual<typeof FileUtilsModule>('@libs/fileDownload/FileUtils');
    return {
        ...actual,
        validateImageForCorruption: jest.fn(() => Promise.resolve()),
    };
});

jest.mock('@pages/Share/getFileSize', () => jest.fn(() => Promise.resolve(10000)));

jest.mock('@hooks/useFilesValidation', () => jest.fn(() => ({validateFiles: jest.fn()})));

// Mock the tabs, header, and screen wrapper to test what happens when the page processes a shared file.
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/Skeletons/TabNavigatorSkeleton', () => () => null);
jest.mock('@libs/Navigation/OnyxTabNavigator', () => ({
    __esModule: true,
    default: () => null,
    TopTab: {Screen: () => null},
}));
jest.mock('@pages/Share/ShareTab', () => () => null);
jest.mock('@pages/Share/SubmitTab', () => () => null);

const DEVICE_POSITION = {latitude: 52.2297, longitude: 21.0122};
// Where the device is when a later share arrives, distinct from DEVICE_POSITION.
const NEW_DEVICE_POSITION = {latitude: 50.0647, longitude: 19.945};

function createSharedFile(content: string, mimeType: string): SharedFile {
    return {id: 'shared-file-1', content, mimeType, processedAt: '0', aspectRatio: 1};
}

function mockPositionAnswer(position: UserLocation = DEVICE_POSITION) {
    jest.mocked(getCurrentPosition).mockImplementation(async (success) => {
        success({
            coords: {
                latitude: position.latitude,
                longitude: position.longitude,
                altitude: null,
                accuracy: null,
                altitudeAccuracy: null,
                heading: null,
                speed: null,
            },
            timestamp: 0,
        });
    });
}

function getUserLocationFromOnyx(): Promise<OnyxEntry<UserLocation>> {
    return new Promise((resolve) => {
        const connection = Onyx.connect({
            key: ONYXKEYS.USER_LOCATION,
            callback: (value) => {
                resolve(value);
                connection.unsubscribe();
            },
        });
    });
}

// Captures the AppState listener the page registers, so a test can replay the app leaving and returning to the foreground.
function captureAppStateListener(): (state: AppStateStatus) => void {
    let listener: ((state: AppStateStatus) => void) | undefined;
    jest.spyOn(AppState, 'addEventListener').mockImplementation((type, handler) => {
        listener = handler;
        return {remove: jest.fn()};
    });
    return (state) => listener?.(state);
}

async function returnToForeground(emitAppState: (state: AppStateStatus) => void) {
    await act(async () => {
        emitAppState('background');
        emitAppState('active');
    });
    await waitForBatchedUpdatesWithAct();
}

async function renderShareRootPage() {
    render(
        <LocaleContextProvider>
            <ShareRootPage />
        </LocaleContextProvider>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('ShareRootPage location snapshot', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockPositionAnswer();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('caches the device position as soon as a receipt file is shared', async () => {
        // Given a shared image that can become a receipt, and location permission already granted
        mockSharedFiles = [createSharedFile('file:///shared/receipt.jpg', CONST.RECEIPT_ALLOWED_FILE_TYPES.JPEG)];

        // When the share root processes the file
        await renderShareRootPage();

        // Then the device position is cached before a recipient is selected, ready for submission
        expect(getCurrentPosition).toHaveBeenCalledTimes(1);
        expect(await getUserLocationFromOnyx()).toEqual(DEVICE_POSITION);
    });

    it('does not read the location for a file that cannot become a receipt', async () => {
        // Given a shared video, which only offers the Share tab, so the Submit flow is unreachable
        mockSharedFiles = [createSharedFile('file:///shared/clip.mp4', CONST.SHARE_FILE_MIMETYPE.MP4)];

        // When the share root processes the file
        await renderShareRootPage();

        // Then the device location is never read, since no expense can use it
        expect(check).not.toHaveBeenCalled();
        expect(getCurrentPosition).not.toHaveBeenCalled();
    });

    it('does not read the location when the permission is not granted, so sharing never prompts for it', async () => {
        // Given a shared receipt image and a location permission the user has not granted
        mockSharedFiles = [createSharedFile('file:///shared/receipt.jpg', CONST.RECEIPT_ALLOWED_FILE_TYPES.JPEG)];
        jest.mocked(check).mockResolvedValueOnce('denied');

        // When the share root processes the file
        await renderShareRootPage();

        // Then getCurrentPosition is skipped so processing the share does not request location permission
        expect(getCurrentPosition).not.toHaveBeenCalled();
        expect(await getUserLocationFromOnyx()).toBeUndefined();
    });

    it('clears stale cached location when the permission is not granted', async () => {
        // Given a stale cached location and a location permission the user has not granted
        await Onyx.set(ONYXKEYS.USER_LOCATION, DEVICE_POSITION);
        mockSharedFiles = [createSharedFile('file:///shared/receipt.jpg', CONST.RECEIPT_ALLOWED_FILE_TYPES.JPEG)];
        jest.mocked(check).mockResolvedValueOnce('denied');

        // When the share root processes the file
        await renderShareRootPage();

        // Then the device location is never read and the stale position is cleared from cache
        expect(getCurrentPosition).not.toHaveBeenCalled();
        expect(await getUserLocationFromOnyx()).toBeUndefined();
    });

    it('caches nothing and raises nothing when the permission check fails', async () => {
        // Given a shared receipt image and a device whose location permission check fails outright
        mockSharedFiles = [createSharedFile('file:///shared/receipt.jpg', CONST.RECEIPT_ALLOWED_FILE_TYPES.JPEG)];
        jest.mocked(check).mockRejectedValueOnce(new Error('permission check failed'));
        const unhandledRejection = jest.fn();
        process.on('unhandledRejection', unhandledRejection);

        // When the share root processes the file
        await renderShareRootPage();
        process.off('unhandledRejection', unhandledRejection);

        // Then no position is cached, and the failed check never surfaces as an unhandled rejection
        expect(getCurrentPosition).not.toHaveBeenCalled();
        expect(await getUserLocationFromOnyx()).toBeUndefined();
        expect(unhandledRejection).not.toHaveBeenCalled();
    });

    it('reads a fresh position when another share reuses the same file path while the page stays mounted', async () => {
        // Given a shared receipt whose position the share root already cached
        const emitAppState = captureAppStateListener();
        mockSharedFiles = [createSharedFile('file:///shared/shared_image.png', CONST.RECEIPT_ALLOWED_FILE_TYPES.PNG)];
        await renderShareRootPage();
        expect(await getUserLocationFromOnyx()).toEqual(DEVICE_POSITION);

        // When the user moves and shares another image at the same path, then returns to the app
        // (iOS saves image data as shared_image.png; Android uses the display name)
        mockPositionAnswer(NEW_DEVICE_POSITION);
        mockSharedFiles = [createSharedFile('file:///shared/shared_image.png', CONST.RECEIPT_ALLOWED_FILE_TYPES.PNG)];
        await returnToForeground(emitAppState);

        // Then the cache contains the new position for this share. Reused file paths must still refresh the
        // location so a new expense does not use coordinates from an earlier share.
        expect(getCurrentPosition).toHaveBeenCalledTimes(2);
        expect(await getUserLocationFromOnyx()).toEqual(NEW_DEVICE_POSITION);
    });
});
