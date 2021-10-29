import React from 'react';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import BaseDrawerNavigator from './BaseDrawerNavigator';
import propTypes from './drawerNavigatorPropTypes';

const DrawerNavigator = props => (
    <BaseDrawerNavigator
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}

        // On mobile web, the non legacy version of the DrawerNavigator breaks the layout on Desktop while resizing
        // and the drawer gets stuck in an open state when navigating.
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        useLegacyImplementation={props.isSmallScreenWidth}
    />
);

DrawerNavigator.propTypes = propTypes;
DrawerNavigator.displayName = 'DrawerNavigator';
export default withWindowDimensions(DrawerNavigator);
