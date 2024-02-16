import type {ViewToken} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {Report, ReportActions} from '@src/types/onyx';

// This can be either a string, function, or number
type AttachmentSource = string | number | React.FC;

// Object shape for file where name is a required string
type AttachmentFile = {
    name: string;
};

// The object shape for the attachment
type Attachment = {
    /** Report action ID of the attachment */
    reportActionID?: string;

    /** Whether source url requires authentication */
    isAuthTokenRequired?: boolean;

    /** URL to full-sized attachment, SVG function, or numeric static image on native platforms */
    source: AttachmentSource;

    /** File object can be an instance of File or Object */
    file?: AttachmentFile;

    /** Whether the attachment has been flagged */
    hasBeenFlagged?: boolean;

    /** The id of the transaction related to the attachment */
    transactionID?: string;

    isReceipt?: boolean;
};

type UpdatePageProps = {
    viewableItems: ViewToken[];
};

type AttachmentCaraouselOnyxProps = {
    /** Object of report actions for this report */
    reportActions: OnyxEntry<ReportActions>;

    /** The report actions of the parent report */
    parentReportActions: OnyxEntry<ReportActions>;
};

type AttachmentCarouselProps = {
    /** source is used to determine the starting index in the array of attachments */
    source?: string | number;

    /** Callback to update the parent modal's state with a source and name from the attachments array */
    onNavigate?: (attachment: Attachment) => void;

    /** Function to change the download button Visibility */
    setDownloadButtonVisibility?: (isButtonVisible: boolean) => void;

    /** The report currently being looked at */
    report: Report;
} & AttachmentCaraouselOnyxProps;

export type {AttachmentSource, AttachmentFile, Attachment, AttachmentCarouselProps, UpdatePageProps, AttachmentCaraouselOnyxProps};
