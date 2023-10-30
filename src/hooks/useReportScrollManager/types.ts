import {ActionListContextType} from '@pages/home/ReportScreenContext';

type ReportScrollManagerData = {
    ref: ActionListContextType;
    scrollToIndex: (index: number, isEditing?: boolean) => void;
    scrollToBottom: () => void;
};

export default ReportScrollManagerData;
