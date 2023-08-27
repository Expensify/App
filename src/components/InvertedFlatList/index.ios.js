import React, {forwardRef} from 'react';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import CellRendererComponent from './CellRendererComponent';
import styles from '../../styles/styles';

export default forwardRef((props, ref) => (
    <BaseInvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}
        inverted
        contentContainerStyle={styles.justifyContentEnd}
        CellRendererComponent={CellRendererComponent}
    />
));
