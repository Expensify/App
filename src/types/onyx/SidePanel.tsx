type SidePanelContent = 'help';

type SidePanel = {
    /** The content of the Side Panel */
    content?: SidePanelContent;

    /** Whether the Side Panel is open on large screens */
    open: boolean;

    /** Whether the Side Panel is open on small screens */
    openNarrowScreen: boolean;
};

export default SidePanel;
