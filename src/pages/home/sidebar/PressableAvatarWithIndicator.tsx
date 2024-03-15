import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AvatarWithIndicator from '@components/AvatarWithIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as UserUtils from '@libs/UserUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type PressableAvatarWithIndicatorOnyxProps = {
    /** Indicates whether the app is loading initial data */
    isLoading: OnyxEntry<boolean>;
};

type PressableAvatarWithIndicatorProps = PressableAvatarWithIndicatorOnyxProps & {
    /** Whether the avatar is selected */
    isSelected: boolean;

    /** Callback called when the avatar is pressed */
    onPress?: () => void;
};

function PressableAvatarWithIndicator({isLoading = true, isSelected = false, onPress}: PressableAvatarWithIndicatorProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
            role={CONST.ROLE.BUTTON}
            onPress={onPress}
        >
            <OfflineWithFeedback pendingAction={currentUserPersonalDetails.pendingFields?.avatar ?? null}>
                <View style={[isSelected && styles.selectedAvatarBorder]}>
                    <AvatarWithIndicator
                        source={UserUtils.getAvatar(currentUserPersonalDetails.avatar, currentUserPersonalDetails.accountID)}
                        tooltipText={translate('profilePage.profile')}
                        fallbackIcon={currentUserPersonalDetails.fallbackIcon}
                        isLoading={!!isLoading && !currentUserPersonalDetails.avatar}
                    />
                </View>
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
