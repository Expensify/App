import React, {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import { withOnyx} from 'react-native-onyx';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type PressableAvatarWithIndicatorOnyxProps = {
    isLoading: OnyxEntry<boolean>;
};

type PressableAvatarWithIndicatorProps = {
    isCreateMenuOpen?: boolean;
} & WithCurrentUserPersonalDetailsProps & PressableAvatarWithIndicatorOnyxProps;

function PressableAvatarWithIndicator({isCreateMenuOpen, currentUserPersonalDetails, isLoading}: PressableAvatarWithIndicatorProps) {
    const {translate} = useLocalize();

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
            <OfflineWithFeedback pendingAction={currentUserPersonalDetails?.pendingFields?.avatar ?? undefined}>
                <AvatarWithIndicator
                    source={UserUtils.getAvatar(currentUserPersonalDetails.avatar, currentUserPersonalDetails.accountID)}
                    tooltipText={translate('common.settings')}
                    fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                    isLoading={isLoading === true && !currentUserPersonalDetails.avatar}
                />
            </OfflineWithFeedback>
        </PressableWithoutFeedback>
    );
}

PressableAvatarWithIndicator.displayName = 'PressableAvatarWithIndicator';
export default withCurrentUserPersonalDetails(withOnyx<PressableAvatarWithIndicatorProps, PressableAvatarWithIndicatorOnyxProps>({
        isLoading: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
    })(PressableAvatarWithIndicator))
