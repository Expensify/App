type GenericReportActionContextMenuProps = {
    /** The ID of the report this report action is attached to. */
    reportID: string;

    /** The ID of the report action this context menu is attached to. */
    reportActionID: string;

    /** The ID of the original report from which the given reportAction is first created. */
    originalReportID: string;

    /** If true, this component will be a small, row-oriented menu that displays icons but not text.
  If false, this component will be a larger, column-oriented menu that displays icons alongside text in each row. */
    isMini?: boolean;

    /** Controls the visibility of this component. */
    isVisible?: boolean;

    /** The copy selection. */
    selection?: string;

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage?: string;
};

export type {GenericReportActionContextMenuProps};
