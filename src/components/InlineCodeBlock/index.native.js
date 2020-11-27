/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {View, Platform} from 'react-native';
import styles from '../../styles/StyleSheet';
import propTypes from './propTypes';

const InlineCodeBlock = ({
    TDefaultRenderer,
    defaultRendererProps,
    boxModelStyle,
    textStyle,
}) => (
    <View
        style={{
            ...boxModelStyle,
            ...Platform.select({ios: styles.mbn5, default: null}),
        }}
    >
        <TDefaultRenderer style={textStyle} {...defaultRendererProps} />
    </View>
);

InlineCodeBlock.propTypes = propTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
