import type {MaterialTopTabNavigationEventMap} from '@react-navigation/material-top-tabs';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import type {EventMapCore, NavigationState, ScreenListeners} from '@react-navigation/native';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {TabSelectorProps} from '@components/TabSelector/TabSelector';
import type {IOURequestType} from '@libs/actions/IOU';
import Tab from '@userActions/Tab';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SelectedTabRequest} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import {defaultScreenOptions} from './OnyxTabNavigatorConfig';

type OnyxTabNavigatorOnyxProps = {
    selectedTab: OnyxEntry<SelectedTabRequest>;
};

type OnyxTabNavigatorProps = OnyxTabNavigatorOnyxProps &
    ChildrenProps & {
        /** ID of the tab component to be saved in onyx */
        id: string;

        /** Name of the selected tab */
        selectedTab?: SelectedTabRequest;

        /** A function triggered when a tab has been selected */
        onTabSelected?: (newIouType: IOURequestType) => void;

        tabBar: (props: TabSelectorProps) => React.ReactNode;

        screenListeners?: ScreenListeners<NavigationState, MaterialTopTabNavigationEventMap>;
    };

// eslint-disable-next-line rulesdir/no-inline-named-export
export const TopTab = createMaterialTopTabNavigator();

// This takes all the same props as MaterialTopTabsNavigator: https://reactnavigation.org/docs/material-top-tab-navigator/#props,
// except ID is now required, and it gets a `selectedTab` from Onyx
function OnyxTabNavigator({id, selectedTab, children, onTabSelected = () => {}, screenListeners, ...rest}: OnyxTabNavigatorProps) {
    return (
        <TopTab.Navigator
            /* eslint-disable-next-line react/jsx-props-no-spreading */
            {...rest}
            id={id}
            initialRouteName={selectedTab}
            backBehavior="initialRoute"
            keyboardDismissMode="none"
            screenListeners={{
                state: (e) => {
                    const event = e as unknown as EventMapCore<NavigationState>['state'];
                    const state = event.data.state;
                    const index = state.index;
                    const routeNames = state.routeNames;
                    Tab.setSelectedTab(id, routeNames[index] as SelectedTabRequest);
                    onTabSelected(routeNames[index] as IOURequestType);
                },
                ...(screenListeners ?? {}),
            }}
            screenOptions={defaultScreenOptions}
        >
            {children}
        </TopTab.Navigator>
    );
}

OnyxTabNavigator.displayName = 'OnyxTabNavigator';

export default withOnyx<OnyxTabNavigatorProps, OnyxTabNavigatorOnyxProps>({
    selectedTab: {
        key: ({id}) => `${ONYXKEYS.COLLECTION.SELECTED_TAB}${id}`,
    },
})(OnyxTabNavigator);
