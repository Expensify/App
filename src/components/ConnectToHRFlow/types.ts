type ConnectToHRFlowProps = {
    /** The URL to open for the HR provider's connection flow */
    setupLink: string;

    /** Called when the flow is dismissed or completed so the parent can unmount the component */
    onDone?: () => void;
};

export default ConnectToHRFlowProps;
