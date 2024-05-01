import type {FlatListRefType} from '@pages/home/ReportScreenContext';

type ReportScrollManagerData = {
    ref: FlatListRefType;
    scrollToIndex: (index: number, isEditing?: boolean, viewPosition?: number) => void;
    scrollToBottom: () => void;
};

export default ReportScrollManagerData;
