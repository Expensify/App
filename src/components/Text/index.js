import React, {forwardRef} from 'react';
import BaseText from './BaseText';
import {defaultProps as baseTextDefaultProps, propTypes as baseTextPropTypes} from './baseTextPropTypes';

const Text = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseText {...props} />
);

Text.propTypes = baseTextPropTypes;
Text.defaultProps = baseTextDefaultProps;
Text.displayName = 'Text';

export default forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <Text {...props} innerRef={ref} />
));
