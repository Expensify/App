import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import type {Report} from '@src/types/onyx';

type AttachmentCarouselViewProps = {
    /** Where the arrows should be visible */
    shouldShowArrows: boolean;
    /** The current page index */
    page: number;
    /** The attachments from the carousel */
    attachments: Attachment[];
    /** The id of the current active attachment */
    attachmentID?: string;
    /** Source is used to determine the starting index in the array of attachments */
    source: AttachmentSource;
    /** Callback for auto hiding carousel button arrows */
    autoHideArrows: () => void;
    /** Sets the visibility of the arrows. */
    setShouldShowArrows: (show?: React.SetStateAction<boolean>) => void;
    /** Callback for cancelling auto hiding of carousel button arrows */
    cancelAutoHideArrow: () => void;
    /** A callback that is called when swipe-down-to-close gesture happens */
    onSwipeDown?: () => void;
    /** Sets current page */
    setPage: (page: number) => void;
    /** The report currently being looked at */
    report?: Report;
    /** Callback for attachment errors */
    onAttachmentError?: (source: AttachmentSource, state?: boolean) => void;
    /** Callback to update the parent modal's state with a source and name from the attachments array */
    onNavigate?: (attachment: Attachment) => void;
};

export default AttachmentCarouselViewProps;
