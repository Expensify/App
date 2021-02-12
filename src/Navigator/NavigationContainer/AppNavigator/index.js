import React from 'react';
import AppNavigator from './AppNavigator';

export default props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <AppNavigator responsive {...props} />
);
