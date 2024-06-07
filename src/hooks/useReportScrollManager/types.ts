import type {FlatListRefType} from '@pages/home/ReportScreenContext';

type ReportScrollManagerData = {
    /**
     * Reference to the FlatList component.
     */
    ref: FlatListRefType;
    /**
     * Scroll to the provided index.
     * @param viewPosition (optional) - `0`: top, `0.5`: center, `1`: bottom
     */
    scrollToIndex: (index: number, isEditing?: boolean, viewPosition?: number) => void;
    /**
     * Scroll to the bottom of the flatlist.
     */
    scrollToBottom: () => void;
};

export default ReportScrollManagerData;
