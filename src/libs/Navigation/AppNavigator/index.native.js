import React from 'react';
import AppNavigator from './AppNavigator';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    ...windowDimensionsPropTypes,
};

const Navigator = props => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <AppNavigator {...props} responsive={!props.isSmallScreenWidth} />
);

Navigator.propTypes = propTypes;
export default withWindowDimensions(Navigator);
