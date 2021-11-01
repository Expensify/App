import React from 'react';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import BaseDrawerNavigator from './BaseDrawerNavigator';
import propTypes from './drawerNavigatorPropTypes';

const DrawerNavigator = props => (
    <BaseDrawerNavigator
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}

        // On mobile web, the non-legacy (modern) version of the DrawerNavigator has issues opening and closing,
        // and the legacy version breaks the layout while resizing on desktop and web.
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        useLegacyImplementation={props.isSmallScreenWidth}
    />
);

DrawerNavigator.propTypes = propTypes;
DrawerNavigator.displayName = 'DrawerNavigator';
export default withWindowDimensions(DrawerNavigator);
