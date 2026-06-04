import {FlashList} from '@shopify/flash-list';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ImportedFromAccountingSoftware from '@components/ImportedFromAccountingSoftware';
import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isConnectionInProgress, isConnectionUnverified} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import {getConnectedIntegration, getCurrentConnectionName, hasAccountingConnections as hasAccountingConnectionsPolicyUtils, isControlPolicy, shouldShowSyncError} from '@libs/PolicyUtils';
import type {PolicyFeature} from '@libs/PolicyUtils';
import {getReportFieldTypeTranslationKey} from '@libs/WorkspaceReportFieldUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {Policy, PolicyConnectionName} from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

type FieldListValue = NonNullable<Policy['fieldList']>[string];

type FieldListItem = {
    fieldID: string;
    isDisabled: boolean;
    keyForList: string;
    pendingAction?: PendingAction;
    rightLabel: string;
    text: string;
};

type WorkspaceFieldsSectionProps = {
    policy: OnyxEntry<Policy>;
    policyID: string;
    isEnabled: boolean;
    pendingAction?: PendingAction | null;
    fieldFilter: (field: FieldListValue) => boolean;
    titleKey: TranslationPaths;
    subtitleKey: TranslationPaths;
    importedFromAccountingSoftwareKey: TranslationPaths;
    disableTitleKey: TranslationPaths;
    disablePromptKey: TranslationPaths;
    addFieldKey: TranslationPaths;
    createRoute: Route;
    getSettingsRoute: (policyID: string, fieldID: string) => Route;
    upgradeFeatureAlias: string;
    upgradeBackToRoute: Route;
    enableFields: (policyID: string, enabled: boolean) => void;
    openFieldsPage: (policyID: string) => void;
    policyFeature: PolicyFeature;
    syncErrorConnectionNames?: readonly PolicyConnectionName[];
    titleAccessibilityRole?: typeof CONST.ROLE.HEADER;
};

function keyExtractor(item: FieldListItem) {
    return item.keyForList;
}

function WorkspaceFieldsSection({
    policy,
    policyID,
    isEnabled,
    pendingAction,
    fieldFilter,
    titleKey,
    subtitleKey,
    importedFromAccountingSoftwareKey,
    disableTitleKey,
    disablePromptKey,
    addFieldKey,
    createRoute,
    getSettingsRoute,
    upgradeFeatureAlias,
    upgradeBackToRoute,
    enableFields,
    openFieldsPage,
    policyFeature,
    syncErrorConnectionNames,
    titleAccessibilityRole,
}: WorkspaceFieldsSectionProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {showConfirmModal} = useConfirmModal();
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const syncingAccountingIntegration = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES.find((connectionName) => connectionName === connectionSyncProgress?.connectionName);
    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress, syncErrorConnectionNames);
    const connectedIntegration = getConnectedIntegration(policy) ?? syncingAccountingIntegration;
    const isConnectionVerified = connectedIntegration && !isConnectionUnverified(policy, connectedIntegration);
    const currentConnectionName = getCurrentConnectionName(policy);
    const hasAccountingConnections = hasAccountingConnectionsPolicyUtils(policy);
    const fieldList = policy?.fieldList;
    const {canWrite, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, policyFeature);

    const fetchFields = useCallback(() => {
        openFieldsPage(policyID);
    }, [openFieldsPage, policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchFields});

    useEffect(() => {
        fetchFields();
    }, [fetchFields]);

    const fields = useMemo<FieldListItem[]>(() => {
        if (!fieldList) {
            return [];
        }

        return Object.values(fieldList)
            .filter(fieldFilter)
            .sort((a, b) => localeCompare(a.name, b.name))
            .map((field) => ({
                text: field.name,
                keyForList: String(field.fieldID),
                fieldID: field.fieldID,
                pendingAction: field.pendingAction,
                isDisabled: field.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                rightLabel: Str.recapitalize(translate(getReportFieldTypeTranslationKey(field.type ?? CONST.REPORT_FIELD_TYPES.TEXT))),
            }));
    }, [fieldFilter, fieldList, localeCompare, translate]);

    const navigateToFieldSettings = useCallback(
        (item: FieldListItem) => {
            if (!canWrite) {
                return;
            }

            Navigation.navigate(getSettingsRoute(policyID, item.fieldID));
        },
        [canWrite, getSettingsRoute, policyID],
    );

    const renderItem = useCallback(
        ({item}: ListRenderItemInfo<FieldListItem>) => (
            <OfflineWithFeedback pendingAction={item.pendingAction}>
                <MenuItem
                    style={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                    onPress={() => navigateToFieldSettings(item)}
                    description={item.text}
                    disabled={item.isDisabled}
                    shouldShowRightIcon={!item.isDisabled && canWrite}
                    interactive={!item.isDisabled && canWrite}
                    rightLabel={item.rightLabel}
                    descriptionTextStyle={[styles.popoverMenuText, styles.textStrong]}
                />
            </OfflineWithFeedback>
        ),
        [canWrite, navigateToFieldSettings, shouldUseNarrowLayout, styles.ph5, styles.ph8, styles.popoverMenuText, styles.textStrong],
    );

    const headerText =
        !hasSyncError && isConnectionVerified && currentConnectionName ? (
            <Text style={[styles.mr5, styles.mt1]}>
                <ImportedFromAccountingSoftware
                    policyID={policyID}
                    currentConnectionName={currentConnectionName}
                    connectedIntegration={connectedIntegration}
                    translatedText={translate(importedFromAccountingSoftwareKey)}
                />
            </Text>
        ) : (
            <Text style={[styles.textNormal, styles.colorMuted, styles.mr5, styles.mt1]}>{translate(subtitleKey)}</Text>
        );

    const switchAccessibilityLabel =
        !hasSyncError && isConnectionVerified && currentConnectionName
            ? `${translate(titleKey)}, ${translate(importedFromAccountingSoftwareKey)} ${currentConnectionName} ${translate('workspace.accounting.settings')}`
            : `${translate(titleKey)}, ${translate(subtitleKey)}`;

    const isLoading = !isOffline && policy === undefined;

    const onDisabledOrganizeSwitchPress = () => {
        if (!hasAccountingConnections) {
            return;
        }

        showConfirmModal({
            title: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle'),
            prompt: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledText'),
            confirmText: translate('workspace.moreFeatures.connectionsWarningModal.manageSettings'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            Navigation.navigate(ROUTES.POLICY_ACCOUNTING.getRoute(policyID));
        });
    };

    return (
        <Section
            isCentralPane
            containerStyles={shouldUseNarrowLayout ? styles.p5 : styles.p8}
        >
            <ToggleSettingOptionRow
                pendingAction={pendingAction}
                title={translate(titleKey)}
                switchAccessibilityLabel={switchAccessibilityLabel}
                subtitle={headerText}
                titleStyle={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb1]}
                titleAccessibilityRole={titleAccessibilityRole}
                isActive={isEnabled}
                onToggle={(enabled) => {
                    if (!enabled) {
                        showConfirmModal({
                            danger: true,
                            title: translate(disableTitleKey),
                            prompt: translate(disablePromptKey),
                            confirmText: translate('common.disable'),
                            cancelText: translate('common.cancel'),
                        }).then((result) => {
                            if (result.action !== ModalActions.CONFIRM) {
                                return;
                            }

                            enableFields(policyID, false);
                        });
                        return;
                    }

                    if (!isControlPolicy(policy)) {
                        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, upgradeFeatureAlias, upgradeBackToRoute));
                        return;
                    }

                    enableFields(policyID, true);
                }}
                disabled={hasAccountingConnections || !canWrite}
                disabledAction={withReadOnlyFallback(onDisabledOrganizeSwitchPress)}
                showLockIcon={!canWrite}
                subMenuItems={
                    isEnabled && (
                        <>
                            <View style={[shouldUseNarrowLayout ? styles.mhn5 : styles.mhn8, styles.mt6]}>
                                {!isLoading && (
                                    <FlashList
                                        data={fields}
                                        renderItem={renderItem}
                                        keyExtractor={keyExtractor}
                                        maintainVisibleContentPosition={{disabled: true}}
                                    />
                                )}
                            </View>
                            {!hasAccountingConnections && canWrite && (
                                <MenuItem
                                    onPress={() => Navigation.navigate(createRoute)}
                                    title={translate(addFieldKey)}
                                    icon={icons.Plus}
                                    style={[styles.sectionMenuItemTopDescription]}
                                />
                            )}
                        </>
                    )
                }
            />
        </Section>
    );
}

export default WorkspaceFieldsSection;
