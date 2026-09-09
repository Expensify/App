type AriaLivePoliteness = 'polite' | 'assertive';

type UseAccessibilityAnnouncementOptions = {
    shouldAnnounceOnNative?: boolean;
    shouldAnnounceOnWeb?: boolean;
    announcementKey?: number;
    /**
     * Web only. `assertive` (default) interrupts current speech — use for errors.
     * `polite` waits so e.g. JAWS can finish reading the tab title `(1) …` before "{title}, dialog".
     */
    politeness?: AriaLivePoliteness;
};

export default UseAccessibilityAnnouncementOptions;
export type {AriaLivePoliteness};
