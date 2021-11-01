import React from 'react';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import BaseDrawerNavigator from './BaseDrawerNavigator';
import propTypes from './drawerNavigatorPropTypes';

const DrawerNavigator = props => (
    <BaseDrawerNavigator
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        useLegacyImplementation={false}
    />
);

DrawerNavigator.propTypes = propTypes;
DrawerNavigator.displayName = 'DrawerNavigator';
export default withWindowDimensions(DrawerNavigator);
