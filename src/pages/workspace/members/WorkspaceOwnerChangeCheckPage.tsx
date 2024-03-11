import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Text from '@components/Text';
import ScreenWrapper from '@components/ScreenWrapper';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import type SCREENS from '@src/SCREENS';
import CONST from "@src/CONST";
import Button from "@components/Button";
import {View} from "react-native";
import useThemeStyles from "@hooks/useThemeStyles";

type WorkspaceMemberDetailsPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.OWNER_CHANGE_CHECK>;

const CONFIRMABLE_ERRORS: string[] = [
    CONST.POLICY.OWNERSHIP_ERRORS.AMOUNT_OWED,
    CONST.POLICY.OWNERSHIP_ERRORS.OWNER_OWES_AMOUNT,
    CONST.POLICY.OWNERSHIP_ERRORS.SUBSCRIPTION,
    CONST.POLICY.OWNERSHIP_ERRORS.DUPLICATE_SUBSCRIPTION,
];

function WorkspaceOwnerChangeCheckPage({route}: WorkspaceMemberDetailsPageProps) {
    const styles = useThemeStyles();

    const policyID = route.params.policyID;
    const error = route.params.error;

    const shouldAskForConfirmation = CONFIRMABLE_ERRORS.includes(error);

    const confirm = useCallback(() => {

    }, []);

    const cancel = useCallback(() => {
        
    }, []);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <ScreenWrapper testID={WorkspaceOwnerChangeCheckPage.displayName}>
                    <HeaderWithBackButton
                        title="Change owner"
                        onBackButtonPress={() => Navigation.goBack()}
                    />
                    <View style={[styles.containerWithSpaceBetween, styles.pb5, styles.ph5]}>
                        <Text>Current error: {error}</Text>
                        {shouldAskForConfirmation ? (
                            <Button
                                success
                                onPress={confirm}
                            >Transfer subscription</Button>
                        ) : (
                            <Button
                                success
                                onPress={cancel}
                            >Got it</Button>
                        )}
                    </View>
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceOwnerChangeCheckPage.displayName = 'WorkspaceOwnerChangeCheckPage';

export default WorkspaceOwnerChangeCheckPage;
