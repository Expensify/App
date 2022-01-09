import React from 'react';
import Text from '../../Text';
import {propTypes, defaultProps} from './textWithOverflowPropTypes';

const BaseTextWithInlineDisplay = props => (
    <Text
        style={props.textStyle}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {props.children}
    </Text>
);

BaseTextWithInlineDisplay.propTypes = propTypes;
BaseTextWithInlineDisplay.defaultProps = defaultProps;
BaseTextWithInlineDisplay.displayName = 'BaseTextWithInlineDisplay';

export default BaseTextWithInlineDisplay;
