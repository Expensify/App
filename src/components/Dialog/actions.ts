const DialogActions = {
    CONFIRM: 'CONFIRM',
    CLOSE: 'CLOSE',
    ERROR: 'ERROR',
} as const;

type DialogAction = (typeof DialogActions)[keyof typeof DialogActions];
type DialogKind = 'Confirm' | 'Decision' | 'HoldMenu' | 'HRSyncResults';
type DialogResponse = {action: DialogAction};

export {DialogActions};
export type {DialogAction, DialogKind, DialogResponse};
