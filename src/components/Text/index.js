import React, {forwardRef} from 'react';
import BaseText from './BaseText';
import {defaultProps, propTypes} from './baseTextPropTypes';

const Text = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseText {...props} />
);

Text.propTypes = propTypes;
Text.defaultProps = defaultProps;
Text.displayName = 'Text';

export default forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <Text {...props} innerRef={ref} />
));
