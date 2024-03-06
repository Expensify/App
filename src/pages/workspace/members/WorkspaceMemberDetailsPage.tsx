import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as UserUtils from '@libs/UserUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Policy from '@userActions/Policy';
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
    const theme = useTheme();
    const {translate} = useLocalize();

    const [removeMemberConfirmModalVisible, setRemoveMemberConfirmModalVisible] = React.useState(false);

    const accountID = Number(route?.params?.accountID) ?? 0;
    const backTo = route?.params?.backTo;

    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const avatar = details.avatar ?? UserUtils.getDefaultAvatar();
    const fallbackIcon = details.fallbackIcon ?? '';
    const displayName = details.displayName ?? '';

    const askForConfirmationToRemove = () => {
        setRemoveMemberConfirmModalVisible(true);
    };

    const removeUser = useCallback(() => {
        Policy.removeMembers([accountID], route.params.policyID);
        setRemoveMemberConfirmModalVisible(false);
        Navigation.goBack(backTo);
    }, [accountID, backTo, route.params.policyID]);

    const redirectToProfile = useCallback(() => {
        Navigation.navigate(ROUTES.PROFILE.getRoute(accountID));
    }, [accountID]);

    const openRoleSelectionModal = () => {};

    return (
        <ScreenWrapper testID={WorkspaceMemberDetailsPage.displayName}>
            <FullPageNotFoundView>
                <HeaderWithBackButton
                    title={displayName}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone, styles.justifyContentStart]}>
                    <View style={styles.avatarSectionWrapper}>
                        <OfflineWithFeedback pendingAction={details.pendingFields?.avatar}>
                            <Avatar
                                containerStyles={[styles.avatarXLarge, styles.mv5, styles.noOutline]}
                                imageStyles={[styles.avatarXLarge]}
                                source={UserUtils.getAvatar(avatar, accountID)}
                                size={CONST.AVATAR_SIZE.XLARGE}
                                fallbackIcon={fallbackIcon}
                            />
                        </OfflineWithFeedback>
                        {Boolean(details.displayName ?? '') && (
                            <Text
                                style={[styles.textHeadline, styles.pre, styles.mb6, styles.w100, styles.textAlignCenter]}
                                numberOfLines={1}
                            >
                                {displayName}
                            </Text>
                        )}
                        <Button
                            text={translate('workspace.people.removeMemberButtonTitle')}
                            onPress={askForConfirmationToRemove}
                            medium
                            icon={Expensicons.RemoveMembers}
                            iconStyles={{transform: [{scale: 0.8}]}}
                            style={styles.mv5}
                        />
                        <ConfirmModal
                            danger
                            title={translate('workspace.people.removeMemberTitle')}
                            isVisible={removeMemberConfirmModalVisible}
                            onConfirm={removeUser}
                            onCancel={() => setRemoveMemberConfirmModalVisible(false)}
                            prompt={translate('workspace.people.removeMemberPrompt', {memberName: displayName})}
                            confirmText={translate('common.remove')}
                            cancelText={translate('common.cancel')}
                        />
                    </View>
                    <View style={styles.w100}>
                        <MenuItemWithTopDescription
                            title={translate('common.member')}
                            description={translate('common.role')}
                            shouldShowRightIcon
                            onPress={openRoleSelectionModal}
                        />
                        <MenuItemWithTopDescription
                            title={translate('common.profile')}
                            shouldShowRightIcon
                            icon={Expensicons.Info}
                            iconFill={theme.icon}
                            onPress={redirectToProfile}
                        />
                    </View>
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
