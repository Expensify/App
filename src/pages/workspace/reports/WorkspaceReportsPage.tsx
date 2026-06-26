import {Str} from 'expensify-common';
import React from 'react';
import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import SectionSubtitleHTML from '@components/SectionSubtitleHTML';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {clearPolicyTitleFieldError, enablePolicyReportFields, setPolicyPreventMemberCreatedTitle} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {isControlPolicy} from '@libs/PolicyUtils';
import {getTitleFieldWithFallback} from '@libs/ReportUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import WorkspaceFieldsSection from '@pages/workspace/fields/WorkspaceFieldsSection';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {openPolicyReportFieldsPage} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceReportFieldsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.REPORTS>;

function WorkspaceReportFieldsPage({
    route: {
        params: {policyID},
    },
}: WorkspaceReportFieldsPageProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(policyID);
    const {canWrite: canWriteReportFields, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.REPORT_FIELDS);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.reports');

    const illustrations = useMemoizedLazyIllustrations(['ReportReceipt']);

    const {isOffline} = useNetwork();

    const titleField = getTitleFieldWithFallback(policy);

    const isLoading = !isOffline && policy === undefined;
    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'WorkspaceReportFieldsPage', isOffline, isPolicyUndefined: policy === undefined};

    const titleFieldError = policy?.errorFields?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE];
    const reportTitleErrors = getLatestErrorField({errorFields: titleFieldError ?? {}}, 'defaultValue');

    const policyTitleField = policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE];
    const reportTitlePendingFields = policyTitleField?.pendingFields ?? {};

    const clearTitleFieldError = () => {
        clearPolicyTitleFieldError(policyID);
    };

    const toggleTitleStyle = [styles.pv2, styles.pr3];

    const renderReportTitle = () => (
        <OfflineWithFeedback pendingAction={policy?.pendingAction}>
            <Text
                style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb1]}
                accessibilityRole={CONST.ROLE.HEADER}
            >
                {translate('workspace.common.reportTitle')}
            </Text>
        </OfflineWithFeedback>
    );

    const renderReportSubtitle = () => (
        <OfflineWithFeedback pendingAction={policy?.pendingAction}>
            <SectionSubtitleHTML
                html={translate('workspace.reports.customReportNamesSubtitle')}
                wrapperStyle={styles.mt1}
            />
        </OfflineWithFeedback>
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.REPORT_FIELDS}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                style={[styles.defaultModalContainer]}
                testID="WorkspaceReportFieldsPage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
            >
                <HeaderWithBackButton
                    icon={illustrations.ReportReceipt}
                    title={translate('common.reports')}
                    shouldUseHeadlineHeader
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldDisplayHelpButton
                    onBackButtonPress={Navigation.goBack}
                />
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flex1}
                        reasonAttributes={reasonAttributes}
                    />
                )}
                {!isLoading && (
                    <ScrollView contentContainerStyle={[styles.flexGrow1, styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section
                            isCentralPane
                            renderTitle={renderReportTitle}
                            renderSubtitle={renderReportSubtitle}
                            containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8}
                        >
                            <OfflineWithFeedback
                                pendingAction={reportTitlePendingFields.defaultValue ?? policy?.pendingAction}
                                shouldForceOpacity={reportTitlePendingFields.defaultValue === CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}
                                errors={reportTitleErrors}
                                errorRowStyles={[styles.mh0]}
                                errorRowTextStyles={[styles.mv2]}
                                onClose={clearTitleFieldError}
                            >
                                <MenuItemWithTopDescription
                                    description={translate('workspace.reports.customNameTitle')}
                                    title={Str.htmlDecode(titleField?.defaultValue ?? '')}
                                    shouldShowRightIcon={canWriteReportFields}
                                    style={[styles.sectionMenuItemTopDescription, styles.mt6]}
                                    onPress={() => Navigation.navigate(ROUTES.REPORTS_DEFAULT_TITLE.getRoute(policyID))}
                                    interactive={canWriteReportFields}
                                />
                            </OfflineWithFeedback>
                            <ToggleSettingOptionRow
                                pendingAction={reportTitlePendingFields.deletable ?? policy?.pendingAction}
                                title={translate('workspace.reports.preventMembersFromChangingCustomNamesTitle')}
                                switchAccessibilityLabel={translate('workspace.reports.preventMembersFromChangingCustomNamesTitle')}
                                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3]}
                                titleStyle={toggleTitleStyle}
                                isActive={titleField?.deletable === false}
                                onToggle={(isEnabled) => {
                                    if (isEnabled && !isControlPolicy(policy)) {
                                        Navigation.navigate(
                                            ROUTES.WORKSPACE_UPGRADE.getRoute(
                                                policyID,
                                                CONST.UPGRADE_FEATURE_INTRO_MAPPING.policyPreventMemberChangingTitle.alias,
                                                ROUTES.WORKSPACE_REPORTS.getRoute(policyID),
                                            ),
                                        );
                                        return;
                                    }

                                    setPolicyPreventMemberCreatedTitle(policyID, isEnabled, policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]);
                                }}
                                disabled={!canWriteReportFields}
                                disabledAction={withReadOnlyFallback()}
                                showLockIcon={!canWriteReportFields}
                            />
                        </Section>
                        <WorkspaceFieldsSection
                            policy={policy}
                            policyID={policyID}
                            isEnabled={!!policy?.areReportFieldsEnabled}
                            pendingAction={policy?.pendingFields?.areReportFieldsEnabled}
                            fieldFilter={(field) => field.fieldID !== CONST.REPORT_FIELD_TITLE_FIELD_ID && (!field.target || field.target === CONST.REPORT_FIELD_TARGETS.EXPENSE)}
                            titleKey="workspace.common.reportFields"
                            subtitleKey="workspace.reportFields.subtitle"
                            importedFromAccountingSoftwareKey="workspace.reportFields.importedFromAccountingSoftware"
                            disableTitleKey="workspace.reportFields.disableReportFields"
                            disablePromptKey="workspace.reportFields.disableReportFieldsConfirmation"
                            addFieldKey="workspace.reportFields.addField"
                            createRoute={ROUTES.WORKSPACE_CREATE_REPORT_FIELD.getRoute(policyID)}
                            getSettingsRoute={ROUTES.WORKSPACE_REPORT_FIELDS_SETTINGS.getRoute}
                            upgradeFeatureAlias={CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias}
                            upgradeBackToRoute={ROUTES.WORKSPACE_REPORTS.getRoute(policyID)}
                            enableFields={enablePolicyReportFields}
                            openFieldsPage={openPolicyReportFieldsPage}
                            policyFeature={CONST.POLICY.POLICY_FEATURE.REPORT_FIELDS}
                            syncErrorConnectionNames={CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES}
                            titleAccessibilityRole={CONST.ROLE.HEADER}
                        />
                    </ScrollView>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceReportFieldsPage;
