import type {ViewToken} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import type CONST from '@src/CONST';
import type {Report, ReportActions} from '@src/types/onyx';

type UpdatePageProps = {
    viewableItems: ViewToken[];
};

type AttachmentCarouselProps = {
    /** Source is used to determine the starting index in the array of attachments */
    source: AttachmentSource;

    /** Callback to update the parent modal's state with a source and name from the attachments array */
    onNavigate?: (attachment: Attachment) => void;

    /** Function to change the download button Visibility */
    setDownloadButtonVisibility?: (isButtonVisible: boolean) => void;

    /** The report currently being looked at */
    report: Report;

    /** The type of the attachment */
    type?: ValueOf<typeof CONST.ATTACHMENT_TYPE>;

    /** If the attachment originates from a note, the accountID will represent the author of that note. */
    accountID?: number;

    /** A callback that is called when swipe-down-to-close gesture happens */
    onClose: () => void;
};

export type {AttachmentCarouselProps, UpdatePageProps};
