import {ImageSourcePropType} from 'react-native';
import {OnyxEntry} from 'react-native-onyx';
import {WithLocalizeProps} from '@components/withLocalize';
import {Report, ReportActions, Transaction} from '@src/types/onyx';

type ImageSource = string | ImageSourcePropType;

type Attachment = {
    reportActionID?: string;
    source: ImageSource;
    isAuthTokenRequired: boolean;
    file: {name: string};
    isReceipt: boolean;
    hasBeenFlagged?: boolean;
    transactionID?: string;
};

type AttachmentCarouselOnyxProps = {
    reportActions: OnyxEntry<ReportActions>;
    parentReportActions: OnyxEntry<ReportActions>;
    parentReport: OnyxEntry<Report>;
    transaction: OnyxEntry<Transaction>;
};

type AttachmentCarouselProps = {
    report: Report;
    source: ImageSource;
    onNavigate: (attachment: Attachment) => void;
    setDownloadButtonVisibility: (isVisible: boolean) => void;
    onClose: () => void;
} & AttachmentCarouselOnyxProps &
    WithLocalizeProps;

export default AttachmentCarouselProps;
export type {Attachment, AttachmentCarouselOnyxProps, ImageSource};
