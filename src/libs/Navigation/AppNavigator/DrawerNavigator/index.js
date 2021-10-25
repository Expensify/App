import React from 'react';
import withWindowDimensions from '../../../../components/withWindowDimensions';
import BaseDrawerNavigator from './BaseDrawerNavigator';
import {propTypes, defaultProps} from './drawerNavigatorPropTypes';

const DrawerNavigator = props => (
    <BaseDrawerNavigator
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}

        // Modern implementation of drawer does not work on mobile web
        // eslint-disable-next-line react/jsx-props-no-multi-spaces
        useLegacyImplementation={props.isSmallScreenWidth}
    />
);

DrawerNavigator.propTypes = propTypes;
DrawerNavigator.defaultProps = defaultProps;
DrawerNavigator.displayName = 'DrawerNavigator';
export default withWindowDimensions(DrawerNavigator);
