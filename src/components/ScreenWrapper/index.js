import React from 'react';
import compose from '../../libs/compose';
import {propTypes, defaultProps} from './propTypes';
import BaseScreenWrapper from './BaseScreenWrapper';
import withEnvironment from '../withEnvironment';
import withWindowDimensions from '../withWindowDimensions';

const ScreenWrapper = props => (
    <BaseScreenWrapper
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
);

ScreenWrapper.propTypes = propTypes;
ScreenWrapper.defaultProps = defaultProps;
ScreenWrapper.displayName = 'ScreenWrapper';

export default compose(
    withEnvironment,
    withWindowDimensions,
)(ScreenWrapper);