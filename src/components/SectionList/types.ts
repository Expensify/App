import type {ForwardedRef} from 'react';
import type {SectionList, SectionListProps as SectionListPropsRN} from 'react-native';

type SectionListProps<ItemT, SectionT> = SectionListPropsRN<ItemT, SectionT>;
type SectionListRef<ItemT, SectionT> = ForwardedRef<SectionList<ItemT, SectionT>>;

export type {SectionListProps, SectionListRef};
