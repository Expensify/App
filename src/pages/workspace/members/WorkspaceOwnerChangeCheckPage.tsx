import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Text from '@components/Text';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type SCREENS from '@src/SCREENS';
import CONST from "@src/CONST";
import Button from '@components/Button';
import {View} from "react-native";
import useThemeStyles from "@hooks/useThemeStyles";
import useLocalize from "@hooks/useLocalize";

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

    const confirm = useCallback(() => {

    }, []);

    const cancel = useCallback(() => {

    }, []);

    const confirmationTitle = useMemo(() => {
        switch (error) {
            case CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED:
                return translate('workspace.changeOwner.outstandingBalance');
            default:
                return null;
        }
    }, [error, translate]);

    const confirmationButtonText = useMemo(() => {
        switch (error) {
            case CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED:
                return translate('workspace.changeOwner.transferBalance');
            default:
                return '';
        }
    }, [error, translate]);

    const confirmationText = useMemo(() => {
        switch (error) {
            case CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED:
                return translate('workspace.changeOwner.transferBalanceFirstParagraph', {email: 'test@test.com', amount: '$50.00'});
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
