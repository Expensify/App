import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type PressableAvatarWithIndicatorOnyxProps = {
    /** Indicates whether the app is loading initial data */
    isLoading: OnyxEntry<boolean>;
};

type PressableAvatarWithIndicatorProps = PressableAvatarWithIndicatorOnyxProps & {
    /** Whether the create menu is open or not */
    isCreateMenuOpen: boolean;
};

function PressableAvatarWithIndicator({isCreateMenuOpen = false, isLoading = true}: PressableAvatarWithIndicatorProps) {
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const showSettingsPage = useCallback(() => {
        if (isCreateMenuOpen) {
            // Prevent opening Settings page when click profile avatar quickly after clicking FAB icon
            return;
        }

        Navigation.navigate(ROUTES.SETTINGS);
    }, [isCreateMenuOpen]);

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
            role={CONST.ROLE.BUTTON}
            onPress={showSettingsPage}
        >
            <OfflineWithFeedback pendingAction={currentUserPersonalDetails.pendingFields?.avatar ?? null}>
                <AvatarWithIndicator
                    source={UserUtils.getAvatar(currentUserPersonalDetails.avatar, currentUserPersonalDetails.accountID)}
                    tooltipText={translate('profilePage.profile')}
                    fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                    isLoading={!!isLoading && !currentUserPersonalDetails.avatar}
                />
            </OfflineWithFeedback>
        </PressableWithoutFeedback>
    );
}

PressableAvatarWithIndicator.displayName = 'PressableAvatarWithIndicator';

export default withOnyx<PressableAvatarWithIndicatorProps, PressableAvatarWithIndicatorOnyxProps>({
    isLoading: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(PressableAvatarWithIndicator);
