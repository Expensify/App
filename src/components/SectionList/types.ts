import type {ForwardedRef} from 'react';
import type {SectionList, SectionListProps} from 'react-native';

type ForwardedSectionList = {
    (props: SectionListProps<SectionList>, ref: ForwardedRef<SectionList>): React.ReactNode;
    displayName: string;
};

export default ForwardedSectionList;
