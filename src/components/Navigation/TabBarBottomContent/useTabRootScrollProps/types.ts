import type {ScrollViewProps} from 'react-native';

type TabRootScrollProps = Pick<ScrollViewProps, 'contentContainerStyle' | 'contentInsetAdjustmentBehavior'>;

type TabRootScrollOptions = {
    /** The list already ends with the bottom safe area */
    hasBottomSafeAreaPadding?: boolean;

    /** The list already ends with room for the offline indicator, as a ScrollView with `addBottomSafeAreaPadding` does */
    hasOfflineIndicatorPadding?: boolean;

    /** The content container grows to the height of the list and lays its content out in it, as a centered empty state does */
    fillsVisibleArea?: boolean;
};

export default TabRootScrollProps;
export type {TabRootScrollOptions};
