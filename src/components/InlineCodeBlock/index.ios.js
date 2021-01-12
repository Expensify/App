/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {View} from 'react-native';
import styles from '../../styles/styles';
import inlineCodeBlockPropTypes from './inlineCodeBlockPropTypes';

const InlineCodeBlock = ({
    TDefaultRenderer,
    defaultRendererProps,
    boxModelStyle,
    textStyle,
}) => (
    <View
        style={{
            ...boxModelStyle,
            ...styles.mbn1,
        }}
    >
        <TDefaultRenderer style={textStyle} {...defaultRendererProps} />
    </View>
);

InlineCodeBlock.propTypes = inlineCodeBlockPropTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
