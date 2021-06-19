import React, {forwardRef} from 'react';
import BaseInvertedFlatList from './BaseInvertedFlatList';

const InvertedFlatList = forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseInvertedFlatList shouldMeasureItems {...props} ref={ref} />
));

export default InvertedFlatList;
