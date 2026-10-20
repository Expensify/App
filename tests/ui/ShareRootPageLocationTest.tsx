import {render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import getCurrentPosition from '@libs/getCurrentPosition';

import ShareRootPage from '@pages/Share/ShareRootPage';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {UserLocation} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
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

// Isolate the page from the tab contents and the screen chrome: these tests only cover what processing a shared file triggers.
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

function createSharedFile(content: string, mimeType: string): SharedFile {
    return {id: 'shared-file-1', content, mimeType, processedAt: '0', aspectRatio: 1};
}

function mockPositionAnswer() {
    jest.mocked(getCurrentPosition).mockImplementation(async (success) => {
        success({
            coords: {
                latitude: DEVICE_POSITION.latitude,
                longitude: DEVICE_POSITION.longitude,
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
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
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

    afterEach(async () => {
        await Onyx.clear();
    });

    it('caches the device position as soon as a receipt file is shared', async () => {
        // Given a shared image that can become a receipt, and location permission already granted
        mockSharedFiles = [createSharedFile('file:///shared/receipt.jpg', CONST.RECEIPT_ALLOWED_FILE_TYPES.JPEG)];

        // When the share root processes the file
        await renderShareRootPage();

        // Then the position is cached before the user even picks a recipient, so the Submit details page never has to
        // read the device on open, which would land inside the ShareExtensionOpenSubmitFlow span
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

        // Then the device location is never read, because reading it would request the permission and show the system prompt
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
});
