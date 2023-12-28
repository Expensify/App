import {BaseReportActionContextMenuProps} from '@pages/home/report/ContextMenu/BaseReportActionContextMenu';

type MiniReportActionContextMenuProps = BaseReportActionContextMenuProps & {
    /** Should the reportAction this menu is attached to have the appearance of being grouped with the previous reportAction? */
    displayAsGroup?: boolean;
};

export default MiniReportActionContextMenuProps;
