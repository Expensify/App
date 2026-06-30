type ReportScrollManagerData = {
    /**
     * Scroll to a list index. `isEditing` suppresses the scroll (web only, defaults to `false`);
     * `animated` defaults to `true`. ReportActionItemMessageEdit's Android Chrome keyboard hack
     * passes `{animated: false}` to scroll instantly when the edit composer gains focus and the
     * soft keyboard shifts the viewport.
     */
    scrollToIndex: (index: number, options?: {isEditing?: boolean; animated?: boolean}) => void;
    scrollToBottom: () => void;
    scrollToEnd: () => void;
    scrollToOffset: (offset: number) => void;
};

export default ReportScrollManagerData;
