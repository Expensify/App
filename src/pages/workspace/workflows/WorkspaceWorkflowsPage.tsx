import {useIsFocused} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import Section from '@components/Section';
import Text from '@components/Text';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePrevious from '@hooks/usePrevious';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import BankAccount from '@libs/models/BankAccount';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {CentralPaneNavigatorParamList} from '@navigation/types';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Policy from '@userActions/Policy';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ReimbursementAccount, Beta} from '@src/types/onyx';
import ToggleSettingOptionRow from './ToggleSettingsOptionRow';
import type {ToggleSettingOptionRowProps} from './ToggleSettingsOptionRow';
import {getAutoReportingFrequencyDisplayNames} from './WorkspaceAutoReportingFrequencyPage';
import type {AutoReportingFrequencyKey} from './WorkspaceAutoReportingFrequencyPage';


type WorkspaceWorkflowsPageOnyxProps = {
    /** Beta features list */
    betas: OnyxEntry<Beta[]>;
    /** Reimbursement account details */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};
type WorkspaceWorkflowsPageProps = WithCurrentUserPersonalDetailsProps & WithPolicyProps & WorkspaceWorkflowsPageOnyxProps & StackScreenProps<CentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;

function WorkspaceWorkflowsPage({policy, betas, route, reimbursementAccount, currentUserPersonalDetails}: WorkspaceWorkflowsPageProps) {
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {isOffline} = useNetwork();

    const isFocused = useIsFocused();
    const prevIsFocused = usePrevious(isFocused);

    const ownerPersonalDetails = ReportUtils.getDisplayNamesWithTooltips(OptionsListUtils.getPersonalDetailsForAccountIDs([policy?.ownerAccountID ?? 0], CONST.EMPTY_OBJECT), false);
    const policyOwnerDisplayName = ownerPersonalDetails[0]?.displayName;
    const containerStyle = useMemo(() => [styles.ph8, styles.mhn8, styles.ml11, styles.pv3, styles.pr0, styles.pl4, styles.mr0, styles.widthAuto, styles.mt4], [styles]);
    const canUseDelayedSubmission = Permissions.canUseWorkflowsDelayedSubmission(betas);

    const onPressAutoReportingFrequency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(policy?.id ?? '')), [policy?.id]);


    const authorizedPayerAccountID = policy?.authorizedPayerAccountID ?? policy?.ownerAccountID ?? 0;

    const displayNameForAuthorizedPayer = PersonalDetailsUtils.getPersonalDetailsByIDs([authorizedPayerAccountID], currentUserPersonalDetails.accountID)[0]?.displayName;

    const fetchData = useCallback(() => {
        // Instead of setting the reimbursement account loading within the optimistic data of the API command, use a separate action so that the Onyx value is updated right away.
        // openWorkspaceReimburseView uses API.read which will not make the request until all WRITE requests in the sequential queue have finished responding, so there would be a delay in
        // updating Onyx with the optimistic data.
        if (!policy?.id) {
            return;
        }
        BankAccounts.setReimbursementAccountLoading(true);
        Policy.openWorkspaceReimburseView(policy?.id);
    }, [policy]);

    useEffect(() => {
        if (isOffline || !isFocused || prevIsFocused === isFocused) {
            return;
        }
        fetchData();
    }, [fetchData, isOffline, isFocused, prevIsFocused]);

    const activeRoute = Navigation.getActiveRouteWithoutParams();

    const items: ToggleSettingOptionRowProps[] = useMemo(() => {
        const {accountNumber, state, bankName} = reimbursementAccount?.achData ?? {};
        const hasVBA = state === BankAccount.STATE.OPEN;
        const bankDisplayName = bankName ? `${bankName} ${accountNumber ? `${accountNumber.slice(-5)}` : ''}` : '';
        return [
            ...(canUseDelayedSubmission
                ? [
                      {
                          icon: Illustrations.ReceiptEnvelope,
                          title: translate('workflowsPage.delaySubmissionTitle'),
                          subtitle: translate('workflowsPage.delaySubmissionDescription'),
                          onToggle: (isEnabled: boolean) => {
                              Policy.setWorkspaceAutoReporting(route.params.policyID, isEnabled);
                          },
                          subMenuItems: (
                              <MenuItem
                                  title={translate('workflowsPage.submissionFrequency')}
                                  titleStyle={styles.textLabelSupportingNormal}
                                  descriptionTextStyle={styles.textNormalThemeText}
                                  onPress={onPressAutoReportingFrequency}
                                  description={
                                      getAutoReportingFrequencyDisplayNames(preferredLocale)[
                                          (policy?.autoReportingFrequency as AutoReportingFrequencyKey) ?? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY
                                      ]
                                  }
                                  shouldShowRightIcon
                                  wrapperStyle={containerStyle}
                                  hoverAndPressStyle={[styles.mr0, styles.br2]}
                              />
                          ),
                          isActive: policy?.harvesting?.enabled ?? false,
                          pendingAction: policy?.pendingFields?.isAutoApprovalEnabled,
                      },
                  ]
                : []),
            {
                icon: Illustrations.Approval,
                title: translate('workflowsPage.addApprovalsTitle'),
                subtitle: translate('workflowsPage.addApprovalsDescription'),
                onToggle: (isEnabled: boolean) => {
                    Policy.setWorkspaceApprovalMode(route.params.policyID, policy?.owner ?? '', isEnabled ? CONST.POLICY.APPROVAL_MODE.BASIC : CONST.POLICY.APPROVAL_MODE.OPTIONAL);
                },
                subMenuItems: (
                    <MenuItem
                        title={translate('workflowsPage.approver')}
                        titleStyle={styles.textLabelSupportingNormal}
                        descriptionTextStyle={styles.textNormalThemeText}
                        description={policyOwnerDisplayName ?? ''}
                        // onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVER.getRoute(route.params.policyID))}
                        // TODO will be done in https://github.com/Expensify/Expensify/issues/368334
                        shouldShowRightIcon
                        wrapperStyle={containerStyle}
                        hoverAndPressStyle={[styles.mr0, styles.br2]}
                    />
                ),
                isActive: policy?.isAutoApprovalEnabled ?? false,
                pendingAction: policy?.pendingFields?.approvalMode,
            },
            {
                icon: Illustrations.WalletAlt,
                title: translate('workflowsPage.makeOrTrackPaymentsTitle'),
                subtitle: translate('workflowsPage.makeOrTrackPaymentsDescription'),
                onToggle: () => {
                    // TODO will be done in https://github.com/Expensify/Expensify/issues/368335
                },
                subMenuItems: (
                    <>
                        <MenuItem
                            descriptionTextStyle={
                                isOffline ? StyleUtils.getWorkspaceWorkflowsOfflineDescriptionStyle([styles.textNormal, styles.textSupporting]) : [styles.textNormal, styles.textSupporting]
                            }
                            title={hasVBA ? translate('common.bankAccount') : undefined}
                            titleStyle={styles.textLabelSupportingNormal}
                            description={state !== BankAccount.STATE.OPEN ? translate('workflowsPage.connectBankAccount') : bankDisplayName}
                            onPress={() => navigateToBankAccountRoute(route.params.policyID, activeRoute)}
                            // TODO will be done in https://github.com/Expensify/Expensify/issues/368335
                            shouldShowRightIcon
                            wrapperStyle={containerStyle}
                            hoverAndPressStyle={[styles.mr0, styles.br2]}
                        />
                        {hasVBA && (
                            <MenuItem
                                descriptionTextStyle={
                                    isOffline
                                        ? StyleUtils.getWorkspaceWorkflowsOfflineDescriptionStyle([styles.textNormal, styles.textSupporting])
                                        : [styles.textNormal, styles.textSupporting]
                                }
                                title={translate('workflowsPage.authorizedPayer')}
                                titleStyle={styles.textLabelSupportingNormal}
                                description={displayNameForAuthorizedPayer}
                                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_PAYER.getRoute(route.params.policyID))}
                                // TODO will be done in https://github.com/Expensify/Expensify/issues/368335
                                shouldShowRightIcon
                                wrapperStyle={containerStyle}
                                hoverAndPressStyle={[styles.mr0, styles.br2]}
                            />
                        )}
                    </>
                ),
                isEndOptionRow: true,
                isActive: true, // TODO will be done in https://github.com/Expensify/Expensify/issues/368335
            },
        ];
    },
        [
            policy,
            route.params.policyID,
            styles,
            translate,
            policyOwnerDisplayName,
            containerStyle,
            isOffline,
            StyleUtils,
            onPressAutoReportingFrequency,
            preferredLocale,
            canUseDelayedSubmission,
            activeRoute,
            reimbursementAccount,
            displayNameForAuthorizedPayer
        ],
    );

    const renderOptionItem = (item: ToggleSettingOptionRowProps, index: number) => (
        <View
            style={styles.mt7}
            key={`toggleSettingOptionRow-${index}`}
        >
            <ToggleSettingOptionRow
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onToggle={item.onToggle}
                subMenuItems={item.subMenuItems}
                isActive={item.isActive}
                pendingAction={item.pendingAction}
            />
        </View>
    );

    const isPaidGroupPolicy = PolicyUtils.isPaidGroupPolicy(policy);
    const isPolicyAdmin = PolicyUtils.isPolicyAdmin(policy);

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.common.workflows')}
            icon={Illustrations.Workflows}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_WORKFLOWS}
            shouldShowOfflineIndicatorInWideScreen
            shouldShowNotFoundPage={!isPaidGroupPolicy || !isPolicyAdmin}
            shouldUseScrollView
            shouldSkipVBBACall
            shouldShowLoading={isFocused !== prevIsFocused}
        >
            <View style={[styles.mt3, styles.textStrong, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <Section
                    title={translate('workflowsPage.workflowTitle')}
                    titleStyles={styles.textStrong}
                    containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8}
                >
                    <View>
                        <Text style={[styles.mt3, styles.textSupporting]}>{translate('workflowsPage.workflowDescription')}</Text>
                        {items.map((item, index) => renderOptionItem(item, index))}
                    </View>
                </Section>
            </View>
        </WorkspacePageWithSections>
    );
}

WorkspaceWorkflowsPage.displayName = 'WorkspaceWorkflowsPage';

export default withCurrentUserPersonalDetails(withPolicy(
    withOnyx<WorkspaceWorkflowsPageProps, WorkspaceWorkflowsPageOnyxProps>({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
    })(WorkspaceWorkflowsPage),
));