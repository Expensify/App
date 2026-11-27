import {hideDownloadingGrowl, showDownloadingGrowl} from '@libs/fileDownload/downloadAttachmentFile/downloadingGrowl';
import Growl from '@libs/Growl';

import {translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Growl', () => ({
    __esModule: true,
    default: {success: jest.fn(), hide: jest.fn()},
}));

const mockSuccess = jest.mocked(Growl.success);
const mockHide = jest.mocked(Growl.hide);

describe('downloadingGrowl', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows a dismissible growl with a spinner that stays until it is hidden', () => {
        // Given a download that starts
        mockSuccess.mockResolvedValue(1);

        // When the growl is shown
        showDownloadingGrowl(translateLocal);

        // Then it has no timeout, a spinner and a Dismiss action, so that the user decides to close it or the download does
        expect(mockSuccess).toHaveBeenCalledWith(
            expect.objectContaining({
                bodyText: 'fileDownload.inProgress',
                duration: Infinity,
                shouldShowSpinner: true,
                action: expect.objectContaining({label: 'common.dismiss'}),
            }),
        );
    });

    it('hides exactly the growl that was shown, using the nonce it resolved', async () => {
        // Given a growl that was shown and resolved its nonce
        mockSuccess.mockResolvedValue(7);
        const growlNonce = showDownloadingGrowl(translateLocal);

        // When the download is ready
        hideDownloadingGrowl(growlNonce);
        await waitForBatchedUpdates();

        // Then that growl is hidden by its nonce
        expect(mockHide).toHaveBeenCalledTimes(1);
        expect(mockHide).toHaveBeenCalledWith(7);
    });

    it('hides the growl even if the download is ready before the nonce arrives', async () => {
        // Given a growl whose nonce is not known yet, because the growl shell is not ready
        let resolveNonce: (nonce: number) => void = () => {};
        mockSuccess.mockReturnValue(
            new Promise<number>((resolve) => {
                resolveNonce = resolve;
            }),
        );
        const growlNonce = showDownloadingGrowl(translateLocal);

        // When the download is ready first and the nonce arrives later
        hideDownloadingGrowl(growlNonce);
        expect(mockHide).not.toHaveBeenCalled();
        resolveNonce(3);
        await waitForBatchedUpdates();

        // Then the growl is still hidden once it is shown, so it does not stay on the screen forever
        expect(mockHide).toHaveBeenCalledWith(3);
    });

    it('does not hide anything when there is no growl, for example a file that is already on the device', async () => {
        // Given a download that never showed a growl, or a growl that could not be shown
        mockSuccess.mockResolvedValue(undefined);
        const growlNonce = showDownloadingGrowl(translateLocal);

        // When the download is ready
        hideDownloadingGrowl(undefined);
        hideDownloadingGrowl(growlNonce);
        await waitForBatchedUpdates();

        // Then no growl is hidden, so another growl that is on the screen stays
        expect(mockHide).not.toHaveBeenCalled();
    });
});
