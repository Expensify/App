import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles, {webViewStyles} from '../../style/StyleSheet';

const propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired
};

const InlineCodeBlock = ({children}) => (
    <View style={[webViewStyles.codeTagStyle, styles.mbn5]}>
        {children}
    </View>
);

InlineCodeBlock.propTypes = propTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
