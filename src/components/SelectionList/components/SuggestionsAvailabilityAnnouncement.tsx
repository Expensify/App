type SuggestionsAvailabilityAnnouncementProps = {
    /** The text announced to assistive technologies when suggestions become available */
    announcement: string;

    /** Delay the announcement to avoid interrupting text input focus changes */
    delayMS?: number;
};

function SuggestionsAvailabilityAnnouncement(_props: SuggestionsAvailabilityAnnouncementProps) {
    return null;
}

export default SuggestionsAvailabilityAnnouncement;
