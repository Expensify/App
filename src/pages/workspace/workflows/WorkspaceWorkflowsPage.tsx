import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo} from 'react';
import {FlatList, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ErrorUtils from '@libs/ErrorUtils';
import BankAccount from '@libs/models/BankAccount';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WorkspacesCentralPaneNavigatorParamList} from '@navigation/types';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Policy from '@userActions/Policy';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Beta, ReimbursementAccount, Session} from '@src/types/onyx';
import ToggleSettingOptionRow from './ToggleSettingsOptionRow';
import type {ToggleSettingOptionRowProps} from './ToggleSettingsOptionRow';
import {getAutoReportingFrequencyDisplayNames} from './WorkspaceAutoReportingFrequencyPage';
import type {AutoReportingFrequencyKey} from './WorkspaceAutoReportingFrequencyPage';

type WorkspaceWorkflowsPageOnyxProps = {
    /** Beta features list */
    betas: OnyxEntry<Beta[]>;
    /** Reimbursement account details */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
    /** Policy details */
    session: OnyxEntry<Session>;
};
type WorkspaceWorkflowsPageProps = WithPolicyProps & WorkspaceWorkflowsPageOnyxProps & StackScreenProps<WorkspacesCentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;

function WorkspaceWorkflowsPage({policy, betas, route, reimbursementAccount, session}: WorkspaceWorkflowsPageProps) {
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    const policyApproverEmail = policy?.approver;
    const policyApproverName = useMemo(() => PersonalDetailsUtils.getPersonalDetailByEmail(policyApproverEmail ?? '')?.displayName ?? policyApproverEmail, [policyApproverEmail]);
    const containerStyle = useMemo(() => [styles.ph8, styles.mhn8, styles.ml11, styles.pv3, styles.pr0, styles.pl4, styles.mr0, styles.widthAuto, styles.mt4], [styles]);
    const canUseDelayedSubmission = Permissions.canUseWorkflowsDelayedSubmission(betas);

    const displayNameForAuthorizedPayer = useMemo(() => {
        const personalDetails = PersonalDetailsUtils.getPersonalDetailsByIDs([policy?.reimburserAccountID ?? 0], session?.accountID ?? 0);
        const displayNameFromReimburserEmail = PersonalDetailsUtils.getPersonalDetailByEmail(policy?.reimburserEmail ?? '')?.displayName ?? policy?.reimburserEmail;
        return displayNameFromReimburserEmail ?? personalDetails?.[0]?.displayName;
    }, [policy?.reimburserAccountID, policy?.reimburserEmail, session?.accountID]);

    const onPressAutoReportingFrequency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(policy?.id ?? '')), [policy?.id]);

    const fetchData = () => {
        Policy.openPolicyWorkflowsPage(policy?.id ?? route.params.policyID);
    };

    useNetwork({onReconnect: fetchData});

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const optionItems: ToggleSettingOptionRowProps[] = useMemo(() => {
        const {accountNumber, state, bankName} = reimbursementAccount?.achData ?? {};
        const hasVBA = state === BankAccount.STATE.OPEN;
        const bankDisplayName = bankName ? `${bankName} ${accountNumber ? `${accountNumber.slice(-5)}` : ''}` : '';
        const hasReimburserEmailError = !!policy?.errorFields?.reimburserEmail;

        return [
            ...(canUseDelayedSubmission
                ? [
                      {
                          icon: Illustrations.ReceiptEnvelope,
                          title: translate('workflowsPage.delaySubmissionTitle'),
                          subtitle: translate('workflowsPage.delaySubmissionDescription'),
                          onToggle: (isEnabled: boolean) => {
                              const frequency =
                                  policy?.autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT || !policy?.autoReportingFrequency
                                      ? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY
                                      : policy.autoReportingFrequency;
                              Policy.setWorkspaceAutoReporting(route.params.policyID, isEnabled, frequency);
                          },
                          subMenuItems: (
                              <MenuItem
                                  title={translate('workflowsPage.submissionFrequency')}
                                  titleStyle={styles.textLabelSupportingNormal}
                                  descriptionTextStyle={styles.textNormalThemeText}
                                  onPress={onPressAutoReportingFrequency}
                                  // Instant submit is the equivalent of delayed submissions being turned off, so we show the feature as disabled if the frequency is instant
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
                          isActive: (policy?.harvesting?.enabled && policy.autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT) ?? false,
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
                        description={policyApproverName ?? ''}
                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVER.getRoute(route.params.policyID))}
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
                    const isActive = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
                    const newReimbursementChoice = isActive ? CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL : CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
                    const newReimburserAccountID =
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        PersonalDetailsUtils.getPersonalDetailByEmail(policy?.reimburserEmail ?? '')?.accountID || policy?.reimburserAccountID || policy?.ownerAccountID;
                    const newReimburserEmail = PersonalDetailsUtils.getPersonalDetailsByIDs([newReimburserAccountID ?? 0], session?.accountID ?? 0)?.[0]?.login;
                    Policy.setWorkspaceReimbursement(policy?.id ?? '', newReimbursementChoice, newReimburserAccountID ?? 0, newReimburserEmail ?? '');
                },
                subMenuItems: (
                    <>
                        <MenuItem
                            titleStyle={styles.textLabelSupportingNormal}
                            descriptionTextStyle={styles.textNormalThemeText}
                            title={hasVBA ? translate('common.bankAccount') : translate('workflowsPage.connectBankAccount')}
                            description={state === BankAccount.STATE.OPEN ? bankDisplayName : undefined}
                            onPress={() => navigateToBankAccountRoute(route.params.policyID, ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID))}
                            shouldShowRightIcon
                            wrapperStyle={containerStyle}
                            hoverAndPressStyle={[styles.mr0, styles.br2]}
                        />
                        {hasVBA && (
                            <OfflineWithFeedback
                                pendingAction={policy?.pendingFields?.reimburserEmail}
                                errors={ErrorUtils.getLatestErrorField(policy ?? {}, 'reimburserEmail')}
                                onClose={() => Policy.clearWorkspacePayerError(policy?.id ?? '')}
                                errorRowStyles={[styles.ml7]}
                            >
                                <MenuItem
                                    titleStyle={styles.textLabelSupportingNormal}
                                    descriptionTextStyle={styles.textNormalThemeText}
                                    title={translate('workflowsPayerPage.title')}
                                    description={displayNameForAuthorizedPayer}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_PAYER.getRoute(route.params.policyID))}
                                    shouldShowRightIcon
                                    wrapperStyle={containerStyle}
                                    hoverAndPressStyle={[styles.mr0, styles.br2]}
                                    brickRoadIndicator={hasReimburserEmailError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                />
                            </OfflineWithFeedback>
                        )}
                    </>
                ),
                isEndOptionRow: true,
                isActive: policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                pendingAction: policy?.pendingFields?.reimbursementChoice,
                errors: ErrorUtils.getLatestErrorField(policy ?? {}, 'reimbursementChoice'),
                onCloseError: () => Policy.clearWorkspaceReimbursementErrors(policy?.id ?? ''),
            },
        ];
    }, [
        policy,
        route.params.policyID,
        styles,
        translate,
        policyApproverName,
        containerStyle,
        onPressAutoReportingFrequency,
        preferredLocale,
        canUseDelayedSubmission,
        reimbursementAccount?.achData,
        displayNameForAuthorizedPayer,
        session?.accountID,
    ]);

    const renderOptionItem = ({item}: {item: ToggleSettingOptionRowProps}) => (
        <View style={styles.mt7}>
            <ToggleSettingOptionRow
                icon={item.icon}
                title={item.title}
                subtitle={item.subtitle}
                onToggle={item.onToggle}
                subMenuItems={item.subMenuItems}
                isActive={item.isActive}
                pendingAction={item.pendingAction}
                errors={item.errors}
                onCloseError={item.onCloseError}
            />
        </View>
    );

    const isPaidGroupPolicy = PolicyUtils.isPaidGroupPolicy(policy);
    const isPolicyAdmin = PolicyUtils.isPolicyAdmin(policy);
    const isLoading = reimbursementAccount?.isLoading ?? true;

    return (
        <WorkspacePageWithSections
            headerText={translate('workspace.common.workflows')}
            icon={Illustrations.Workflows}
            route={route}
            guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_WORKFLOWS}
            shouldShowOfflineIndicatorInWideScreen
            shouldShowNotFoundPage={!isPaidGroupPolicy || !isPolicyAdmin}
            shouldSkipVBBACall
            isLoading={isLoading}
        >
            <View style={[styles.mt3, styles.textStrong, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                <Section
                    title={translate('workflowsPage.workflowTitle')}
                    titleStyles={styles.textStrong}
                    containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8}
                >
                    <View>
                        <Text style={[styles.mt3, styles.textSupporting]}>{translate('workflowsPage.workflowDescription')}</Text>
                        <FlatList
                            data={optionItems}
                            renderItem={renderOptionItem}
                            keyExtractor={(item: ToggleSettingOptionRowProps) => item.title}
                        />
                    </View>
                </Section>
            </View>
        </WorkspacePageWithSections>
    );
}

WorkspaceWorkflowsPage.displayName = 'WorkspaceWorkflowsPage';

export default withPolicy(
    withOnyx<WorkspaceWorkflowsPageProps, WorkspaceWorkflowsPageOnyxProps>({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        reimbursementAccount: {
            // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
            key: ({route}) => `${ONYXKEYS.REIMBURSEMENT_ACCOUNT}${route.params.policyID}`,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(WorkspaceWorkflowsPage),
);
