import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type WorkspaceMemberDetailsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_CHANGE_CHECK>;

function WorkspaceOwnerChangeCheckPage({route}: WorkspaceMemberDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = route.params.policyID;
    const error = route.params.error;

    const confirm = useCallback(() => {
        if (error === CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS) {
            // cannot transfer ownership if there are failed settlements
            Policy.clearWorkspaceOwnerChangeFlow(policyID);
            Navigation.goBack();
        }

        // TODO: handle confirmation
    }, [error, policyID]);

    useEffect(
        () => () => {
            Policy.clearWorkspaceOwnerChangeFlow(policyID);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

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
        switch (error) {
            case CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED:
                return translate('workspace.changeOwner.amountOwedText');
            case CONST.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT:
                return translate('workspace.changeOwner.ownerOwesAmountText', {email: 'test@test.com', amount: '$10.50'});
            case CONST.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION:
                return translate('workspace.changeOwner.subscriptionText', {usersCount: 3, finalCount: 5});
            case CONST.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION:
                return translate('workspace.changeOwner.duplicateSubscriptionText', {email: 'test@test.com', workspaceName: 'Test workspace'});
            case CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS:
                return translate('workspace.changeOwner.hasFailedSettlementsText', {email: 'test@test.com'});
            default:
                return null;
        }
    }, [error, translate]);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper testID={WorkspaceOwnerChangeCheckPage.displayName}>
                    <HeaderWithBackButton
                        title={translate('workspace.changeOwner.changeOwnerPageTitle')}
                        onBackButtonPress={() => Navigation.goBack()}
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

export default WorkspaceOwnerChangeCheckPage;
