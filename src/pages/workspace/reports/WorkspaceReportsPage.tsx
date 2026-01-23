import {FlashList} from '@shopify/flash-list';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import {Str} from 'expensify-common';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {Plus} from '@components/Icon/Expensicons';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import type {ListItem} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {clearPolicyTitleFieldError, enablePolicyReportFields, setPolicyPreventMemberCreatedTitle} from '@libs/actions/Policy/Policy';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getConnectedIntegration, getCurrentConnectionName, hasAccountingConnections as hasAccountingConnectionsPolicyUtils, isControlPolicy, shouldShowSyncError} from '@libs/PolicyUtils';
import {getTitleFieldWithFallback} from '@libs/ReportUtils';
import {getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {openPolicyReportFieldsPage} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type ReportFieldForList = ListItem & {
    fieldID: string;
    rightLabel: string;
    isDisabled: boolean;
};

type WorkspaceReportFieldsPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.REPORTS>;

function keyExtractor(item: ReportFieldForList) {
    return item.keyForList ?? '';
}

function WorkspaceReportFieldsPage({
    route: {
        params: {policyID},
    },
}: WorkspaceReportFieldsPageProps) {
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout for the small screen selection mode
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [isReportFieldsWarningModalOpen, setIsReportFieldsWarningModalOpen] = useState(false);
    const policy = usePolicy(policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`, {canBeMissing: true});
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress);
    const connectedIntegration = getConnectedIntegration(policy) ?? connectionSyncProgress?.connectionName;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);
    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const [isOrganizeWarningModalOpen, setIsOrganizeWarningModalOpen] = useState(false);

    const illustrations = useMemoizedLazyIllustrations(['ReportReceipt']);

    const onDisabledOrganizeSwitchPress = () => {
        if (!hasAccountingConnections) {
            return;
        }
        setIsOrganizeWarningModalOpen(true);
    };

    const {isOffline} = useNetwork({onReconnect: () => openPolicyReportFieldsPage(policyID)});

    useEffect(() => {
        openPolicyReportFieldsPage(policyID);
    }, [policyID]);

    const titleField = getTitleFieldWithFallback(policy);

    const reportFieldsSections: ReportFieldForList[] = policy?.fieldList
        ? Object.entries(policy.fieldList)
              .filter(([, value]) => value.fieldID !== 'text_title')
              .map(([, reportField]) => ({
                  text: reportField.name,
                  keyForList: String(reportField.fieldID),
                  fieldID: reportField.fieldID,
                  pendingAction: reportField.pendingAction,
                  isDisabled: reportField.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                  rightLabel: Str.recapitalize(translate(getReportFieldTypeTranslationKey(reportField.type ?? CONST.REPORT_FIELD_TYPES.TEXT))),
              }))
              .sort((a, b) => localeCompare(a.text, b.text))
        : [];

    const navigateToReportFieldsSettings = (reportField: ReportFieldForList) => {
        Navigation.navigate(ROUTES.WORKSPACE_REPORT_FIELDS_SETTINGS.getRoute(policyID, reportField.fieldID));
    };

    const getHeaderText = () =>
        !hasSyncError && isConnectionVerified && currentConnectionName ? (
            <Text style={[styles.mr5, styles.mt1]}>
                <ImportedFromAccountingSoftware
                    policyID={policyID}
                    currentConnectionName={currentConnectionName}
                    connectedIntegration={connectedIntegration}
                    translatedText={translate('workspace.reportFields.importedFromAccountingSoftware')}
                />
            </Text>
        ) : (
            <Text style={[styles.textNormal, styles.colorMuted, styles.mr5, styles.mt1]}>{translate('workspace.reportFields.subtitle')}</Text>
        );

    const isLoading = !isOffline && policy === undefined;

    const renderItem = ({item}: ListRenderItemInfo<ReportFieldForList>) => (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <MenuItem
                style={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                onPress={() => navigateToReportFieldsSettings(item)}
                description={item.text}
                disabled={item.isDisabled}
                shouldShowRightIcon={!item.isDisabled}
                interactive={!item.isDisabled}
                rightLabel={item.rightLabel}
                descriptionTextStyle={[styles.popoverMenuText, styles.textStrong]}
            />
        </OfflineWithFeedback>
    );

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
            <Text style={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb1]}>{translate('workspace.common.reportTitle')}</Text>
        </OfflineWithFeedback>
    );

    const renderReportSubtitle = () => (
        <OfflineWithFeedback pendingAction={policy?.pendingAction}>
            <View style={[[styles.renderHTML, styles.mt1]]}>
                <RenderHTML html={translate('workspace.reports.customReportNamesSubtitle')} />
            </View>
        </OfflineWithFeedback>
    );

    const reportFieldsAccessibilityLabel = useMemo(() => {
        if (!hasSyncError && isConnectionVerified && currentConnectionName) {
            return `${translate('workspace.common.reportFields')}, ${translate('workspace.reportFields.importedFromAccountingSoftware')} ${currentConnectionName} ${translate('workspace.accounting.settings')}`;
        }
        return `${translate('workspace.common.reportFields')}, ${translate('workspace.reportFields.subtitle')}`;
    }, [hasSyncError, isConnectionVerified, currentConnectionName, translate]);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
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
                    onBackButtonPress={Navigation.popToSidebar}
                />
                {isLoading && (
                    <ActivityIndicator
                        size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                        style={styles.flex1}
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
                                    shouldShowRightIcon
                                    style={[styles.sectionMenuItemTopDescription, styles.mt6]}
                                    onPress={() => Navigation.navigate(ROUTES.REPORTS_DEFAULT_TITLE.getRoute(policyID))}
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

                                    setPolicyPreventMemberCreatedTitle(policyID, isEnabled);
                                }}
                            />
                        </Section>
                        <Section
                            isCentralPane
                            containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8}
                        >
                            <ToggleSettingOptionRow
                                pendingAction={policy?.pendingFields?.areReportFieldsEnabled}
                                title={translate('workspace.common.reportFields')}
                                switchAccessibilityLabel={reportFieldsAccessibilityLabel}
                                subtitle={getHeaderText()}
                                titleStyle={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb1]}
                                isActive={!!policy?.areReportFieldsEnabled}
                                onToggle={(isEnabled) => {
                                    if (!isEnabled) {
                                        setIsReportFieldsWarningModalOpen(true);
                                        return;
                                    }
                                    if (!isControlPolicy(policy)) {
                                        Navigation.navigate(
                                            ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias, ROUTES.WORKSPACE_REPORTS.getRoute(policyID)),
                                        );
                                        return;
                                    }
                                    enablePolicyReportFields(policyID, isEnabled);
                                }}
                                disabled={hasAccountingConnections}
                                disabledAction={onDisabledOrganizeSwitchPress}
                                subMenuItems={
                                    !!policy?.areReportFieldsEnabled && (
                                        <>
                                            <View style={[shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8, styles.mt6]}>
                                                <FlashList
                                                    data={reportFieldsSections}
                                                    renderItem={renderItem}
                                                    keyExtractor={keyExtractor}
                                                    maintainVisibleContentPosition={{disabled: true}}
                                                />
                                            </View>
                                            {!hasAccountingConnections && (
                                                <MenuItem
                                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_CREATE_REPORT_FIELD.getRoute(policyID))}
                                                    title={translate('workspace.reportFields.addField')}
                                                    icon={Plus}
                                                    style={[styles.sectionMenuItemTopDescription]}
                                                />
                                            )}
                                        </>
                                    )
                                }
                            />
                        </Section>
                    </ScrollView>
                )}
                <ConfirmModal
                    title={translate('workspace.reportFields.disableReportFields')}
                    isVisible={isReportFieldsWarningModalOpen}
                    onConfirm={() => {
                        if (!policyID) {
                            return;
                        }
                        setIsReportFieldsWarningModalOpen(false);
                        enablePolicyReportFields(policyID, false);
                    }}
                    onCancel={() => setIsReportFieldsWarningModalOpen(false)}
                    prompt={translate('workspace.reportFields.disableReportFieldsConfirmation')}
                    confirmText={translate('common.disable')}
                    cancelText={translate('common.cancel')}
                    danger
                />
                <ConfirmModal
                    title={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle')}
                    onConfirm={() => {
                        if (!policyID) {
                            return;
                        }
                        setIsOrganizeWarningModalOpen(false);
                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
                    }}
                    onCancel={() => setIsOrganizeWarningModalOpen(false)}
                    isVisible={isOrganizeWarningModalOpen}
                    prompt={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText')}
                    confirmText={translate('workspace.moreFeatures.connectionsWarningModal.manageSettings')}
                    cancelText={translate('common.cancel')}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceReportFieldsPage;
