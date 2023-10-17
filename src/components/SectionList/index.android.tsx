import React, {ForwardedRef, forwardRef} from 'react';
import {SectionListProps, SectionList} from 'react-native';

function SectionListWithoutSubviews(props: SectionListProps<SectionList>, ref: ForwardedRef<SectionList>) {
    return (
        <SectionList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            // For Android we want to use removeClippedSubviews since it helps manage memory consumption. When we
            // run out memory images stop loading and appear as grey circles
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            removeClippedSubviews
        />
    );
}

export default forwardRef(SectionListWithoutSubviews);
