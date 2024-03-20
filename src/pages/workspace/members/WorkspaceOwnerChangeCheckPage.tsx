import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
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
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

type WorkspaceOwnershipChangeChecksOnyxProps = {
    /** Personal details of all users */
    personalDetails: OnyxEntry<PersonalDetailsList>;
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

    useEffect(() => {
        if (!policy) {
            return;
        }

        if (!policy?.errorFields?.changeOwner) {
            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
            return;
        }

        const keys = Object.keys(policy.errorFields.changeOwner);

        if (keys && keys.length > 0 && keys[0] !== CONST.POLICY.OWNERSHIP_ERRORS.NO_BILLING_CARD) {
            Navigation.navigate(ROUTES.WORKSPACE_OWNER_CHANGE_CHECK.getRoute(policyID, accountID, keys[0] as ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>));
        }
    }, [accountID, policy, policy?.errorFields?.changeOwner, policyID]);

    const confirm = useCallback(() => {
        if (error === CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS) {
            // cannot transfer ownership if there are failed settlements
            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
        }

        const ownershipChecks = WorkspaceSettingsUtils.getOwnershipChecks(error);

        Policy.requestWorkspaceOwnerChange(policyID, ownershipChecks);
        Navigation.dismissModal();
    }, [accountID, error, policyID]);

    const confirmationTitle = useMemo(() => {
        switch (error) {
            case CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED:
                return translate('workspace.changeOwner.amountOwedTitle');
            case CONST.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT:
                return translate('workspace.changeOwner.ownerOwesAmountTitle');
            case CONST.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION:
                return translate('workspace.changeOwner.subscriptionTitle');
            case CONST.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION:
                return translate('workspace.changeOwner.duplicateSubscriptionTitle');
            case CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS:
                return translate('workspace.changeOwner.hasFailedSettlementsTitle');
            default:
                return null;
        }
    }, [error, translate]);

    const confirmationButtonText = useMemo(() => {
        switch (error) {
            case CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED:
                return translate('workspace.changeOwner.amountOwedButtonText');
            case CONST.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT:
                return translate('workspace.changeOwner.ownerOwesAmountButtonText');
            case CONST.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION:
                return translate('workspace.changeOwner.subscriptionButtonText');
            case CONST.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION:
                return translate('workspace.changeOwner.duplicateSubscriptionButtonText');
            case CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS:
                return translate('workspace.changeOwner.hasFailedSettlementsButtonText');
            default:
                return '';
        }
    }, [error, translate]);

    const confirmationText = useMemo(() => {
        const changeOwner = policy?.errorFields?.changeOwner;
        const subscription = changeOwner?.subscription as unknown as {ownerUserCount: number; totalUserCount: number};

        const details = personalDetails?.[accountID];

        switch (error) {
            case 'noBillingCard':
                break;
            case CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED:
                return translate('workspace.changeOwner.amountOwedText');
            case CONST.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT:
                return translate('workspace.changeOwner.ownerOwesAmountText', {email: changeOwner?.ownerOwesAmount, amount: ''});
            case CONST.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION:
                return translate('workspace.changeOwner.subscriptionText', {usersCount: subscription?.ownerUserCount, finalCount: subscription?.totalUserCount});
            case CONST.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION:
                return translate('workspace.changeOwner.duplicateSubscriptionText', {email: changeOwner?.duplicateSubscription, workspaceName: policy?.name});
            case CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS:
                return translate('workspace.changeOwner.hasFailedSettlementsText', {email: details?.login});
            default:
                return null;
        }
    }, [accountID, error, personalDetails, policy?.errorFields?.changeOwner, policy?.name, translate]);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper testID={WorkspaceOwnerChangeCheckPage.displayName}>
                    <HeaderWithBackButton
                        title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                        onBackButtonPress={() => {
                            Policy.clearWorkspaceOwnerChangeFlow(policyID);
                            Navigation.navigate(ROUTES.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
                        }}
                    />
                    <View style={[styles.containerWithSpaceBetween, styles.pb5, styles.ph5]}>
                        <Text style={[styles.textHeadline, styles.mt3, styles.mb5]}>{confirmationTitle}</Text>
                        <Text style={styles.flex1}>{confirmationText}</Text>
                        <Button
                            success
                            large
                            onPress={confirm}
                            text={confirmationButtonText}
                        />
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
