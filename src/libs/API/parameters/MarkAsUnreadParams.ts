type MarkAsUnreadParams = {
    reportID: string;
    lastReadTime: string;

    /** The action whose created time anchors the unread boundary. Omitted when no matching action is loaded, so the server falls back to lastReadTime. */
    reportActionID?: string;
};

export default MarkAsUnreadParams;
