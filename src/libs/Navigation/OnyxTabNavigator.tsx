import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Tab from '@userActions/Tab';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** ID of the tab component to be saved in onyx */
    id: PropTypes.string.isRequired,

    /** Name of the selected tab */
    selectedTab: PropTypes.string,

    /** Children nodes */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    selectedTab: '',
};

// eslint-disable-next-line rulesdir/no-inline-named-export
export const TopTab = createMaterialTopTabNavigator();

// This takes all the same props as MaterialTopTabsNavigator: https://reactnavigation.org/docs/material-top-tab-navigator/#props,
// except ID is now required, and it gets a `selectedTab` from Onyx
function OnyxTabNavigator({id, selectedTab, children, ...rest}) {
    return (
        <TopTab.Navigator
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...rest}
            id={id}
            initialRouteName={selectedTab}
            backBehavior="initialRoute"
            keyboardDismissMode="none"
            screenListeners={{
                state: (event) => {
                    const state = event.data.state;
                    const index = state.index;
                    const routeNames = state.routeNames;
                    Tab.setSelectedTab(id, routeNames[index]);
                },
                ...(rest.screenListeners || {}),
            }}
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
        key: ({id}) => `${ONYXKEYS.COLLECTION.SELECTED_TAB}${id}`,
    },
})(OnyxTabNavigator);
