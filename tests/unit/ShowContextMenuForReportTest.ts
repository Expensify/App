import {showContextMenuForReport} from '@components/ShowContextMenuContext';

import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';

jest.mock('@libs/DeviceCapabilities', () => ({canUseTouchScreen: () => true}));
jest.mock('@pages/inbox/report/ContextMenu/ReportActionContextMenu', () => ({showContextMenu: jest.fn()}));

describe('showContextMenuForReport', () => {
    it('keeps picker ownership when a nested preview opens an emoji picker', () => {
        // Given a nested preview, it must use the same row ownership callbacks as the hover menu.
        const setIsEmojiPickerActive = jest.fn();
        const setIsContextMenuActive = jest.fn();
        const checkIfContextMenuActive = jest.fn();
        const show = jest.mocked(showContextMenu);
        show.mockImplementationOnce(() => {
            expect(setIsContextMenuActive).toHaveBeenCalledWith(true);
        });

        // When the preview opens the context menu, ownership must be acquired before measuring its anchor.
        showContextMenuForReport(new MouseEvent('contextmenu'), {current: null}, '1', undefined, checkIfContextMenuActive, '1', {
            setIsEmojiPickerActive,
            setIsContextMenuActive,
        });

        // Then the picker inherits the row's setter, and only the menu's hide callback releases context ownership.
        expect(setIsContextMenuActive).toHaveBeenCalledWith(true);
        expect(show).toHaveBeenCalledTimes(1);
        const callbacks = show.mock.calls.at(-1)?.[0].callbacks;
        expect(callbacks?.setIsEmojiPickerActive).toBe(setIsEmojiPickerActive);
        callbacks?.onHide?.();
        expect(setIsContextMenuActive).toHaveBeenLastCalledWith(false);
        expect(checkIfContextMenuActive).toHaveBeenCalled();
    });
});
