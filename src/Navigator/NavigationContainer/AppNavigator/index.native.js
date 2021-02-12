import React from 'react';
import AppNavigator from './AppNavigator';

const Navigator = (props) => {
    if (props.isSmallScreenWidth) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <AppNavigator {...props} />;
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <AppNavigator {...props} responsive />;
};

export default Navigator;
