import {ImageSourcePropType} from 'react-native';
import {OnyxEntry} from 'react-native-onyx';
import {Report, ReportActions, Transaction} from '@src/types/onyx';

type AttachmentCarouselProps = {
    source?: string | ImageSourcePropType;
    onNavigate?: () => void;
    onClose?: () => void;
    setDownloadButtonVisibility?: () => void;
    reportActions?: OnyxEntry<ReportActions>;
    report: OnyxEntry<Report>;
    parentReport?: OnyxEntry<Report>;
    parentReportActions?: OnyxEntry<ReportActions>;
    transaction?: OnyxEntry<Transaction>;
};

export default AttachmentCarouselProps;
