import {hideDownloadingGrowl, showDownloadingGrowl} from '@libs/fileDownload/downloadAttachmentFile/downloadingGrowl';
import downloadAttachmentFile from '@libs/fileDownload/downloadAttachmentFile/index.ios';
import {showGeneralErrorAlert} from '@libs/fileDownload/FileUtils';

import Share from 'react-native-share';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockGrowlNonce = Promise.resolve(5);
const callOrder: string[] = [];

jest.mock('@libs/fileDownload/downloadAttachmentFile/downloadingGrowl', () => ({
    showDownloadingGrowl: jest.fn(),
    hideDownloadingGrowl: jest.fn(),
}));
jest.mock('@libs/fileDownload/FileUtils', () => ({
    appendTimeToFileName: (name: string) => name,
    getFileName: (url: string) => url,
    showGeneralErrorAlert: jest.fn(),
}));
jest.mock('@libs/fileDownload/shareSheetState', () => ({startShareSheet: jest.fn(), endShareSheet: jest.fn()}));
jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: ({callback}: {callback: () => void}) => callback(),
}));
jest.mock('react-native-share', () => ({open: jest.fn()}));
const mockConfig = jest.fn<unknown, unknown[]>();
jest.mock('react-native-blob-util', () => ({
    fs: {dirs: {CacheDir: '/cache'}, unlink: jest.fn(() => Promise.resolve())},
    config: (...args: unknown[]) => mockConfig(...args),
}));

const mockShow = jest.mocked(showDownloadingGrowl);
const mockHide = jest.mocked(hideDownloadingGrowl);
const mockShareOpen = jest.mocked(Share.open);
const mockAlert = jest.mocked(showGeneralErrorAlert);

function mockFetch(result: Promise<unknown>) {
    mockConfig.mockReturnValue({fetch: () => result});
}

const download = (url: string) => downloadAttachmentFile(translateLocal, url, 'video.mp4');

describe('downloadAttachmentFile on iOS', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        callOrder.length = 0;
        // @ts-expect-error The mock resolves the nonce of the growl, which is all the code under test passes around
        mockShow.mockReturnValue(mockGrowlNonce);
        mockHide.mockImplementation(() => {
            callOrder.push('hide');
        });
        mockShareOpen.mockImplementation(() => {
            callOrder.push('share');
            return Promise.resolve({success: true, message: ''});
        });
    });

    it('hides the growl of the download right before the share sheet opens', async () => {
        // Given an attachment that downloads fine
        mockFetch(Promise.resolve({}));

        // When it is downloaded
        await download('https://example.com/video.mp4');
        await waitForBatchedUpdates();

        // Then the growl was shown for this download and hidden, with the same growl nonce, before the share sheet
        expect(mockShow).toHaveBeenCalledTimes(1);
        expect(mockHide).toHaveBeenCalledWith(mockGrowlNonce);
        expect(callOrder).toEqual(['hide', 'share']);
    });

    it('hides the growl and shows the error alert when the download fails', async () => {
        // Given an attachment that can not be downloaded
        mockFetch(Promise.reject(new Error('offline')));

        // When it is downloaded
        await download('https://example.com/video.mp4');

        // Then the growl does not stay behind the error, and the share sheet is not opened
        expect(mockHide).toHaveBeenCalledWith(mockGrowlNonce);
        expect(mockAlert).toHaveBeenCalledTimes(1);
        expect(mockShareOpen).not.toHaveBeenCalled();
    });

    it('shows no growl for a file that is already on the device', async () => {
        // Given a local file, like a receipt that failed to upload
        // When it is shared
        await download('file:///cache/receipt.png');
        await waitForBatchedUpdates();

        // Then it opens the share sheet at once, without a growl for a download that does not happen
        expect(mockShow).not.toHaveBeenCalled();
        expect(mockShareOpen).toHaveBeenCalledTimes(1);
        expect(mockHide).toHaveBeenCalledWith(undefined);
    });
});
