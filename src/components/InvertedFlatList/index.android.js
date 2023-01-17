import React, {forwardRef} from 'react';
import {View} from 'react-native';
import BaseInvertedFlatList from './BaseInvertedFlatList';
import styles from '../../styles/styles';

const InvertedCell = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <View {...props} style={styles.invert} />
);

export default forwardRef((props, ref) => (
    <BaseInvertedFlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        ref={ref}

        // Manually invert the FlatList to circumvent a react-native bug that causes ANR (application not responding) on android 13
        inverted={false}
        style={styles.invert}
        ListFooterComponentStyle={styles.invert}
        verticalScrollbarPosition="left" // We are mirroring the X and Y axis, so we need to swap the scrollbar position

        CellRendererComponent={InvertedCell}
    />
));
