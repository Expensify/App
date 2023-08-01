import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import Tab from '../actions/Tab';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /* ID of the tab component to be saved in onyx */
    id: PropTypes.string.isRequired,

    /* Name of the selected tab */
    selectedTab: PropTypes.string,

    /* Children nodes */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    selectedTab: '',
};

const TopTab = createMaterialTopTabNavigator();

// This takes all the same props as MaterialTopTabsNavigator: https://reactnavigation.org/docs/material-top-tab-navigator/#props,
// except ID is now required, and it gets a `selectedTab` from Onyx
function OnyxTabNavigator({id, selectedTab, children, ...rest}) {
    return (
        <TopTab.Navigator
            id={id}
            initialRouteName={selectedTab}
            screenListeners={{
                state: (event) => {
                    const state = lodashGet(event, 'data.state', {});
                    const index = state.index;
                    const routeNames = state.routeNames;
                    Tab.setSelectedTab(id, routeNames[index]);
                },
                ...(rest.screenListeners || {}),
            }}
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...rest}
        >
            {children}
        </TopTab.Navigator>
    );
}

OnyxTabNavigator.defaultProps = defaultProps;
OnyxTabNavigator.propTypes = propTypes;
OnyxTabNavigator.displayName = 'OnyxTabNavigator';

export default withOnyx({
    selectedTab: {
        key: ({id}) => `${ONYXKEYS.SELECTED_TAB}_${id}`,
    },
})(OnyxTabNavigator);
