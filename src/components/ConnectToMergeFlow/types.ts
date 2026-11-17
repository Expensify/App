type ConnectToMergeFlowProps = {
    /** The URL to open for the provider's Merge Link connection flow */
    setupLink: string;

    /** Title shown in the flow's header, e.g. the connection category the provider belongs to */
    title: string;

    /** Called when the flow is dismissed or completed so the parent can unmount the component */
    onDone?: () => void;
};

export default ConnectToMergeFlowProps;
