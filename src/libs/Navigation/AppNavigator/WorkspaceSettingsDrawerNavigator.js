import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import styles, {getNavigationDrawerStyle, getWorkspaceSettingsDrawerType} from '../../../styles/styles';
import WorkspaceCard from '../../../pages/workspace/WorkspaceCard';
import WorkspaceSidebar from '../../../pages/workspace/WorkspaceSidebar';

const propTypes = {
    ...windowDimensionsPropTypes,
};
const defaultProps = {};
const Drawer = createDrawerNavigator();

const WorkspaceSettingsDrawerNavigator = props => (
    <Drawer.Navigator
        defaultStatus={props.isSmallScreenWidth ? 'open' : 'closed'}
        sceneContainerStyle={styles.navigationSceneContainer}
        drawerContent={() => <WorkspaceSidebar />}
        screenOptions={{
            cardStyle: styles.navigationScreenCardStyle,
            headerShown: false,
            drawerType: getWorkspaceSettingsDrawerType(props.isSmallScreenWidth),
            drawerStyle: getNavigationDrawerStyle(
                props.windowWidth,
                props.windowHeight,
                props.isSmallScreenWidth,
            ),
            swipeEdgeWidth: 500,
        }}
    >
        <Drawer.Screen
            name="WorkspaceCard"
            component={WorkspaceCard}
        />
    </Drawer.Navigator>
);

WorkspaceSettingsDrawerNavigator.propTypes = propTypes;
WorkspaceSettingsDrawerNavigator.defaultProps = defaultProps;
WorkspaceSettingsDrawerNavigator.displayName = 'WorkspaceSettingsDrawerNavigator';

export default withWindowDimensions(WorkspaceSettingsDrawerNavigator);
