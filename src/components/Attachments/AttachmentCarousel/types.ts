import {OnyxEntry} from 'react-native-onyx';
import {WithLocalizeProps} from '@components/withLocalize';
import {WindowDimensionsContextData} from '@components/withWindowDimensions/types';
import {Report, ReportActions, Transaction} from '@src/types/onyx';

type Attachment = {
    reportActionID?: string;
    source: string;
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
};

type TransactionAttachmentCarouselOnyxProps = {
    transaction: OnyxEntry<Transaction>;
};

type AttachmentCarouselProps = {
    report: Report;
    source: string;
    onNavigate: (attachment: Attachment) => void;
    setDownloadButtonVisibility: (isVisible: boolean) => void;
    onClose: () => void;
} & AttachmentCarouselOnyxProps &
    TransactionAttachmentCarouselOnyxProps &
    WithLocalizeProps &
    WindowDimensionsContextData;

export default AttachmentCarouselProps;
export type {Attachment, AttachmentCarouselOnyxProps, TransactionAttachmentCarouselOnyxProps};
