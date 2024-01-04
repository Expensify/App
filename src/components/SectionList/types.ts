import {ForwardedRef} from 'react';
import {SectionList, SectionListProps} from 'react-native';

type ForwardedSectionList<ItemT, SectionT> = {
    (props: SectionListProps<ItemT, SectionT>, ref: ForwardedRef<SectionList>): React.ReactNode;
    displayName: string;
};

export default ForwardedSectionList;
