import React from 'react';
import BaseScreenWrapper from './BaseScreenWrapper';
import {defaultProps, propTypes} from './propTypes';

const ScreenWrapper = props => (
    <BaseScreenWrapper
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    >
        {props.children}
    </BaseScreenWrapper>
);
ScreenWrapper.propTypes = propTypes;
ScreenWrapper.defaultProps = defaultProps;

export default ScreenWrapper;
