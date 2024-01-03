import { Section } from '@components/OptionsList/types';
import { OptionData } from '@libs/ReportUtils';
import {ForwardedRef} from 'react';
import {SectionList, SectionListProps} from 'react-native';

// TODO: Make it generic?
type ForwardedSectionList = {
    (props: SectionListProps<OptionData, Section>, ref: ForwardedRef<SectionList>): React.ReactNode;
    displayName: string;
};

export default ForwardedSectionList;
