type ReportActionFragmentType = {
    /** The type of the action item fragment. Used to render a corresponding component */
    type: string;

    /** The text content of the fragment. */
    text: string;

    /** Used to apply additional styling. Style refers to a predetermined constant and not a class name. e.g. 'normal'
     * or 'strong'
     */
    style: string;

    /** ID of a report */
    reportID: string;

    /** ID of a policy */
    policyID: string;

    /** The target of a link fragment e.g. '_blank' */
    target: string;

    /** The destination of a link fragment e.g. 'https://www.expensify.com' */
    href: string;

    /** An additional avatar url - not the main avatar url but used within a message. */
    iconUrl: string;

    /** Fragment edited flag */
    isEdited: boolean;
};

export default ReportActionFragmentType;
