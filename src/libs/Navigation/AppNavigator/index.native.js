import React from 'react';
import AppNavigator from './AppNavigator';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const Navigator = (props) => {
    if (props.isSmallScreenWidth) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <AppNavigator {...props} />;
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <AppNavigator {...props} responsive />;
};

Navigator.propTypes = propTypes;
export default withWindowDimensions(Navigator);
