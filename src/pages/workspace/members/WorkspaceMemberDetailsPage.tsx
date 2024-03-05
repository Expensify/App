import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Avatar from '@components/Avatar';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
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
import type SCREENS from '@src/SCREENS';
import type {PersonalDetails, PersonalDetailsList} from '@src/types/onyx';
import Button from "@components/Button";
import useLocalize from "@hooks/useLocalize";
import * as Expensicons from "@components/Icon/Expensicons";

type WorkspacePolicyOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceMemberDetailsPageProps = WithPolicyAndFullscreenLoadingProps & WorkspacePolicyOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS>;

function WorkspaceMemberDetailsPage({personalDetails, route}: WorkspaceMemberDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const accountID = Number(route?.params?.accountID) ?? 0;
    const backTo = route?.params?.backTo;

    const details = personalDetails?.[accountID] ?? ({} as PersonalDetails);
    const avatar = details.avatar ?? UserUtils.getDefaultAvatar();
    const fallbackIcon = details.fallbackIcon ?? '';
    const displayName = details.displayName ?? '';

    const askForConfirmationToRemove = () => {
        // TODO: Implement this
    }

    return (
        <ScreenWrapper testID={WorkspaceMemberDetailsPage.displayName}>
            <FullPageNotFoundView>
                <HeaderWithBackButton
                    title={displayName}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <View style={styles.avatarSectionWrapper}>
                        <OfflineWithFeedback pendingAction={details.pendingFields?.avatar}>
                            <Avatar
                                containerStyles={[styles.avatarXLarge, styles.mb3, styles.noOutline]}
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
