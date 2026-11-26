import {hideDownloadingGrowl, showDownloadingGrowl} from '@libs/fileDownload/downloadAttachmentFile/downloadingGrowl';
import downloadAttachmentFile from '@libs/fileDownload/downloadAttachmentFile/index.android';
import {downloadAndOfferToOpen} from '@libs/fileDownload/index.android';

import {translateLocal} from '../utils/TestHelper';

jest.mock('@libs/fileDownload/downloadAttachmentFile/downloadingGrowl', () => ({
    showDownloadingGrowl: jest.fn(),
    hideDownloadingGrowl: jest.fn(),
}));
jest.mock('@libs/fileDownload/index.android', () => ({downloadAndOfferToOpen: jest.fn()}));

const mockShow = jest.mocked(showDownloadingGrowl);
const mockHide = jest.mocked(hideDownloadingGrowl);
const mockDownload = jest.mocked(downloadAndOfferToOpen);
const growlNonce = Promise.resolve(9);

const download = () => downloadAttachmentFile(translateLocal, 'https://example.com/video.mp4', 'video.mp4');

describe('downloadAttachmentFile on Android', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // @ts-expect-error The mock resolves the nonce of the growl, which is all the code under test passes around
        mockShow.mockReturnValue(growlNonce);
    });

    it('shows a growl while the attachment downloads and hides it when the download is done', async () => {
        // Given a download that is still running
        let finishDownload: () => void = () => {};
        mockDownload.mockReturnValue(
            new Promise<void>((resolve) => {
                finishDownload = resolve;
            }),
        );

        // When it starts
        const downloaded = download();

        // Then the growl is shown and stays until the download is done
        expect(mockShow).toHaveBeenCalledTimes(1);
        expect(mockHide).not.toHaveBeenCalled();

        // When the download is done
        finishDownload();
        await downloaded;

        // Then the growl of this download is hidden
        expect(mockHide).toHaveBeenCalledWith(growlNonce);
    });

    it('hides the growl when the download fails too', async () => {
        // Given a download that fails
        mockDownload.mockRejectedValue(new Error('offline'));

        // When it is done
        await download().catch(() => {});

        // Then the growl does not stay on the screen
        expect(mockHide).toHaveBeenCalledWith(growlNonce);
    });
});
