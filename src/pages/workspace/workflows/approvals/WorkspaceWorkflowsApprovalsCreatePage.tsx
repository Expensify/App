import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Workflow from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ApprovalWorkflow} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceWorkflowsApprovalsCreatePageProps = WithPolicyAndFullscreenLoadingProps & StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_NEW>;

function WorkspaceWorkflowsApprovalsCreatePage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsCreatePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [approvalWorkflow, approvalWorkflowMetadata] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy);

    const createApprovalWorkflow = useCallback(() => {
        if (!approvalWorkflow) {
            return;
        }

        Workflow.createApprovalWorkflow(route.params.policyID, approvalWorkflow);
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
    }, [approvalWorkflow, route.params.policyID]);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceWorkflowsApprovalsCreatePage.displayName}
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                    onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                >
                    <HeaderWithBackButton
                        title={translate('workflowsCreateApprovalsPage.title')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    {approvalWorkflowMetadata.status === 'loading' && <FullScreenLoadingIndicator />}
                    {approvalWorkflow && (
                        <ApprovalWorkflowEditor
                            approvalWorkflow={approvalWorkflow}
                            policyID={route.params.policyID}
                        />
                    )}

                    <Button
                        success
                        style={[styles.mb5, styles.mh5]}
                        onPress={createApprovalWorkflow}
                        pressOnEnter
                        large
                        text={translate('common.save')}
                        isLoading={approvalWorkflow?.isLoading}
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

function ApprovalWorkflowEditor({approvalWorkflow, policyID}: {approvalWorkflow: ApprovalWorkflow; policyID: string}) {
    const styles = useThemeStyles();
    const {translate, toLocaleOrdinal} = useLocalize();

    const approverDescription = useCallback(
        (index: number) =>
            // @ts-expect-error Fix later
            approvalWorkflow.approvers.length > 1 ? `${toLocaleOrdinal(index + 1, true)} ${translate('workflowsPage.approver').toLowerCase()}` : `${translate('workflowsPage.approver')}`,
        [approvalWorkflow.approvers.length, toLocaleOrdinal, translate],
    );

    return (
        <ScrollView style={[styles.flex1]}>
            <View style={[styles.mh5]}>
                <Text style={[styles.textHeadlineH1, styles.mv3]}>{translate('workflowsCreateApprovalsPage.header')}</Text>

                <MenuItemWithTopDescription
                    title={approvalWorkflow.isDefault ? translate('workspace.common.everyone') : approvalWorkflow.members.map((m) => m.displayName).join(', ')}
                    titleStyle={styles.textNormalThemeText}
                    description={translate('workflowsExpensesFromPage.title')}
                    descriptionTextStyle={styles.textLabelSupportingNormal}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(policyID, ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID)))}
                    shouldShowRightIcon
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                />

                {approvalWorkflow.approvers.map((approver, approverIndex) => (
                    <MenuItemWithTopDescription
                        // eslint-disable-next-line react/no-array-index-key
                        key={`approver-${approver.email}-${approverIndex}`}
                        title={approver.displayName}
                        titleStyle={styles.textNormalThemeText}
                        description={approverDescription(approverIndex)}
                        descriptionTextStyle={styles.textLabelSupportingNormal}
                        onPress={() =>
                            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverIndex, ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID)))
                        }
                        shouldShowRightIcon
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                    />
                ))}

                <MenuItemWithTopDescription
                    description={translate('workflowsCreateApprovalsPage.addApproverRow')}
                    onPress={() =>
                        Navigation.navigate(
                            ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approvalWorkflow.approvers.length, ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID)),
                        )
                    }
                    shouldShowRightIcon
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                />
            </View>
        </ScrollView>
    );
}

WorkspaceWorkflowsApprovalsCreatePage.displayName = 'WorkspaceWorkflowsApprovalsCreatePage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsCreatePage);
