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

// There is a bug with the component in Android: https://github.com/facebook/react-native/issues/28004
// In most cases, it will be better with no behavior prop given.
defaultProps.keyboardAvoidingViewBehavior = '';

ScreenWrapper.propTypes = propTypes;
ScreenWrapper.defaultProps = defaultProps;
ScreenWrapper.displayName = 'ScreenWrapper';

export default ScreenWrapper;
