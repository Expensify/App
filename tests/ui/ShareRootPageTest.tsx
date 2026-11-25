import {act, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';

import ShareActionHandler from '@libs/ShareActionHandlerModule';

import getFileSize from '@pages/Share/getFileSize';
import ShareRootPage from '@pages/Share/ShareRootPage';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {SharedFile} from '@expensify/nitro-utils';
import type {AppStateStatus} from 'react-native';

import React from 'react';
import {Alert, AppState, Linking} from 'react-native';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/ShareActionHandlerModule', () => ({__esModule: true, default: {processFiles: jest.fn()}}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/fileDownload/FileUtils', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/fileDownload/FileUtils'),
    validateImageForCorruption: jest.fn(() => Promise.resolve()),
}));
const mockValidateFiles = jest.fn();
jest.mock('@hooks/useFilesValidation', () => () => ({validateFiles: mockValidateFiles}));
jest.mock('@pages/Share/getFileSize', () => jest.fn(() => Promise.resolve(10000)));

// The page's chrome and tabs are replaced so the test only covers how the page handles what the native handler returns.
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/Skeletons/TabNavigatorSkeleton', () => () => null);
jest.mock('@libs/Navigation/OnyxTabNavigator', () => ({__esModule: true, default: () => null, TopTab: {Screen: () => null}}));
jest.mock('@pages/Share/ShareTab', () => () => null);
jest.mock('@pages/Share/SubmitTab', () => () => null);

const SHARE_ROOT_DEEP_LINK = `new-expensify://${ROUTES.SHARE_ROOT}`;

const SHARED_IMAGE: SharedFile = {id: '1700000000000_receipt.jpg', content: 'file:///shared/receipt.jpg', mimeType: 'image/jpeg', processedAt: '1700000000000', aspectRatio: 1.5};
const SHARED_PDF: SharedFile = {id: 'invoice.pdf', content: 'file:///shared/invoice.pdf', mimeType: 'application/pdf', processedAt: '1700000000001', aspectRatio: 1};
const SHARED_TEXT: SharedFile = {id: 'text', content: 'https://expensify.com', mimeType: 'txt', processedAt: '1700000000002', aspectRatio: 1};
const SHARED_HEIC: SharedFile = {id: 'photo.heic', content: 'file:///shared/photo.heic', mimeType: 'image/heic', processedAt: '1700000000003', aspectRatio: 0.75};

async function renderShareRootPage() {
    const screen = render(
        <LocaleContextProvider>
            <ShareRootPage />
        </LocaleContextProvider>,
    );
    await waitForBatchedUpdatesWithAct();
    return screen;
}

function captureLinkingListener(): (url: string) => void {
    const addEventListenerSpy = jest.spyOn(Linking, 'addEventListener');
    return (url) => {
        // The page subscribes again whenever its handler changes, so only the most recent listener is still subscribed.
        const urlChangeHandler = addEventListenerSpy.mock.calls.findLast(([eventType]) => eventType === 'url')?.[1];
        urlChangeHandler?.({url});
    };
}

async function openDeepLink(emitUrl: (url: string) => void, url: string) {
    await act(async () => {
        emitUrl(url);
    });
    await waitForBatchedUpdatesWithAct();
}

function captureAppStateListeners(): (states: AppStateStatus[]) => Promise<void> {
    const listeners: Array<(state: AppStateStatus) => void> = [];
    jest.spyOn(AppState, 'addEventListener').mockImplementation((type, handler) => {
        listeners.push(handler);
        return {remove: jest.fn()};
    });
    return async (states) => {
        await act(async () => {
            for (const state of states) {
                for (const listener of listeners) {
                    listener(state);
                }
            }
        });
        await waitForBatchedUpdatesWithAct();
    };
}

/** A promise the test settles by hand, to control the order in which overlapping native reads finish. */
function createDeferred<T>() {
    let resolve: (value: T) => void = () => {};
    let reject: (reason: unknown) => void = () => {};
    const promise = new Promise<T>((onResolve, onReject) => {
        resolve = onResolve;
        reject = onReject;
    });
    return {promise, resolve, reject};
}

async function settle(callback: () => void) {
    await act(async () => {
        callback();
    });
    await waitForBatchedUpdatesWithAct();
}

describe('ShareRootPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return IntlStore.load(CONST.LOCALES.EN);
    });

    beforeEach(() => {
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    afterEach(async () => {
        jest.restoreAllMocks();
        jest.mocked(ShareActionHandler.processFiles).mockReset();
        mockValidateFiles.mockReset();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });
    });

    it.each([
        ['an image', SHARED_IMAGE],
        ['a piece of text', SHARED_TEXT],
    ])('stores %s exactly as the native handler returns it', async (_, sharedFile) => {
        // Given the native handler returns one typed record for what the user shared
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValue([sharedFile]);

        // When the Share screen opens
        await renderShareRootPage();

        // Then the record is stored as it is, with no parsing and no error shown
        expect(await Onyx.get(ONYXKEYS.SHARE_TEMP_FILE)).toEqual(sharedFile);
        expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('shows that the attachment was not found when nothing was shared', async () => {
        // Given the Share screen opened without anything saved by the share extension or share intent
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValue([]);

        // When the Share screen opens
        await renderShareRootPage();

        // Then the user is told the attachment is missing instead of being left on the loading skeleton
        expect(Alert.alert).toHaveBeenCalledWith(translateLocal('attachmentPicker.attachmentError'), translateLocal('attachmentView.attachmentNotFound'), expect.any(Array));
        expect(await Onyx.get(ONYXKEYS.SHARE_TEMP_FILE)).toBeUndefined();
    });

    it('shows that the attachment was not found when the shared data cannot be read', async () => {
        // Given the native handler rejects because the shared file is missing or unreadable
        jest.mocked(ShareActionHandler.processFiles).mockRejectedValue(new Error('The shared file is missing or unreadable'));

        // When the Share screen opens
        await renderShareRootPage();

        // Then the user is told the attachment is missing rather than corrupted, because a read fails when the file or its folder is gone
        expect(Alert.alert).toHaveBeenCalledWith(translateLocal('attachmentPicker.attachmentError'), translateLocal('attachmentView.attachmentNotFound'), expect.any(Array));
        expect(await Onyx.get(ONYXKEYS.SHARE_TEMP_FILE)).toBeUndefined();
    });

    it('shows that a shared file is too large when it is over the size limit', async () => {
        // Given a shared PDF that is larger than the API accepts
        jest.mocked(getFileSize).mockResolvedValueOnce(CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValue([SHARED_PDF]);

        // When the Share screen opens
        await renderShareRootPage();

        // Then the user is told the file is too large before picking where to share it
        expect(Alert.alert).toHaveBeenCalledWith(translateLocal('attachmentPicker.attachmentTooLarge'), translateLocal('attachmentPicker.sizeExceeded'), expect.any(Array));
    });

    it('treats a share without a MIME type as the wrong file type', async () => {
        // Given an Android share whose sending app gave no MIME type, which the native handler reports as an empty string
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValue([{...SHARED_PDF, mimeType: ''}]);

        // When the Share screen opens
        await renderShareRootPage();

        // Then the user is told the file type is not allowed
        expect(Alert.alert).toHaveBeenCalledWith(translateLocal('attachmentPicker.wrongFileType'), translateLocal('attachmentPicker.notAllowedExtension'), expect.any(Array));
    });

    it.each([
        ['standalone app', SHARE_ROOT_DEEP_LINK],
        ['HybridApp', `${CONST.NEW_EXPENSIFY_URL}${ROUTES.SHARE_ROOT}`],
    ])('processes a new share when the %s opens the share root deep link', async (_, url) => {
        // Given a share root screen that has already processed the first share
        const emitUrl = captureLinkingListener();
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValueOnce([SHARED_IMAGE]).mockResolvedValueOnce([SHARED_PDF]);
        await renderShareRootPage();

        // When the user shares another file while the app is running, which opens the share root deep link without remounting the page
        await openDeepLink(emitUrl, url);

        // Then the second share replaces the first one, including its aspect ratio, because every native record carries every field
        expect(ShareActionHandler.processFiles).toHaveBeenCalledTimes(2);
        expect(await Onyx.get(ONYXKEYS.SHARE_TEMP_FILE)).toEqual(SHARED_PDF);
    });

    it('does not re-process share files for deep links to other routes', async () => {
        // Given a share root screen that has processed the initial share files
        const emitUrl = captureLinkingListener();
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValue([SHARED_IMAGE]);
        await renderShareRootPage();
        expect(ShareActionHandler.processFiles).toHaveBeenCalledTimes(1);

        // When a deep link to an unrelated route arrives
        await openDeepLink(emitUrl, `new-expensify://${ROUTES.HOME}`);

        // Then the share files are not read again, because no new share was made
        expect(ShareActionHandler.processFiles).toHaveBeenCalledTimes(1);
    });

    it('does not re-process share files when the app state changes', async () => {
        // Given a share root screen that has processed the initial share files, which used to be re-processed on every return to the foreground and raced with the receipt being moved after submission
        const emitAppStates = captureAppStateListeners();
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValue([SHARED_IMAGE]);
        await renderShareRootPage();
        expect(ShareActionHandler.processFiles).toHaveBeenCalledTimes(1);

        // When a permission dialog or moving the app to the background toggles the app state without a new share
        await emitAppStates(['inactive', 'active', 'background', 'active']);

        // Then the share files are not read again, so they cannot race with the receipt being moved after submission
        expect(ShareActionHandler.processFiles).toHaveBeenCalledTimes(1);
    });

    it('validates a shared HEIC photo even when the previous share was text', async () => {
        // Given the previous share was text, which is still stored when the Share screen opens for the next share
        await Onyx.set(ONYXKEYS.SHARE_TEMP_FILE, SHARED_TEXT);
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValue([SHARED_HEIC]);

        // When the user shares a HEIC photo
        await renderShareRootPage();

        // Then the photo is validated, because the Share and Submit pages can only use a HEIC photo after validation converts it
        expect(mockValidateFiles).toHaveBeenCalledTimes(1);
        expect(mockValidateFiles).toHaveBeenCalledWith([expect.objectContaining({uri: SHARED_HEIC.content, type: SHARED_HEIC.mimeType})], undefined, {isValidatingReceipts: false});
    });

    it('shows only one error when a later read fails while an error is already showing', async () => {
        // Given the first share was rejected as the wrong file type, so its error is showing
        const emitUrl = captureLinkingListener();
        jest.mocked(ShareActionHandler.processFiles)
            .mockResolvedValueOnce([{...SHARED_PDF, mimeType: 'application/x-unsupported'}])
            .mockRejectedValueOnce(new Error('The shared file is missing or unreadable'));
        await renderShareRootPage();

        // When the user shares again and the next read fails
        await openDeepLink(emitUrl, SHARE_ROOT_DEEP_LINK);

        // Then the user still sees only the first error, not a second alert on top of it
        expect(Alert.alert).toHaveBeenCalledTimes(1);
        expect(Alert.alert).toHaveBeenCalledWith(translateLocal('attachmentPicker.wrongFileType'), translateLocal('attachmentPicker.notAllowedExtension'), expect.any(Array));
    });

    it('keeps the newest share when an older native read finishes last', async () => {
        // Given the read started when the Share screen opened is still running when the user shares again,
        // since native reads run concurrently and can finish in any order
        const emitUrl = captureLinkingListener();
        const olderRead = createDeferred<SharedFile[]>();
        const newerRead = createDeferred<SharedFile[]>();
        jest.mocked(ShareActionHandler.processFiles).mockReturnValueOnce(olderRead.promise).mockReturnValueOnce(newerRead.promise);
        await renderShareRootPage();
        await openDeepLink(emitUrl, SHARE_ROOT_DEEP_LINK);

        // When the newer read finishes first and the older one finishes afterwards
        await settle(() => newerRead.resolve([SHARED_PDF]));
        await settle(() => olderRead.resolve([SHARED_IMAGE]));

        // Then the newest share stays stored, because an outdated read must not replace it
        expect(await Onyx.get(ONYXKEYS.SHARE_TEMP_FILE)).toEqual(SHARED_PDF);
        expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('ignores the failure of an older native read once a newer read has started', async () => {
        // Given the read started when the Share screen opened is still running when the user shares again
        const emitUrl = captureLinkingListener();
        const olderRead = createDeferred<SharedFile[]>();
        jest.mocked(ShareActionHandler.processFiles).mockReturnValueOnce(olderRead.promise).mockResolvedValueOnce([SHARED_PDF]);
        await renderShareRootPage();
        await openDeepLink(emitUrl, SHARE_ROOT_DEEP_LINK);

        // When the older read fails afterwards, for example because the new share replaced the files it was reading
        await settle(() => olderRead.reject(new Error('The shared file is missing or unreadable')));

        // Then the new share is kept and no error is shown for the outdated read
        expect(await Onyx.get(ONYXKEYS.SHARE_TEMP_FILE)).toEqual(SHARED_PDF);
        expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('ignores the size check of an older share once a newer share has been read', async () => {
        // Given a shared PDF whose size check is still running when the user shares again
        const emitUrl = captureLinkingListener();
        const olderSizeCheck = createDeferred<number>();
        jest.mocked(getFileSize).mockReturnValueOnce(olderSizeCheck.promise);
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValueOnce([SHARED_PDF]).mockResolvedValueOnce([SHARED_IMAGE]);
        await renderShareRootPage();
        await openDeepLink(emitUrl, SHARE_ROOT_DEEP_LINK);

        // When the older PDF's size check finishes and reports that it is too large
        await settle(() => olderSizeCheck.resolve(CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1));

        // Then no size error is shown for a file the user has already replaced
        expect(await Onyx.get(ONYXKEYS.SHARE_TEMP_FILE)).toEqual(SHARED_IMAGE);
        expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('does not validate an older HEIC photo once a newer share has been read', async () => {
        // Given a shared HEIC photo whose size lookup, which runs before validation, is still running when the user shares another HEIC photo
        const emitUrl = captureLinkingListener();
        const newerHeic: SharedFile = {...SHARED_HEIC, id: 'second.heic', content: 'file:///shared/second.heic'};
        const olderSizeLookup = createDeferred<number>();
        jest.mocked(getFileSize).mockReturnValueOnce(olderSizeLookup.promise);
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValueOnce([SHARED_HEIC]).mockResolvedValueOnce([newerHeic]);
        await renderShareRootPage();
        await openDeepLink(emitUrl, SHARE_ROOT_DEEP_LINK);

        // When the older photo's size lookup finishes after the newer photo started validating
        await settle(() => olderSizeLookup.resolve(10000));

        // Then only the newer photo is validated, because validating the replaced photo could store its converted file for the new share
        expect(mockValidateFiles).toHaveBeenCalledTimes(1);
        expect(mockValidateFiles).toHaveBeenCalledWith([expect.objectContaining({uri: newerHeic.content})], undefined, {isValidatingReceipts: false});
    });

    it("keeps the share of a reopened Share screen when the closed screen's read finishes last", async () => {
        // Given the Share screen closed while its native read was still running, and the user reopened it with a new share
        const closedScreenRead = createDeferred<SharedFile[]>();
        jest.mocked(ShareActionHandler.processFiles).mockReturnValueOnce(closedScreenRead.promise).mockResolvedValueOnce([SHARED_PDF]);
        const closedScreen = await renderShareRootPage();
        closedScreen.unmount();
        await renderShareRootPage();

        // When the closed screen's read finishes afterwards
        await settle(() => closedScreenRead.resolve([SHARED_IMAGE]));

        // Then the reopened screen's share is kept, because a screen that has closed must not overwrite it
        expect(await Onyx.get(ONYXKEYS.SHARE_TEMP_FILE)).toEqual(SHARED_PDF);
    });
});
