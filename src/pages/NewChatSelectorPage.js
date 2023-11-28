import React from 'react';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TabSelector from '@components/TabSelector/TabSelector';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import compose from '@libs/compose';
import OnyxTabNavigator, {TopTab} from '@libs/Navigation/OnyxTabNavigator';
import Permissions from '@libs/Permissions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import NewChatPage from './NewChatPage';
import WorkspaceNewRoomPage from './workspace/WorkspaceNewRoomPage';

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
            shouldEnableKeyboardAvoidingView={false}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicator={false}
            shouldEnableMaxHeight
            testID={NewChatSelectorPage.displayName}
        >
            <HeaderWithBackButton title={props.translate('sidebarScreen.fabNewChat')} />
            {Permissions.canUsePolicyRooms(props.betas) ? (
                <OnyxTabNavigator
                    id={CONST.TAB.NEW_CHAT_TAB_ID}
                    tabBar={({state, navigation, position}) => (
                        <TabSelector
                            state={state}
                            navigation={navigation}
                            position={position}
                        />
                    )}
                >
                    <TopTab.Screen
                        name={CONST.TAB.NEW_CHAT}
                        component={NewChatPage}
                    />
                    <TopTab.Screen
                        name={CONST.TAB.NEW_ROOM}
                        component={WorkspaceNewRoomPage}
                    />
                </OnyxTabNavigator>
            ) : (
                <NewChatPage />
            )}
        </ScreenWrapper>
    );
}

NewChatSelectorPage.propTypes = propTypes;
NewChatSelectorPage.defaultProps = defaultProps;
NewChatSelectorPage.displayName = 'NewChatPage';

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        betas: {key: ONYXKEYS.BETAS},
    }),
)(NewChatSelectorPage);
