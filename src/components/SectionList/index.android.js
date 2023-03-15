import React, {forwardRef} from 'react';
import {SectionList} from 'react-native';

export default forwardRef((props, ref) => (
    <SectionList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        // For Android we want to use removeClippedSubviews since it helps manage memory consumption. When we
        // run out memory images stop loading and appear as grey circles
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        removeClippedSubviews
    />
));
