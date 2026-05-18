import type {FlatListRefType} from '@pages/inbox/ReportScreenContext';
import type * as OnyxTypes from '@src/types/onyx';

type ReportScrollManagerData = {
    ref: FlatListRefType<OnyxTypes.ReportAction>;
    scrollToIndex: (index: number, isEditing?: boolean) => void;
    scrollToBottom: () => void;
    scrollToEnd: () => void;
    scrollToOffset: (offset: number) => void;
};

export default ReportScrollManagerData;
