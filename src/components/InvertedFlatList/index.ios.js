import React, {forwardRef} from 'react';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import CellRendererComponent from './CellRendererComponent';

export default forwardRef((props, ref) => (
    <BaseInvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        inverted
        CellRendererComponent={CellRendererComponent}
    />
));
