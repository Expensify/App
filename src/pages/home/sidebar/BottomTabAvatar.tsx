import {useRoute} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import AvatarWithDelegateAvatar from './AvatarWithDelegateAvatar';
import AvatarWithOptionalStatus from './AvatarWithOptionalStatus';
import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

type BottomTabAvatarProps = {
    /** Whether the create menu is open or not */
    isCreateMenuOpen?: boolean;

    /** Whether the avatar is selected */
    isSelected?: boolean;
};

function BottomTabAvatar({isCreateMenuOpen = false, isSelected = false}: BottomTabAvatarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const delegateEmail = account?.delegatedAccess?.delegate ?? '';
    const route = useRoute();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const emojiStatus = currentUserPersonalDetails?.status?.emojiCode ?? '';
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const showSettingsPage = useCallback(() => {
        if (isCreateMenuOpen) {
            // Prevent opening Settings page when click profile avatar quickly after clicking FAB icon
            return;
        }

        if (route.name === SCREENS.SETTINGS.WORKSPACES && shouldUseNarrowLayout) {
            Navigation.goBack(ROUTES.SETTINGS);
            return;
        }

        if (route.name === SCREENS.WORKSPACE.INITIAL) {
            Navigation.dismissModal();
            return;
        }

        interceptAnonymousUser(() => {
            const rootState = navigationRef.getRootState();
            const lastSettingsOrWorkspaceNavigatorRoute = rootState.routes.findLast(
                (rootRoute) => rootRoute.name === NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR || rootRoute.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
            );

            // If there is a workspace navigator route, then we should open the workspace initial screen as it should be "remembered".
            if (lastSettingsOrWorkspaceNavigatorRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
                const params = lastSettingsOrWorkspaceNavigatorRoute.state?.routes.at(0)?.params as WorkspaceSplitNavigatorParamList[typeof SCREENS.WORKSPACE.INITIAL];
                // Screens of this navigator should always have policyID
                if (params.policyID) {
                    Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(params.policyID));
                }
                return;
            }

            // If there is settings workspace screen in the settings navigator, then we should open the settings workspaces as it should be "remembered".
            if (
                lastSettingsOrWorkspaceNavigatorRoute &&
                lastSettingsOrWorkspaceNavigatorRoute.state &&
                lastSettingsOrWorkspaceNavigatorRoute.state.routes.at(-1)?.name === SCREENS.SETTINGS.WORKSPACES
            ) {
                Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
                return;
            }

            // Otherwise we should simply open the settings navigator.
            // This case also covers if there is no route to remember.
            Navigation.navigate(ROUTES.SETTINGS);
        });
    }, [isCreateMenuOpen, shouldUseNarrowLayout, route.name]);

    let children;

    if (delegateEmail) {
        children = (
            <AvatarWithDelegateAvatar
                delegateEmail={delegateEmail}
                isSelected={isSelected}
                containerStyle={styles.sidebarStatusAvatarWithEmojiContainer}
            />
        );
    } else if (emojiStatus) {
        children = (
            <AvatarWithOptionalStatus
                emojiStatus={emojiStatus}
                isSelected={isSelected}
                containerStyle={styles.sidebarStatusAvatarWithEmojiContainer}
            />
        );
    } else {
        children = (
            <ProfileAvatarWithIndicator
                isSelected={isSelected}
                containerStyles={styles.tn0Half}
            />
        );
    }

    return (
        <Tooltip text={translate('initialSettingsPage.accountSettings')}>
            <PressableWithFeedback
                onPress={showSettingsPage}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
                wrapperStyle={styles.flex1}
                style={[styles.bottomTabBarItem]}
            >
                {children}
                <Text style={[styles.textSmall, styles.textAlignCenter, isSelected ? styles.textBold : styles.textSupporting, styles.mt0Half, styles.bottomTabBarLabel]}>
                    {translate('common.settings')}
                </Text>
            </PressableWithFeedback>
        </Tooltip>
    );
}

BottomTabAvatar.displayName = 'BottomTabAvatar';
export default BottomTabAvatar;
