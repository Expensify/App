type SidePanelContent = 'help' | 'concierge' | 'report';

type SidePanel = {
    /** The content of the Side Panel */
    content?: SidePanelContent;

    /** Whether the Side Panel is open on large screens */
    open: boolean;

    /** Whether the Side Panel is open on small screens */
    openNarrowScreen: boolean;

    /** Report ID to display when content is 'report' */
    reportID?: string;
};

export default SidePanel;
export type {SidePanelContent};
