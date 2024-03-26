import type {FlatListProps} from 'react-native';

type MaintainVisibleContentPositionProps = {
    minIndexForVisible: number;
    autoscrollToTopThreshold?: number;
};

type CustomFlatListProps<TItem> = FlatListProps<TItem> & {
    maintainVisibleContentPosition: MaintainVisibleContentPositionProps | null;
    horizontal?: boolean;
};

export default CustomFlatListProps;
