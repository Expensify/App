import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithoutFocus from '@components/Pressable/PressableWithoutFocus';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as UserUtils from '@libs/UserUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';

type WorkspacePolicyOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceMemberDetailsPageProps = WithPolicyAndFullscreenLoadingProps & WorkspacePolicyOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS>;

function WorkspaceMemberDetailsPage({personalDetails, route}: WorkspaceMemberDetailsPageProps) {
    const styles = useThemeStyles();

    const accountID = Number(route?.params?.accountID) ?? 0;
    const backTo = route?.params?.backTo;

    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const avatar = details.avatar ?? UserUtils.getDefaultAvatar();
    const fallbackIcon = details.fallbackIcon ?? '';

    // TODO: may be extended to return sutitle or other details
    const getHeaderButtonTitle = () => details.displayName ?? '';

    return (
        <ScreenWrapper testID={WorkspaceMemberDetailsPage.displayName}>
            <FullPageNotFoundView>
                <HeaderWithBackButton
                    title={getHeaderButtonTitle()}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <View style={styles.avatarSectionWrapper}>
                        <PressableWithoutFocus
                            style={[styles.noOutline]}
                            onPress={() => Navigation.navigate(ROUTES.PROFILE_AVATAR.getRoute(String(accountID)))}
                            accessibilityLabel="Edit Avatar"
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.IMAGEBUTTON}
                        >
                            <OfflineWithFeedback pendingAction={details.pendingFields?.avatar}>
                                <Avatar
                                    containerStyles={[styles.avatarXLarge, styles.mb3]}
                                    imageStyles={[styles.avatarXLarge]}
                                    source={UserUtils.getAvatar(avatar, accountID)}
                                    size={CONST.AVATAR_SIZE.XLARGE}
                                    fallbackIcon={fallbackIcon}
                                />
                            </OfflineWithFeedback>
                        </PressableWithoutFocus>
                    </View>
                    <Text>Workspace Member Details</Text>
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceMemberDetailsPage.displayName = 'WorkspaceMemberDetailsPage';

export default withPolicyAndFullscreenLoading(
    withOnyx<WorkspaceMemberDetailsPageProps, WorkspacePolicyOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    })(WorkspaceMemberDetailsPage),
);
