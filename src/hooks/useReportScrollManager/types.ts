type ReportScrollManagerData = {
    scrollToIndex: (index: number, isEditing?: boolean) => void;
    scrollToBottom: () => void;
    scrollToEnd: () => void;
    scrollToOffset: (offset: number) => void;
    /** Imperative scroll-to-index used by ReportActionItemMessageEdit's Safari keyboard hack. */
    scrollToIndexInstance: (params: {index: number; animated: boolean}) => void;
};

export default ReportScrollManagerData;
