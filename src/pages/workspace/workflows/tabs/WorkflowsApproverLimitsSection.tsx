import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';

import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsByEmail from '@hooks/usePersonalDetailsByEmail';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearApprovalLimit} from '@libs/actions/Workflow';
import Navigation from '@libs/Navigation/Navigation';
import {isControlPolicy, isSubmitPolicy} from '@libs/PolicyUtils';
import {getApprovalLimitGroups} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

type WorkflowsApproverLimitsSectionProps = {
    policyID: string;

    /** Whether the limits can be added or edited */
    canEditApprovalLimits: boolean;
};

function WorkflowsApproverLimitsSection({policyID, canEditApprovalLimits}: WorkflowsApproverLimitsSectionProps) {
    const {translate, localeCompare, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply a correct padding style
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const policy = usePolicy(policyID);
    const personalDetailsByEmail = usePersonalDetailsByEmail();
    const {convertToDisplayString} = useCurrencyListActions();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);

    const approvalLimitGroups = getApprovalLimitGroups({employees: policy?.employeeList ?? {}, personalDetailsByEmail: personalDetailsByEmail ?? {}, localeCompare});
    const getDisplayName = (email: string) => formatPhoneNumber(personalDetailsByEmail?.[email]?.displayName ?? email);

    // Adding a limit follows the same plan gating as adding an approval workflow.
    const addApprovalLimit = () => {
        clearApprovalLimit();

        if (isSubmitPolicy(policy)) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvalSubmit.alias, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)));
            return;
        }

        if (!isControlPolicy(policy)) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias, ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.getRoute(policyID)),
            );
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.getRoute(policyID));
    };

    return (
        <Section
            containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8}
            title={translate('workflowsPage.approverLimitsTitle')}
            titleStyles={[styles.accountSettingsSectionTitle, styles.mb1]}
            subtitle={translate('workflowsPage.approverLimitsDescription')}
            subtitleStyles={styles.mt0}
            subtitleTextStyles={[styles.textLabelSupportingEmptyValue, styles.lh20]}
        >
            {approvalLimitGroups.map((group) => {
                const firstApproverEmail = group.approvers.at(0) ?? '';

                return (
                    <OfflineWithFeedback
                        key={`${group.approvalLimit}-${group.overLimitForwardsTo}`}
                        pendingAction={group.pendingAction}
                    >
                        <View style={[styles.mt6, styles.mbn3]}>
                            <MenuItemSectionRoot
                                onPress={
                                    canEditApprovalLimits
                                        ? () => {
                                              clearApprovalLimit();
                                              Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.getRoute(policyID, firstApproverEmail));
                                          }
                                        : undefined
                                }
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_LIMIT}
                            >
                                <MenuItemField.Row
                                    name={translate('common.approvalLimit')}
                                    value={translate('workflowsPage.approvalLimitDescription', {
                                        approverNames: group.approvers.map(getDisplayName).join(', '),
                                        approvalLimit: convertToDisplayString(group.approvalLimit, policy?.outputCurrency ?? CONST.CURRENCY.USD),
                                        overLimitApproverName: getDisplayName(group.overLimitForwardsTo),
                                    })}
                                    numberOfLinesValue={0}
                                >
                                    {canEditApprovalLimits && <MenuItem.Chevron />}
                                </MenuItemField.Row>
                            </MenuItemSectionRoot>
                        </View>
                    </OfflineWithFeedback>
                );
            })}
            {canEditApprovalLimits && (
                <View style={[styles.mt6, styles.mbn3]}>
                    <MenuItemSectionRoot
                        onPress={addApprovalLimit}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.ADD_APPROVAL_LIMIT}
                    >
                        <MenuItem.Row>
                            <MenuItem.Leading>
                                <MenuItem.Icon src={expensifyIcons.Plus} />
                            </MenuItem.Leading>
                            <MenuItem.Content>
                                <MenuItem.Title>{translate('workflowsPage.addApprovalLimit')}</MenuItem.Title>
                            </MenuItem.Content>
                        </MenuItem.Row>
                    </MenuItemSectionRoot>
                </View>
            )}
        </Section>
    );
}

export default WorkflowsApproverLimitsSection;
