import React from 'react';
import PropTypes from 'prop-types';
import {Text} from 'react-native';
import {webViewStyles} from '../../styles/StyleSheet';

const propTypes = {
    children: PropTypes.node.isRequired,
};

const InlineCodeBlock = ({children}) => (
    <Text style={[webViewStyles.codeTagStyle]}>
        {children}
    </Text>
);

InlineCodeBlock.propTypes = propTypes;
InlineCodeBlock.displayName = 'InlineCodeBlock';
export default InlineCodeBlock;
