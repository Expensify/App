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

const CONFIRMABLE_ERRORS: string[] = [
    CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED,
    CONST.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT,
    CONST.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION,
    CONST.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION,
];

function WorkspaceOwnerChangeCheckPage({route}: WorkspaceMemberDetailsPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const policyID = route.params.policyID;
    const error = route.params.error;

    const shouldAskForConfirmation = CONFIRMABLE_ERRORS.includes(error);

    const confirm = useCallback(() => {}, []);

    const cancel = useCallback(() => {
        Policy.clearWorkspaceOwnerChangeFlow(policyID);
        Navigation.goBack();
    }, [policyID]);

    useEffect(() =>
        () => {
            Policy.clearWorkspaceOwnerChangeFlow(policyID);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    , []);

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
                return translate('workspace.changeOwner.ownerOwesAmountText');
            case CONST.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION:
                return translate('workspace.changeOwner.subscriptionText');
            case CONST.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION:
                return translate('workspace.changeOwner.duplicateSubscriptionText');
            case CONST.POLICY.OWNERSHIP_ERRORS.HAS_FAILED_SETTLEMENTS:
                return translate('workspace.changeOwner.hasFailedSettlementsText');
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
                        {shouldAskForConfirmation ? (
                            <Button
                                success
                                large
                                onPress={confirm}
                                text={confirmationButtonText}
                            />
                        ) : (
                            <Button
                                success
                                large
                                onPress={cancel}
                                text={translate('common.buttonConfirm')}
                            />
                        )}
                    </View>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceOwnerChangeCheckPage.displayName = 'WorkspaceOwnerChangeCheckPage';

export default WorkspaceOwnerChangeCheckPage;
