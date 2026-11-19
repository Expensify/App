import {setShareSheetOpen} from '@libs/fileDownload/shareSheetState';

import {contextMenuRef, showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import type {ReportActionContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';

const mockShareDismiss = jest.fn<Promise<void>, []>();

jest.mock('react-native-share', () => ({
    __esModule: true,
    default: {dismiss: () => mockShareDismiss()},
}));

const mockShowContextMenu = jest.fn();

function setMountedContextMenu() {
    // The popover is mounted lazily in the app, so the tests hand the module a stand-in with no menu currently open
    const mountedContextMenu: ReportActionContextMenu = {
        showContextMenu: mockShowContextMenu,
        hideContextMenu: jest.fn(),
        showDeleteModal: jest.fn(),
        hideDeleteModal: jest.fn(),
        isActiveReportAction: jest.fn(),
        instanceIDRef: {current: ''},
        runAndResetOnPopoverHide: jest.fn(),
        clearActiveReportAction: jest.fn(),
        contentRef: {current: null},
        isContextMenuOpening: false,
    };
    contextMenuRef.current = mountedContextMenu;
}

type ShowContextMenuParams = Parameters<typeof showContextMenu>[0];

// The event is never read by the code under test, so an empty object is enough
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const pressEvent = {} as ShowContextMenuParams['event'];

const params: ShowContextMenuParams = {
    type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
    event: pressEvent,
    selection: '',
    contextMenuAnchor: null,
};

describe('showContextMenu while the share sheet is open', () => {
    beforeEach(() => {
        setShareSheetOpen(false);
        mockShareDismiss.mockReset();
        mockShowContextMenu.mockReset();
        setMountedContextMenu();
    });

    it('shows the menu right away when no share sheet is open', () => {
        // Given there is no share sheet
        // When the menu is requested
        showContextMenu(params);

        // Then it opens synchronously and the share module is not involved
        expect(mockShowContextMenu).toHaveBeenCalledTimes(1);
        expect(mockShareDismiss).not.toHaveBeenCalled();
    });

    it('closes the share sheet first and only then opens the menu', async () => {
        // Given the share sheet is on screen and takes a moment to close
        setShareSheetOpen(true);
        let finishDismiss: () => void = () => {};
        mockShareDismiss.mockReturnValue(
            new Promise<void>((resolve) => {
                finishDismiss = resolve;
            }),
        );

        // When the menu is requested
        showContextMenu(params);

        // Then the menu waits, because UIKit can't present it on top of the sheet
        expect(mockShareDismiss).toHaveBeenCalledTimes(1);
        expect(mockShowContextMenu).not.toHaveBeenCalled();

        // When the sheet is gone
        finishDismiss();
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 0);
        });

        // Then the menu opens exactly once
        expect(mockShowContextMenu).toHaveBeenCalledTimes(1);
    });

    it('still opens the menu when closing the share sheet fails', async () => {
        // Given the share sheet is on screen but the native dismiss rejects
        setShareSheetOpen(true);
        mockShareDismiss.mockRejectedValue(new Error('dismiss failed'));

        // When the menu is requested
        showContextMenu(params);
        await new Promise<void>((resolve) => {
            setTimeout(resolve, 0);
        });

        // Then the user is not left without a menu
        expect(mockShowContextMenu).toHaveBeenCalledTimes(1);
    });
});
