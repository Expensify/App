import React from 'react';
import ResponsiveNavigator from './ResponsiveNavigator';
import SmallScreenNavigator from './SmallScreenNavigator';

const Navigator = (props) => {
    if (props.isSmallScreenWidth) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <SmallScreenNavigator {...props} />;
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <ResponsiveNavigator {...props} />;
};

export default Navigator;
