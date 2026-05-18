type SidePanel = {
    /** Whether the Side Panel is open on large screens */
    open: boolean;

    /** Whether the Side Panel is open on small screens */
    openNarrowScreen: boolean;
};

/**
 * Describes the context of what the user was viewing when they sent a message from the Side Panel.
 * Sent to the backend so Concierge can tailor its response to the user's current context.
 */
type SidePanelContext = {reportID?: string; selectedTransactionIDs?: string; selectedReportIDs?: string};

export default SidePanel;
export type {SidePanelContext};
