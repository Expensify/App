import type {ForwardedRef} from 'react';
import type {SectionListProps as RNSectionListProps, SectionList} from 'react-native';

type SectionListProps<ItemT, SectionT> = RNSectionListProps<ItemT, SectionT> & {
    /** Whether to add bottom safe area padding to the content. */
    addBottomSafeAreaPadding?: boolean;

    /** Whether to add bottom safe area padding to the content. */
    addOfflineIndicatorBottomSafeAreaPadding?: boolean;
};

type SectionListRef<ItemT, SectionT> = ForwardedRef<SectionList<ItemT, SectionT>>;

export type {SectionListProps, SectionListRef};
