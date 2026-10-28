type SidePanel = {
    /** Whether the Side Panel is open on large screens */
    open: boolean;

    /** Whether the Side Panel is open on small screens */
    openNarrowScreen: boolean;

    /** Whether the Side Panel should always show the Concierge report, ignoring the admins room override */
    forceConcierge: boolean;

    /** The report the Side Panel shows instead of the Concierge chat it defaults to */
    reportID?: string;
};

/**
 * Describes the context of what the user was viewing when they sent a message from the Side Panel.
 * Sent to the backend so Concierge can tailor its response to the user's current context.
 */
type SidePanelContext = {
    reportID?: string;
    selectedTransactionIDs?: string;
    selectedReportIDs?: string;

    /** The workspace whose page the user has open. Sent only when no report is on screen, since a report carries its own workspace. */
    policyID?: string;
};

export default SidePanel;
export type {SidePanelContext};
