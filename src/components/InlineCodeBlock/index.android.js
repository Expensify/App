import React from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {webViewStyles} from '../../styles/StyleSheet';

const propTypes = {
    children: PropTypes.node.isRequired,
};

const InlineCodeBlock = ({children}) => (
    <View style={[webViewStyles.codeTagStyle]}>
        {children}
    </View>
);

InlineCodeBlock.propTypes = propTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
