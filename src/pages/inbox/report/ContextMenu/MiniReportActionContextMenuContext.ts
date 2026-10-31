import {createContext, useContext} from 'react';

import type MiniReportActionContextMenuProps from './MiniReportActionContextMenu/types';

/** Coordinates a retained hover toolbar without subscribing every report row to its target. */
type MiniReportActionContextMenuToken = NonNullable<MiniReportActionContextMenuProps['anchor']>;

type MiniReportActionContextMenuController = {
    /** Prepares the target in the hover event so the row and toolbar update in the same commit. */
    prepare: (props: MiniReportActionContextMenuProps) => void;

    /** Returns false when another row owns an ongoing toolbar interaction. */
    attach: (token: MiniReportActionContextMenuToken, host: HTMLElement, props: MiniReportActionContextMenuProps) => boolean;
    detach: (token: MiniReportActionContextMenuToken) => void;
};

const MiniReportActionContextMenuContext = createContext<MiniReportActionContextMenuController | undefined>(undefined);

function useMiniReportActionContextMenuController() {
    return useContext(MiniReportActionContextMenuContext);
}

export {MiniReportActionContextMenuContext, useMiniReportActionContextMenuController};
export type {MiniReportActionContextMenuController, MiniReportActionContextMenuToken};
