import React from 'react';
import BaseSectionList from './BaseSectionList';
import type {SectionListProps} from './types';

function SectionList<ItemT, SectionT>({ref, ...props}: SectionListProps<ItemT, SectionT>) {
    return (
        <BaseSectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

export default SectionList;
