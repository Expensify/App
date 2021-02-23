import React from 'react';
import withWindowDimensions from '../../../components/withWindowDimensions';
import AppNavigator from './AppNavigator';

export default withWindowDimensions(props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <AppNavigator responsive {...props} />
));
