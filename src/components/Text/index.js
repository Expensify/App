import React from 'react';
import BaseText from './BaseText';
import {defaultProps, propTypes} from './baseTextPropTypes';

class Text extends React.PureComponent {
    render() {
        return (
            <BaseText
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...this.props}
            />
        );
    }
}

Text.propTypes = propTypes;
Text.defaultProps = defaultProps;

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <Text {...props} innerRef={ref} />
));
