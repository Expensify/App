import React, {forwardRef} from 'react';
import BaseInvertedFlatList from './BaseInvertedFlatList';

export default forwardRef((props, ref) => (
    <BaseInvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
    />
));
