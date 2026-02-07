import {FlashList} from '@shopify/flash-list';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ConfirmModal from '@components/ConfirmModal';
import {Plus} from '@components/Icon/Expensicons';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import {enablePolicyInvoiceFields} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import {getConnectedIntegration, getCurrentConnectionName, hasAccountingConnections as hasAccountingConnectionsPolicyUtils, isControlPolicy, shouldShowSyncError} from '@libs/PolicyUtils';
import {getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {openPolicyInvoicesPage} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type InvoiceFieldListItem = {
    fieldID: string;
    isDisabled: boolean;
    keyForList: string;
    pendingAction?: PendingAction;
    rightLabel: string;
    text: string;
};

type WorkspaceInvoiceFieldsSectionProps = {
    policyID: string;
};

function keyExtractor(item: InvoiceFieldListItem) {
    return item.keyForList;
}

function WorkspaceInvoiceFieldsSection({policyID}: WorkspaceInvoiceFieldsSectionProps) {
    const policy = usePolicy(policyID);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isReportFieldsWarningModalOpen, setIsReportFieldsWarningModalOpen] = useState(false);
    const [isOrganizeWarningModalOpen, setIsOrganizeWarningModalOpen] = useState(false);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`, {canBeMissing: true});
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress);
    const connectedIntegration = getConnectedIntegration(policy) ?? connectionSyncProgress?.connectionName;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);
    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const fetchInvoiceFields = useCallback(() => {
        openPolicyInvoicesPage(policyID);
    }, [policyID]);
    const invoiceFieldsEnabled = policy?.areInvoiceFieldsEnabled;
    const invoiceFieldsPendingAction = policy?.pendingFields?.areInvoiceFieldsEnabled;

    const {isOffline} = useNetwork({onReconnect: fetchInvoiceFields});

    useEffect(() => {
        fetchInvoiceFields();
    }, [fetchInvoiceFields]);

    const invoiceFields = useMemo<InvoiceFieldListItem[]>(() => {
        if (!policy?.fieldList) {
            return [];
        }

        return Object.values(policy.fieldList)
            .filter((field) => field.target === CONST.REPORT_FIELD_TARGETS.INVOICE)
            .sort((a, b) => localeCompare(a.name, b.name))
            .map((field) => ({
                text: field.name,
                keyForList: String(field.fieldID),
                fieldID: field.fieldID,
                pendingAction: field.pendingAction,
                isDisabled: field.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                rightLabel: Str.recapitalize(translate(getReportFieldTypeTranslationKey(field.type))),
            }));
    }, [localeCompare, policy?.fieldList, translate]);

    const navigateToReportFieldSettings = useCallback(
        (item: InvoiceFieldListItem) => {
            Navigation.navigate(ROUTES.WORKSPACE_INVOICE_FIELDS_SETTINGS.getRoute(policyID, item.fieldID));
        },
        [policyID],
    );

    const renderItem = useCallback(
        ({item}: ListRenderItemInfo<InvoiceFieldListItem>) => (
            <OfflineWithFeedback pendingAction={item.pendingAction}>
                <MenuItem
                    style={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                    onPress={() => navigateToReportFieldSettings(item)}
                    description={item.text}
                    disabled={item.isDisabled}
                    shouldShowRightIcon={!item.isDisabled}
                    interactive={!item.isDisabled}
                    rightLabel={item.rightLabel}
                    descriptionTextStyle={[styles.popoverMenuText, styles.textStrong]}
                />
            </OfflineWithFeedback>
        ),
        [navigateToReportFieldSettings, shouldUseNarrowLayout, styles.ph5, styles.ph8, styles.popoverMenuText, styles.textStrong],
    );

    const getHeaderText = () =>
        !hasSyncError && isConnectionVerified && currentConnectionName ? (
            <Text style={[styles.mr5, styles.mt1]}>
                <ImportedFromAccountingSoftware
                    policyID={policyID}
                    currentConnectionName={currentConnectionName}
                    connectedIntegration={connectedIntegration}
                    translatedText={translate('workspace.invoiceFields.importedFromAccountingSoftware')}
                />
            </Text>
        ) : (
            <Text style={[styles.textNormal, styles.colorMuted, styles.mr5, styles.mt1]}>{translate('workspace.invoiceFields.subtitle')}</Text>
        );

    const isLoading = !isOffline && policy === undefined;

    return (
        <>
            <Section
                isCentralPane
                containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8}
            >
                <ToggleSettingOptionRow
                    pendingAction={invoiceFieldsPendingAction}
                    title={translate('workspace.common.invoiceFields')}
                    switchAccessibilityLabel={translate('workspace.common.invoiceFields')}
                    subtitle={getHeaderText()}
                    titleStyle={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb1]}
                    isActive={!!invoiceFieldsEnabled}
                    onToggle={(isEnabled) => {
                        if (!isEnabled) {
                            setIsReportFieldsWarningModalOpen(true);
                            return;
                        }

                        if (!isControlPolicy(policy)) {
                            Navigation.navigate(
                                ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.reportFields.alias, ROUTES.WORKSPACE_INVOICES.getRoute(policyID)),
                            );
                            return;
                        }

                        enablePolicyInvoiceFields(policyID, isEnabled);
                    }}
                    disabled={hasAccountingConnections}
                    disabledAction={() => setIsOrganizeWarningModalOpen(true)}
                    subMenuItems={
                        !!invoiceFieldsEnabled && (
                            <>
                                <View style={[shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8, styles.mt6]}>
                                    {!isLoading && (
                                        <FlashList
                                            data={invoiceFields}
                                            renderItem={renderItem}
                                            keyExtractor={keyExtractor}
                                            maintainVisibleContentPosition={{disabled: true}}
                                        />
                                    )}
                                </View>
                                {!hasAccountingConnections && (
                                    <MenuItem
                                        onPress={() => Navigation.navigate(ROUTES.WORKSPACE_INVOICE_FIELDS_CREATE.getRoute(policyID))}
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

            <ConfirmModal
                title={translate('workspace.invoiceFields.disableInvoiceFields')}
                isVisible={isReportFieldsWarningModalOpen}
                onConfirm={() => {
                    setIsReportFieldsWarningModalOpen(false);
                    enablePolicyInvoiceFields(policyID, false);
                }}
                onCancel={() => setIsReportFieldsWarningModalOpen(false)}
                prompt={translate('workspace.invoiceFields.disableInvoiceFieldsConfirmation')}
                confirmText={translate('common.disable')}
                cancelText={translate('common.cancel')}
                danger
            />

            <ConfirmModal
                title={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle')}
                onConfirm={() => {
                    setIsOrganizeWarningModalOpen(false);
                    Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
                }}
                onCancel={() => setIsOrganizeWarningModalOpen(false)}
                isVisible={isOrganizeWarningModalOpen}
                prompt={translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText')}
                confirmText={translate('workspace.moreFeatures.connectionsWarningModal.manageSettings')}
                cancelText={translate('common.cancel')}
            />
        </>
    );
}

WorkspaceInvoiceFieldsSection.displayName = 'WorkspaceInvoiceFieldsSection';

export default WorkspaceInvoiceFieldsSection;
