// import { View } from 'react-native';
import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
// import type * as OnyxTypes from '@src/types/onyx';
import Navigation from '@libs/Navigation/Navigation';
// import useThemeStyles from '@hooks/useThemeStyles';
// import * as ErrorUtils from '@libs/ErrorUtils';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
// import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceWorkflowsPayerPageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_PAYER>;

function WorkspaceWorkflowsPayerPage({route, policy}: WorkspaceWorkflowsPayerPageProps) {
    const {translate} = useLocalize();
    // const styles = useThemeStyles();
    const policyName = policy?.name ?? '';

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={route.params.policyID}>
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    testID={WorkspaceWorkflowsPayerPage.displayName}
                >
                    <HeaderWithBackButton
                        title={translate('workflowsPage.approver')}
                        subtitle={policyName}
                        onBackButtonPress={Navigation.goBack}
                    />
                </ScreenWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsPayerPage.displayName = 'WorkspaceWorkflowsPayerPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsPayerPage);
