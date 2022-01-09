import React from 'react';
import _ from 'underscore';
import BaseTextWithOverflow from './BaseTextWithOverflow';
import styles from '../../../styles/styles';
import * as StyleUtils from '../../../styles/StyleUtils';
import {propTypes, defaultProps} from './textWithOverflowPropTypes';

const TextWithOverflow = props => (
    <BaseTextWithOverflow
        textStyle={[styles.textWithEllipsis, ...StyleUtils.parseStyleAsArray(props.textStyle)]}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {..._.omit(props, 'textStyle')}
    >
        {props.children}
    </BaseTextWithOverflow>
);

TextWithOverflow.propTypes = propTypes;
TextWithOverflow.defaultProps = defaultProps;
TextWithOverflow.displayName = 'TextWithOverflow';

export default TextWithOverflow;
