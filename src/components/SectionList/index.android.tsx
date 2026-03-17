import React from 'react';
import BaseSectionList from './BaseSectionList';
import type {SectionListProps} from './types';

function SectionListWithRef<ItemT, SectionT>({ref, ...props}: SectionListProps<ItemT, SectionT>) {
    return (
        <BaseSectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            // For Android we want to use removeClippedSubviews since it helps manage memory consumption. When we
            // run out memory images stop loading and appear as grey circles
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            removeClippedSubviews={props.removeClippedSubviews ?? true}
        />
    );
}

export default SectionListWithRef;
