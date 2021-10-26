import React from 'react';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import BaseDrawerNavigator from './BaseDrawerNavigator';
import {propTypes, defaultProps} from './drawerNavigatorPropTypes';

const DrawerNavigator = props => (
    <BaseDrawerNavigator
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}

        // Drawer's implementaion is buggy. Modern implementaion does not work on mobile web and legacy breaks the layout on Desktop while resizing.
        // For some reason, drawer never closes when opening the Drawer screen on mobile web.
        // So we will switch between implementations based on the device width.
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        useLegacyImplementation={props.isSmallScreenWidth}
    />
);

DrawerNavigator.propTypes = propTypes;
DrawerNavigator.defaultProps = defaultProps;
DrawerNavigator.displayName = 'DrawerNavigator';
export default withWindowDimensions(DrawerNavigator);
