import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as WorkspaceSettingsUtils from '@libs/WorkspacesSettingsUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import * as PolicyActions from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

type WorkspaceOwnershipChangeChecksOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
};

type WorkspaceMemberDetailsPageProps = WithPolicyOnyxProps &
    WorkspaceOwnershipChangeChecksOnyxProps &
    StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_CHANGE_CHECK>;

function WorkspaceOwnerChangeCheckPage({route, personalDetails, policy}: WorkspaceMemberDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = route.params.policyID;
    const accountID = route.params.accountID;
    const error = route.params.error;

    useEffect(() => WorkspaceSettingsUtils.redirectOnChangeOwnerErrorUpdate(policy, policyID, accountID), [accountID, policy, policy?.errorFields?.changeOwner, policyID]);

    const confirm = useCallback(() => {
        if (error === CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS || error === CONST.POLICY.OWNERSHIP_ERRORS.FAILED_TO_CLEAR_BALANCE) {
            // cannot transfer ownership if there are failed settlements, or we cannot clear the balance
            PolicyActions.clearWorkspaceOwnerChangeFlow(policyID);
            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
            return;
        }

        PolicyActions.requestWorkspaceOwnerChange(policyID);
    }, [accountID, error, policyID]);

    const {title, text, buttonText} = WorkspaceSettingsUtils.getOwnershipChecksDisplayText(error, translate, policy, personalDetails?.[accountID]?.login);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper testID={WorkspaceOwnerChangeCheckPage.displayName}>
                    <HeaderWithBackButton
                        title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                        onBackButtonPress={() => {
                            PolicyActions.clearWorkspaceOwnerChangeFlow(policyID);
                            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
                        }}
                    />
                    <View style={[styles.containerWithSpaceBetween, styles.pb5, styles.ph5]}>
                        {policy?.isLoading ? (
                            <FullScreenLoadingIndicator />
                        ) : (
                            <>
                                <Text style={[styles.textHeadline, styles.mt3, styles.mb5]}>{title}</Text>
                                <Text style={styles.flex1}>{text}</Text>
                                <Button
                                    success
                                    large
                                    onPress={confirm}
                                    text={buttonText}
                                />
                            </>
                        )}
                    </View>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceOwnerChangeCheckPage.displayName = 'WorkspaceOwnerChangeCheckPage';

export default withPolicy(
    withOnyx<WorkspaceMemberDetailsPageProps, WorkspaceOwnershipChangeChecksOnyxProps>({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
    })(WorkspaceOwnerChangeCheckPage),
);
