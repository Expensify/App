import React, {useCallback} from 'react';
import {withOnyx} from 'react-native-onyx';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type PressableAvatarWithIndicatorProps = {
    isCreateMenuOpen?: boolean;
    isLoading?: boolean;
} & WithCurrentUserPersonalDetailsProps;

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
                    isLoading={isLoading && !currentUserPersonalDetails.avatar}
                />
            </OfflineWithFeedback>
        </PressableWithoutFeedback>
    );
}

PressableAvatarWithIndicator.displayName = 'PressableAvatarWithIndicator';
export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        isLoading: {
            key: ONYXKEYS.IS_LOADING_APP,
            selector: (s) => s,
        },
    }),
)(PressableAvatarWithIndicator);
