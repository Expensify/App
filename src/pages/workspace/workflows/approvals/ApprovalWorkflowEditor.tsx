import {Str} from 'expensify-common';
import type {ForwardedRef} from 'react';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as ScrollViewRN} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {isControlPolicy} from '@libs/PolicyUtils';
import {getApprovalLimitDescription} from '@libs/WorkflowUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {personalDetailsByEmailSelector} from '@src/selectors/PersonalDetails';
import type {ApprovalWorkflowOnyx, Policy} from '@src/types/onyx';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type ApprovalWorkflowEditorProps = {
    /** The approval workflow to display */
    approvalWorkflow: ApprovalWorkflowOnyx;

    /** Function to remove the approval workflow */
    removeApprovalWorkflow?: () => void;

    /** The policy for the current route */
    policy: OnyxEntry<Policy>;

    /** The policy ID */
    policyID: string;

    /** Forwarded ref to pass to the ScrollView */
    ref: ForwardedRef<ScrollViewRN>;
};

function ApprovalWorkflowEditor({approvalWorkflow, removeApprovalWorkflow, policy, policyID, ref}: ApprovalWorkflowEditorProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const styles = useThemeStyles();
    const {translate, toLocaleOrdinal, localeCompare} = useLocalize();
    const [personalDetailsByEmail] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        canBeMissing: true,
        selector: personalDetailsByEmailSelector,
    });
    const approverCount = approvalWorkflow.approvers.length;
    const currency = policy?.outputCurrency ?? CONST.CURRENCY.USD;

    const approverDescription = useCallback(
        (index: number) => (approverCount > 1 ? `${toLocaleOrdinal(index + 1, true)} ${translate('workflowsPage.approver').toLowerCase()}` : `${translate('workflowsPage.approver')}`),
        [approverCount, toLocaleOrdinal, translate],
    );

    const getApprovalPendingAction = useCallback(
        (index: number) => {
            let pendingAction: PendingAction | undefined;
            if (index === 0) {
                if (approvalWorkflow?.members) {
                    for (const member of approvalWorkflow.members) {
                        pendingAction = pendingAction ?? member.pendingFields?.submitsTo;
                    }
                }
                return pendingAction;
            }
            const previousApprover = approvalWorkflow?.approvers.at(index - 1);
            const previousMember = approvalWorkflow?.members?.find((member) => member?.email === previousApprover?.email);
            return previousMember?.pendingFields?.forwardsTo;
        },
        [approvalWorkflow],
    );

    const members = useMemo(() => {
        if (approvalWorkflow.isDefault) {
            return translate('workspace.common.everyone');
        }

        return sortAlphabetically(approvalWorkflow.members, 'displayName', localeCompare)
            .map((m) => Str.removeSMSDomain(m.displayName))
            .join(', ');
    }, [approvalWorkflow.isDefault, approvalWorkflow.members, translate, localeCompare]);

    const approverErrorMessage = useCallback(
        (approver: Approver | undefined, approverIndex: number) => {
            const previousApprover = approvalWorkflow.approvers.slice(0, approverIndex).findLast(Boolean);
            const error = approvalWorkflow?.errors?.[`approver-${approverIndex}`];

            if (!error) {
                return;
            }

            if (error === 'workflowsPage.approverCircularReference') {
                if (!previousApprover || !approver) {
                    return;
                }
                return translate('workflowsPage.approverCircularReference', Str.removeSMSDomain(approver.displayName), Str.removeSMSDomain(previousApprover.displayName));
            }

            return translate(error);
        },
        [approvalWorkflow.approvers, approvalWorkflow.errors, translate],
    );

    const editApprover = useCallback(
        (approverIndex: number) => {
            if (approvalWorkflow.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE) {
                Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverIndex));
            } else {
                Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.getRoute(policyID, approverIndex));
            }
        },
        [approvalWorkflow.action, policyID],
    );

    const handleExpensesFromPress = useCallback(() => {
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(policyID));
    }, [policyID]);

    // User should be allowed to add additional approver only if they upgraded to Control Plan, otherwise redirected to the Upgrade Page
    const addAdditionalApprover = useCallback(() => {
        if (!isControlPolicy(policy) && approverCount > 0) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(
                    policyID,
                    CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias,
                    ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverCount),
                ),
            );
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverCount));
    }, [approverCount, policy, policyID]);

    return (
        <ScrollView
            style={[styles.flex1]}
            ref={ref}
            addBottomSafeAreaPadding
        >
            <View style={[styles.mh5]}>
                {approvalWorkflow.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && (
                    <Text style={[styles.textHeadlineH1, styles.mv3]}>{translate('workflowsCreateApprovalsPage.header')}</Text>
                )}

                <MenuItemWithTopDescription
                    title={members}
                    titleStyle={styles.textNormalThemeText}
                    numberOfLinesTitle={4}
                    description={translate('workflowsExpensesFromPage.title')}
                    descriptionTextStyle={!!members && styles.textLabelSupportingNormal}
                    onPress={handleExpensesFromPress}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    errorText={approvalWorkflow?.errors?.members ? translate(approvalWorkflow.errors.members) : undefined}
                    brickRoadIndicator={approvalWorkflow?.errors?.members ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    shouldShowRightIcon={!approvalWorkflow.isDefault}
                    interactive={!approvalWorkflow.isDefault}
                />

                {approvalWorkflow.approvers.map((approver, approverIndex) => {
                    const errorText = approverErrorMessage(approver, approverIndex);
                    const isApproverInMultipleWorkflows = !errorText && approvalWorkflow.usedApproverEmails.some((approverEmail) => approverEmail === approver?.email);
                    const limitDescription = getApprovalLimitDescription({approver, currency, translate, personalDetailsByEmail});
                    const hintText = [isApproverInMultipleWorkflows ? translate('workflowsPage.approverInMultipleWorkflows') : undefined, limitDescription].filter(Boolean).join('\n');

                    return (
                        <OfflineWithFeedback
                            // eslint-disable-next-line react/no-array-index-key
                            key={`approver-${approver?.email}-${approverIndex}`}
                            pendingAction={getApprovalPendingAction(approverIndex)}
                        >
                            <MenuItemWithTopDescription
                                title={Str.removeSMSDomain(approver?.displayName ?? '')}
                                titleStyle={styles.textNormalThemeText}
                                wrapperStyle={styles.sectionMenuItemTopDescription}
                                description={approverDescription(approverIndex)}
                                descriptionTextStyle={!!approver?.displayName && styles.textLabelSupportingNormal}
                                onPress={() => editApprover(approverIndex)}
                                shouldShowRightIcon
                                hintText={hintText}
                                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                errorText={errorText}
                                shouldRenderErrorAsHTML
                            />
                        </OfflineWithFeedback>
                    );
                })}

                <MenuItemWithTopDescription
                    description={approverCount > 0 ? translate('workflowsCreateApprovalsPage.additionalApprover') : translate('workflowsPage.approver')}
                    onPress={addAdditionalApprover}
                    shouldShowRightIcon
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                    errorText={approvalWorkflow?.errors?.additionalApprover ? translate(approvalWorkflow.errors.additionalApprover) : undefined}
                    brickRoadIndicator={approvalWorkflow?.errors?.additionalApprover ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />

                {!!removeApprovalWorkflow && !approvalWorkflow.isDefault && (
                    <MenuItem
                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt6]}
                        icon={icons.Trashcan}
                        title={translate('common.delete')}
                        onPress={removeApprovalWorkflow}
                    />
                )}
            </View>
        </ScrollView>
    );
}

export default ApprovalWorkflowEditor;
