import type {ForwardedRef} from 'react';
import type {SectionListProps as RNSectionListProps, SectionList} from 'react-native';

type SectionListProps<ItemT, SectionT> = RNSectionListProps<ItemT, SectionT> & {
    /**
     * If enabled, the content will have a bottom padding equal to account for the safe bottom area inset.
     */
    addBottomSafeAreaPadding?: boolean;
};

type SectionListRef<ItemT, SectionT> = ForwardedRef<SectionList<ItemT, SectionT>>;

export type {SectionListProps, SectionListRef};
