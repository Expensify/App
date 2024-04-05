/* eslint-disable rulesdir/onyx-props-must-have-default */
import React, {useCallback} from 'react';
import {OnyxEntry} from 'react-native-onyx';
import {PressableWithFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import {navigationSidebarRef} from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';
import SCREENS from '@src/SCREENS';
import AvatarWithOptionalStatus from './AvatarWithOptionalStatus';
import ProfileAvatarWithIndicator from './ProfileAvatarWithIndicator';

type BottomTabAvatarProps = {
    /** Whether the create menu is open or not */
    isCreateMenuOpen?: boolean;

    /** Whether the avatar is selected */
    isSelected?: boolean;

    /** Last visited path in the app */
    lastVisitedPath: OnyxEntry<string | undefined>;

    persistedSettingsPath: OnyxEntry<string | undefined>;

    onPress: (lastVisitedPath: OnyxEntry<string | undefined>) => void;
};

function BottomTabAvatar({isCreateMenuOpen = false, isSelected = false, lastVisitedPath, persistedSettingsPath, onPress}: BottomTabAvatarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const emojiStatus = currentUserPersonalDetails?.status?.emojiCode ?? '';

    const showSettingsPage = useCallback(() => {
        if (isCreateMenuOpen) {
            // Prevent opening Settings page when click profile avatar quickly after clicking FAB icon
            return;
        }

        interceptAnonymousUser(() => {
            onPress(lastVisitedPath);

            Navigation.navigate(persistedSettingsPath);
            navigationSidebarRef.navigate(SCREENS.SETTINGS.ROOT);
        });
    }, [isCreateMenuOpen, lastVisitedPath, onPress, persistedSettingsPath]);

    let children;

    if (emojiStatus) {
        children = (
            <AvatarWithOptionalStatus
                emojiStatus={emojiStatus}
                isSelected={isSelected}
            />
        );
    } else {
        children = <ProfileAvatarWithIndicator isSelected={isSelected} />;
    }

    return (
        <Tooltip text={translate('profilePage.profile')}>
            <PressableWithFeedback
                onPress={showSettingsPage}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
                wrapperStyle={styles.flex1}
                style={styles.bottomTabBarItem}
            >
                {children}
            </PressableWithFeedback>
        </Tooltip>
    );
}

BottomTabAvatar.displayName = 'BottomTabAvatar';
export default BottomTabAvatar;
