import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles, {webViewStyles} from '../../styles/StyleSheet';

const propTypes = {
    children: PropTypes.node.isRequired,
};

const InlineCodeBlock = ({children}) => (
    <View style={[webViewStyles.codeTagStyle, styles.mbn5]}>
        {children}
    </View>
);

InlineCodeBlock.propTypes = propTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
