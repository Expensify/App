import React from 'react';
import BaseTextWithOverflow from './BaseTextWithOverflow';
import {propTypes, defaultProps} from './textWithOverflowPropTypes';

const TextWithOverflow = props => (
    <BaseTextWithOverflow
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {props.children}
    </BaseTextWithOverflow>
);

TextWithOverflow.propTypes = propTypes;
TextWithOverflow.defaultProps = defaultProps;
TextWithOverflow.displayName = 'TextWithOverflow';

export default TextWithOverflow;
