import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
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
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WorkspacesCentralPaneNavigatorParamList} from '@navigation/types';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import * as Policy from '@userActions/Policy';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Beta, Session} from '@src/types/onyx';
import ToggleSettingOptionRow from './ToggleSettingsOptionRow';
import type {ToggleSettingOptionRowProps} from './ToggleSettingsOptionRow';
import {getAutoReportingFrequencyDisplayNames} from './WorkspaceAutoReportingFrequencyPage';
import type {AutoReportingFrequencyKey} from './WorkspaceAutoReportingFrequencyPage';

type WorkspaceWorkflowsPageOnyxProps = {
    /** Beta features list */
    betas: OnyxEntry<Beta[]>;
    /** Policy details */
    session: OnyxEntry<Session>;
};
type WorkspaceWorkflowsPageProps = WithPolicyProps & WorkspaceWorkflowsPageOnyxProps & StackScreenProps<WorkspacesCentralPaneNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;

function WorkspaceWorkflowsPage({policy, betas, route, session}: WorkspaceWorkflowsPageProps) {
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    const policyApproverEmail = policy?.approver;
    const policyApproverName = useMemo(() => PersonalDetailsUtils.getPersonalDetailByEmail(policyApproverEmail ?? '')?.displayName ?? policyApproverEmail, [policyApproverEmail]);
    const containerStyle = useMemo(() => [styles.ph8, styles.mhn8, styles.ml11, styles.pv3, styles.pr0, styles.pl4, styles.mr0, styles.widthAuto, styles.mt4], [styles]);
    const canUseDelayedSubmission = Permissions.canUseWorkflowsDelayedSubmission(betas);
    const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

    const displayNameForAuthorizedPayer = useMemo(() => {
        const personalDetails = PersonalDetailsUtils.getPersonalDetailsByIDs([policy?.reimburserAccountID ?? 0], session?.accountID ?? 0);
        const displayNameFromReimburserEmail = PersonalDetailsUtils.getPersonalDetailByEmail(policy?.reimburserEmail ?? '')?.displayName ?? policy?.reimburserEmail;
        return displayNameFromReimburserEmail ?? personalDetails?.[0]?.displayName;
    }, [policy?.reimburserAccountID, policy?.reimburserEmail, session?.accountID]);

    const onPressAutoReportingFrequency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(policy?.id ?? '')), [policy?.id]);

    const fetchData = () => {
        Policy.openPolicyWorkflowsPage(policy?.id ?? route.params.policyID);
    };

    const confirmCurrencyChangeAndHideModal = useCallback(() => {
        if (!policy) {
            return;
        }
        Policy.updateGeneralSettings(policy.id, policy.name, CONST.CURRENCY.USD);
        setIsCurrencyModalOpen(false);
        navigateToBankAccountRoute(route.params.policyID, ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
    }, [policy, route.params.policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchData});
    const isPolicyAdmin = PolicyUtils.isPolicyAdmin(policy);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const optionItems: ToggleSettingOptionRowProps[] = useMemo(() => {
        const {accountNumber, addressName, bankName} = policy?.achAccount ?? {};
        const hasVBA = !!policy?.achAccount;
        let bankDisplayName = bankName ?? addressName;
        if (accountNumber && bankDisplayName !== accountNumber) {
            bankDisplayName += ` ${accountNumber.slice(-5)}`;
        }
        const hasReimburserEmailError = !!policy?.errorFields?.reimburserEmail;
        const hasApprovalError = !!policy?.errorFields?.approvalMode;
        const hasDelayedSubmissionError = !!policy?.errorFields?.autoReporting;

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
                                  brickRoadIndicator={hasDelayedSubmissionError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                              />
                          ),
                          isActive: (policy?.harvesting?.enabled && policy.autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT && !hasDelayedSubmissionError) ?? false,
                          pendingAction: policy?.pendingFields?.autoReporting,
                          errors: ErrorUtils.getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING),
                          onCloseError: () => Policy.clearPolicyErrorField(policy?.id ?? '', CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING),
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
                        brickRoadIndicator={hasApprovalError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                ),
                isActive: (policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.BASIC && !hasApprovalError) ?? false,
                pendingAction: policy?.pendingFields?.approvalMode,
                errors: ErrorUtils.getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE),
                onCloseError: () => Policy.clearPolicyErrorField(policy?.id ?? '', CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE),
            },
            {
                icon: Illustrations.WalletAlt,
                title: translate('workflowsPage.makeOrTrackPaymentsTitle'),
                subtitle: translate('workflowsPage.makeOrTrackPaymentsDescription'),
                onToggle: (isEnabled: boolean) => {
                    let newReimbursementChoice;
                    if (!isEnabled) {
                        newReimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
                    } else if (hasVBA && !Policy.isCurrencySupportedForDirectReimbursement(policy?.outputCurrency ?? '')) {
                        newReimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;
                    } else {
                        newReimbursementChoice = hasVBA ? CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES : CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;
                    }

                    const newReimburserAccountID =
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        PersonalDetailsUtils.getPersonalDetailByEmail(policy?.reimburserEmail ?? '')?.accountID || policy?.reimburserAccountID || policy?.ownerAccountID;
                    const newReimburserEmail = PersonalDetailsUtils.getPersonalDetailsByIDs([newReimburserAccountID ?? 0], session?.accountID ?? 0)?.[0]?.login;
                    Policy.setWorkspaceReimbursement(policy?.id ?? '', newReimbursementChoice, newReimburserAccountID ?? 0, newReimburserEmail ?? '');
                },
                subMenuItems: (
                    <>
                        <MenuItem
                            titleStyle={hasVBA ? styles.textLabelSupportingNormal : styles.textLabelSupportingEmptyValue}
                            descriptionTextStyle={styles.textNormalThemeText}
                            title={
                                hasVBA && policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES
                                    ? translate('common.bankAccount')
                                    : translate('workflowsPage.connectBankAccount')
                            }
                            description={bankDisplayName}
                            disabled={isOffline || !isPolicyAdmin}
                            onPress={() => {
                                if (!Policy.isCurrencySupportedForDirectReimbursement(policy?.outputCurrency ?? '')) {
                                    setIsCurrencyModalOpen(true);
                                    return;
                                }
                                navigateToBankAccountRoute(route.params.policyID, ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
                            }}
                            shouldShowRightIcon={!isOffline && isPolicyAdmin}
                            wrapperStyle={containerStyle}
                            hoverAndPressStyle={[styles.mr0, styles.br2]}
                        />
                        {hasVBA && policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES && (
                            <OfflineWithFeedback
                                pendingAction={policy?.pendingFields?.reimburserEmail}
                                errors={ErrorUtils.getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.REIMBURSER_EMAIL)}
                                onClose={() => Policy.clearPolicyErrorField(policy?.id ?? '', CONST.POLICY.COLLECTION_KEYS.REIMBURSER_EMAIL)}
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
                isActive: policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
                pendingAction: policy?.pendingFields?.reimbursementChoice,
                errors: ErrorUtils.getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.REIMBURSEMENT_CHOICE),
                onCloseError: () => Policy.clearPolicyErrorField(policy?.id ?? '', CONST.POLICY.COLLECTION_KEYS.REIMBURSEMENT_CHOICE),
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
        displayNameForAuthorizedPayer,
        session?.accountID,
        isOffline,
        isPolicyAdmin,
    ]);

    const renderOptionItem = (item: ToggleSettingOptionRowProps, index: number) => (
        <View
            style={styles.mt7}
            key={`toggleSettingOptionItem-${index}`}
        >
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
    const isLoading = Boolean(policy?.isLoading && policy?.reimbursementChoice === undefined);

    return (
        <FeatureEnabledAccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <WorkspacePageWithSections
                headerText={translate('workspace.common.workflows')}
                icon={Illustrations.Workflows}
                route={route}
                guidesCallTaskID={CONST.GUIDES_CALL_TASK_IDS.WORKSPACE_WORKFLOWS}
                shouldShowOfflineIndicatorInWideScreen
                shouldShowNotFoundPage={!isPaidGroupPolicy || !isPolicyAdmin}
                shouldSkipVBBACall
                isLoading={isLoading}
                shouldShowLoading={isLoading}
                shouldUseScrollView
            >
                <View style={[styles.mt3, styles.textStrong, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    <Section
                        title={translate('workflowsPage.workflowTitle')}
                        titleStyles={styles.textStrong}
                        containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8}
                    >
                        <View>
                            <Text style={[styles.mt3, styles.textSupporting]}>{translate('workflowsPage.workflowDescription')}</Text>
                            {optionItems.map(renderOptionItem)}
                            <ConfirmModal
                                title={translate('workspace.bankAccount.workspaceCurrency')}
                                isVisible={isCurrencyModalOpen}
                                onConfirm={confirmCurrencyChangeAndHideModal}
                                onCancel={() => setIsCurrencyModalOpen(false)}
                                prompt={translate('workspace.bankAccount.updateCurrencyPrompt')}
                                confirmText={translate('workspace.bankAccount.updateToUSD')}
                                cancelText={translate('common.cancel')}
                                danger
                            />
                        </View>
                    </Section>
                </View>
            </WorkspacePageWithSections>
        </FeatureEnabledAccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsPage.displayName = 'WorkspaceWorkflowsPage';

export default withPolicy(
    withOnyx<WorkspaceWorkflowsPageProps, WorkspaceWorkflowsPageOnyxProps>({
        betas: {
            key: ONYXKEYS.BETAS,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(WorkspaceWorkflowsPage),
);
