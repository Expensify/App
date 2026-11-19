import {dismissShareSheet, getIsShareSheetOpen, setShareSheetOpen} from '@libs/fileDownload/shareSheetState';

const mockShareDismiss = jest.fn<Promise<void>, []>();

jest.mock('react-native-share', () => ({
    __esModule: true,
    default: {dismiss: () => mockShareDismiss()},
}));

describe('shareSheetState', () => {
    beforeEach(() => {
        setShareSheetOpen(false);
        mockShareDismiss.mockReset();
        mockShareDismiss.mockResolvedValue(undefined);
    });

    it('does not touch the native module when the share sheet is not open', async () => {
        // Given the share sheet is not on screen
        // When something asks for it to be closed
        await dismissShareSheet();

        // Then there is nothing to close, so the native module is left alone
        expect(mockShareDismiss).not.toHaveBeenCalled();
    });

    it('closes the share sheet and resets the flag, so the caller can present a modal right after', async () => {
        // Given the share sheet is on screen
        setShareSheetOpen(true);

        // When it is dismissed
        await dismissShareSheet();

        // Then the native sheet was asked to close and the app no longer thinks it is open
        expect(mockShareDismiss).toHaveBeenCalledTimes(1);
        expect(getIsShareSheetOpen()).toBe(false);
    });

    it('resets the flag even if the native dismiss fails, so the caller is never left waiting on a sheet that is gone', async () => {
        // Given the share sheet is on screen but closing it fails
        setShareSheetOpen(true);
        mockShareDismiss.mockRejectedValue(new Error('dismiss failed'));

        // When it is dismissed
        await dismissShareSheet();

        // Then the promise still resolves and the flag is cleared, otherwise showing the context menu would hang or recurse forever
        expect(getIsShareSheetOpen()).toBe(false);
    });
});
