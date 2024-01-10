import type {FlatListRefType} from '@pages/home/ReportScreenContext';

type ReportScrollManagerData = {
    ref: FlatListRefType;
    scrollToIndex: (index: number, isEditing?: boolean) => void;
    scrollToBottom: () => void;
    scrollToOffsetWithoutAnimation: (offset: number) => void;
};

export default ReportScrollManagerData;
