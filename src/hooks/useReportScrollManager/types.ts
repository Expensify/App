import type {FlatListRefType} from '@pages/home/ReportScreenContext';

type ReportScrollManagerData = {
    ref: FlatListRefType;
    scrollToIndex: (index: number, isEditing?: boolean) => void;
    scrollToBottom: () => void;
    scrollToEnd: (animated?: boolean) => void;
    scrollToOffset: (offset: number) => void;
};

export default ReportScrollManagerData;
