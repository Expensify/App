import {createContext, useContext} from 'react';

import type MiniReportActionContextMenuProps from './MiniReportActionContextMenu/types';

/** Coordinates a retained hover toolbar without subscribing every report row to its target. */
type MiniReportActionContextMenuToken = NonNullable<MiniReportActionContextMenuProps['anchor']>;

type MiniReportActionContextMenuController = {
    /** Prepares the target in the hover event so the row and toolbar update in the same commit. */
    prepare: (props: MiniReportActionContextMenuProps) => void;

    attach: (token: MiniReportActionContextMenuToken, host: HTMLElement, props: MiniReportActionContextMenuProps) => void;
    detach: (token: MiniReportActionContextMenuToken) => void;

    /** Popup ownership is independent of hover, including pickers opened from reaction bubbles. */
    setPopupActive: (token: MiniReportActionContextMenuToken, popup: 'emojiPicker' | 'contextMenu', isActive: boolean) => void;
};

const MiniReportActionContextMenuContext = createContext<MiniReportActionContextMenuController | undefined>(undefined);

function useMiniReportActionContextMenuController() {
    return useContext(MiniReportActionContextMenuContext);
}

export {MiniReportActionContextMenuContext, useMiniReportActionContextMenuController};
export type {MiniReportActionContextMenuController, MiniReportActionContextMenuToken};
