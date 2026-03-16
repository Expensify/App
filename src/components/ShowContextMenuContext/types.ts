import type {OnyxEntry} from 'react-native-onyx';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import type {Report, ReportAction} from '@src/types/onyx';

type ShowContextMenuStateContextType = {
    anchor: ContextMenuAnchor;
    report: OnyxEntry<Report>;
    isReportArchived: boolean;
    action: OnyxEntry<ReportAction>;
    transactionThreadReport?: OnyxEntry<Report>;
    isDisabled: boolean;
    shouldDisplayContextMenu?: boolean;
};

type ShowContextMenuActionsContextType = {
    checkIfContextMenuActive: () => void;
    onShowContextMenu: (callback: () => void) => void;
};

export type {ShowContextMenuStateContextType, ShowContextMenuActionsContextType};
