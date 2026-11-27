import {endShareSheet, getIsShareSheetOpen, startShareSheet} from '@libs/fileDownload/shareSheetState';

import {contextMenuRef, showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import type {ReportActionContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

import CONST from '@src/CONST';

const mockShowContextMenu = jest.fn();

function setMountedContextMenu() {
    // The popover is mounted lazily in the app, so the tests hand the module a stand-in with no menu currently open
    const mountedContextMenu: ReportActionContextMenu = {
        showContextMenu: mockShowContextMenu,
        hideContextMenu: jest.fn(),
        showDeleteModal: jest.fn(),
        hideDeleteModal: jest.fn(),
        handleHoldEducationalModal: jest.fn(),
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
        while (getIsShareSheetOpen()) {
            endShareSheet();
        }
        mockShowContextMenu.mockReset();
        setMountedContextMenu();
    });

    it('shows the menu right away when no share sheet is open', () => {
        // Given there is no share sheet
        // When the menu is requested
        showContextMenu(params);

        // Then it opens synchronously
        expect(mockShowContextMenu).toHaveBeenCalledTimes(1);
    });

    it('does not show the menu while the share sheet is open, so it never counts as open without being shown', () => {
        // Given the share sheet is on screen
        startShareSheet();

        // When the menu is requested
        showContextMenu(params);

        // Then the menu is not shown, because UIKit would refuse to present it over the sheet
        expect(mockShowContextMenu).not.toHaveBeenCalled();
    });

    it('reports the ignored menu as hidden, so the pressed row does not stay highlighted', () => {
        // Given the share sheet is on screen and the caller marked its row as active before asking for the menu
        startShareSheet();
        const onHide = jest.fn();

        // When the menu is requested
        showContextMenu({...params, callbacks: {onHide}});

        // Then the caller is told the menu is hidden, because that is the only place it clears the active row
        expect(onHide).toHaveBeenCalledTimes(1);
    });

    it('shows the menu again once the share sheet is closed', () => {
        // Given the share sheet was open and has been closed since
        startShareSheet();
        endShareSheet();

        // When the menu is requested
        showContextMenu(params);

        // Then it opens, so a closed sheet never leaves the menu blocked
        expect(mockShowContextMenu).toHaveBeenCalledTimes(1);
    });
});
