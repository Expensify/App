import type {ViewToken} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {Attachment, AttachmentSource} from '@components/Attachments/types';
import type {Report, ReportActions} from '@src/types/onyx';

type UpdatePageProps = {
    viewableItems: ViewToken[];
};

type AttachmentCaraouselOnyxProps = {
    /** Object of report actions for this report */
    reportActions: OnyxEntry<ReportActions>;

    /** The report actions of the parent report */
    parentReportActions: OnyxEntry<ReportActions>;
};

type AttachmentCarouselProps = AttachmentCaraouselOnyxProps & {
    /** source is used to determine the starting index in the array of attachments */
    source?: AttachmentSource;

    /** Callback to update the parent modal's state with a source and name from the attachments array */
    onNavigate?: (attachment: Attachment) => void;

    /** Function to change the download button Visibility */
    setDownloadButtonVisibility?: (isButtonVisible: boolean) => void;

    /** The report currently being looked at */
    report: Report;

    onClose: () => void;
};

export type {AttachmentCarouselProps, UpdatePageProps, AttachmentCaraouselOnyxProps};
