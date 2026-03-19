import type {ShowContextMenuActionsContextType, ShowContextMenuStateContextType} from './types';

const defaultShowContextMenuStateContextValue: ShowContextMenuStateContextType = {
    anchor: null,
    report: undefined,
    isReportArchived: false,
    action: undefined,
    transactionThreadReport: undefined,
    isDisabled: true,
    shouldDisplayContextMenu: true,
};

const defaultShowContextMenuActionsContextValue: ShowContextMenuActionsContextType = {
    checkIfContextMenuActive: () => {},
    onShowContextMenu: (callback) => callback(),
};

export {defaultShowContextMenuStateContextValue, defaultShowContextMenuActionsContextValue};
