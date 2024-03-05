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
import type {PersonalDetailsList} from '@src/types/onyx';

type WorkspacePolicyOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceMemberDetailsPageProps = WithPolicyAndFullscreenLoadingProps & WorkspacePolicyOnyxProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.MEMBER_DETAILS>;

function WorkspaceMemberDetailsPage({policyMembers, personalDetails, route}: WorkspaceMemberDetailsPageProps) {
    const accountID = route?.params?.accountID;
    const backTo = route?.params?.backTo;

    const getHeaderButtonTitle = () => {
        if (personalDetails && personalDetails[accountID]) {
            return personalDetails?.[accountID]?.displayName ?? '';
        }

        return '';
    }

    return (
        <ScreenWrapper testID={WorkspaceMemberDetailsPage.displayName}>
            <FullPageNotFoundView>
                <HeaderWithBackButton
                    title={getHeaderButtonTitle()}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
            </FullPageNotFoundView>
            <Text>Workspace Member Details</Text>
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
