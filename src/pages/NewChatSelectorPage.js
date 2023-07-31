import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import TabSelector from '../components/TabSelector/TabSelector';
import NewChatPage from './NewChatPage';
import WorkspaceNewRoomPage from './workspace/WorkspaceNewRoomPage';
import CONST from '../CONST';
import withWindowDimensions, {windowDimensionsPropTypes} from '../components/withWindowDimensions';
import HeaderWithBackButton from '../components/HeaderWithBackButton';
import ScreenWrapper from '../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';

const TopTab = createMaterialTopTabNavigator();

const propTypes = {
    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    betas: [],
    personalDetails: {},
    reports: {},
};

function NewChatSelectorPage(props) {
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
        >
            <>
                <HeaderWithBackButton title={props.translate('sidebarScreen.fabNewChat')} />
                <TopTab.Navigator
                    backBehavior="order"
                    tabBar={({state, navigation}) => (
                        <TabSelector
                            state={state}
                            navigation={navigation}
                        />
                    )}
                >
                    <TopTab.Screen
                        name={CONST.TAB.TAB_NEW_CHAT}
                        component={NewChatPage}
                    />
                    <TopTab.Screen
                        name={CONST.TAB.TAB_NEW_ROOM}
                        component={WorkspaceNewRoomPage}
                    />
                </TopTab.Navigator>
            </>
        </ScreenWrapper>
    );
}

NewChatSelectorPage.propTypes = propTypes;
NewChatSelectorPage.defaultProps = defaultProps;
NewChatSelectorPage.displayName = 'NewChatPage';

export default compose(
    withLocalize,
    withWindowDimensions,
)(NewChatSelectorPage);
