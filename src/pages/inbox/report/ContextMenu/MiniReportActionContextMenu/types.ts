import type {BaseReportActionContextMenuProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';

type MiniReportActionContextMenuProps = Omit<BaseReportActionContextMenuProps, 'isMini' | 'betas' | 'reportActions' | 'transaction'> & {
    /** Should the reportAction this menu is attached to have the appearance of being grouped with the previous reportAction? */
    displayAsGroup?: boolean;
};

export default MiniReportActionContextMenuProps;
