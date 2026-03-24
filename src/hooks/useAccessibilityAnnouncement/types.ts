type UseAccessibilityAnnouncementOptions = {
    shouldAnnounceOnNative?: boolean;
    shouldAnnounceOnWeb?: boolean;
    /** Custom delay in ms before announcing (iOS only). Defaults to 100ms. */
    delay?: number;
    announcementKey?: number;
};

export default UseAccessibilityAnnouncementOptions;
