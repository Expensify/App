type VideoChatButtonAndMenuProps = {
    /** If this is the Concierge chat, we'll open the modal for requesting a setup call instead of showing popover menu */
    isConcierge?: boolean;

    /** URL to the assigned guide's appointment booking calendar */
    guideCalendarLink?: string;
};

export default VideoChatButtonAndMenuProps;
