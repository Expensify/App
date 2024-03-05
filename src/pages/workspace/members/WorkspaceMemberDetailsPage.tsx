import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import { withOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import {View} from "react-native";
import useThemeStyles from "@hooks/useThemeStyles";
import ROUTES from "@src/ROUTES";
import CONST from "@src/CONST";
import OfflineWithFeedback from "@components/OfflineWithFeedback";
import lodashGet from "lodash/get";
import Avatar from "@components/Avatar";
import * as UserUtils from "@libs/UserUtils";
import PressableWithoutFocus from "@components/Pressable/PressableWithoutFocus";

type WorkspacePolicyOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceMemberDetailsPageProps = WithPolicyAndFullscreenLoadingProps & WorkspacePolicyOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS>;

function WorkspaceMemberDetailsPage({policyMembers, personalDetails, route}: WorkspaceMemberDetailsPageProps) {
    const styles = useThemeStyles();

    const accountID = Number(route?.params?.accountID) ?? 0;
    const backTo = route?.params?.backTo;

    const details = personalDetails?.[accountID] ?? {} as PersonalDetails;
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
                            <OfflineWithFeedback pendingAction={lodashGet(details, 'pendingFields.avatar', null)}>
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
