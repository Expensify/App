import {ModalActions} from '@components/Modal/Global/ModalContext';
import TextLink from '@components/TextLink';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';

import useCardFeeds from '@hooks/useCardFeeds';
import useCardsLists from '@hooks/useCardsLists';
import useConfirmModal from '@hooks/useConfirmModal';
import useEnvironment from '@hooks/useEnvironment';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';
import useIsUnifiedConnectionsBetaEnabled from '@hooks/useIsUnifiedConnectionsBetaEnabled';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';

import {getQBORefreshTokenExpiryDate, getQBORefreshTokenExpiryStatus} from '@libs/AccountingUtils';
import {isAuthenticationError, isConnectionInProgress, isConnectionUnverified, removePolicyConnection, syncConnection} from '@libs/actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {isExpensifyCardFullySetUp} from '@libs/CardUtils';
import DateUtils from '@libs/DateUtils';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import {
    areSettingsInErrorFields,
    findCurrentXeroOrganization,
    getConnectedIntegration,
    getCurrentSageIntacctEntityName,
    getCurrentXeroOrganizationName,
    getIntegrationLastSuccessfulDate,
    getXeroTenants,
    hasAccountingConnections,
    hasSupportedOnlyOnOldDotIntegration,
    settingsPendingAction,
    shouldShowSyncError,
} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';

import {openPolicyExpensifyCardsPage} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect} from 'react';

import type {MenuItemData} from './types';

import {useAccountingActions, useAccountingState} from './AccountingContext';
import {getCertiniaSelectedCompanyID, isCertiniaFFAConnection} from './certinia/utils';
import {getAccountingIntegrationData, getAccountingIntegrationDisplayName, getSynchronizationErrorMessage, isIntuitEnterpriseSuiteConnection} from './utils';

type UseConnectedAccountingIntegrationOptions = {
    /** Style applied to the settings rows, which the Accounting page lays out as cards */
    menuItemWrapperStyle?: StyleProp<ViewStyle>;

    /** Runs once the user confirms disconnecting, before the connection is removed */
    onDisconnectConfirmed?: () => void;
};

/**
 * Everything the Accounting page and the Connections accounting panel derive for the workspace's connected accounting
 * integration: its status, the overflow menu, and the settings rows.
 */
function useConnectedAccountingIntegration(policy: OnyxEntry<Policy>, {menuItemWrapperStyle, onDisconnectConfirmed}: UseConnectedAccountingIntegrationOptions = {}) {
    const policyID = policy?.id;
    const hasReusablePoliciesConnectedToSageIntacct = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, policyID);
    const hasReusablePoliciesConnectedToQBD = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.QBD, policyID);
    const hasReusablePoliciesConnectedToCertinia = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.CERTINIA, policyID);
    const hasReusablePoliciesConnectedToRillet = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.RILLET, policyID);
    const hasReusablePoliciesConnectedToDualEntry = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.DUALENTRY, policyID);
    const hasReusablePoliciesConnectedToCampfire = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE, policyID);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policyID}`);
    const styles = useThemeStyles();
    const {translate, datetimeToRelative: getDatetimeToRelative, getLocalDateFromDatetime, dateFnsLocale} = useLocalize();
    const {environment} = useEnvironment();
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();
    const isUnifiedConnectionsBetaEnabled = useIsUnifiedConnectionsBetaEnabled();
    const {showConfirmModal} = useConfirmModal();
    const {activeIntegration} = useAccountingState();
    const {startIntegrationFlow} = useAccountingActions();
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const allCardSettings = useExpensifyCardFeeds(policyID);
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'CircularArrowBackwards', 'ExpensifyCard', 'Gear', 'Key', 'NewWindow', 'Pencil', 'Send', 'Sync', 'Trashcan']);
    const accountingIcons = useMemoizedLazyExpensifyIcons([
        'IntacctSquare',
        'IntuitSquare',
        'QBOSquare',
        'XeroSquare',
        'NetSuiteSquare',
        'QBDSquare',
        'CertiniaSquare',
        'RilletSquare',
        'DualEntrySquare',
        'CampfireSquare',
        'BusinessCentralSquare',
    ]);
    const [cardFeeds] = useCardFeeds(policyID);
    const [cardLists] = useCardsLists();
    const {canWrite: canWriteAccounting, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.ACCOUNTING);

    const existingConnections = {
        sageIntacct: hasReusablePoliciesConnectedToSageIntacct,
        qbd: hasReusablePoliciesConnectedToQBD,
        certinia: hasReusablePoliciesConnectedToCertinia,
        rillet: hasReusablePoliciesConnectedToRillet,
        dualEntry: hasReusablePoliciesConnectedToDualEntry,
        campfire: hasReusablePoliciesConnectedToCampfire,
    };

    /** Data for an integration the workspace could connect, as listed with a Setup button */
    const getAvailableIntegrationData = (integration: ConnectionName, isIntuitEnterpriseSuite?: boolean) =>
        policyID
            ? getAccountingIntegrationData(integration, policyID, translate, existingConnections, {
                  expensifyIcons: accountingIcons,
                  cardFeeds,
                  cardList: cardLists,
                  isIntuitEnterpriseSuiteOverride: isIntuitEnterpriseSuite,
              })
            : undefined;

    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const connectionSyncStage = connectionSyncProgress?.stageInProgress;
    const canUseBusinessCentralIntegration = isBetaEnabled(CONST.BETAS.BUSINESS_CENTRAL) || !!policy?.connections?.businessCentral;
    const accountingIntegrations = CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES.filter((name) => {
        if (name === CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL) {
            return canUseBusinessCentralIntegration;
        }
        return true;
    });
    const syncingAccountingIntegration = accountingIntegrations.find((integration) => integration === connectionSyncProgress?.connectionName);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? syncingAccountingIntegration;
    const isIntuitEnterpriseSuiteSyncInProgress = isSyncInProgress && activeIntegration?.name === CONST.POLICY.CONNECTIONS.NAME.QBO && activeIntegration.isIntuitEnterpriseSuite === true;
    const isConnectedToIntuitEnterpriseSuite =
        connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.QBO && (isIntuitEnterpriseSuiteConnection(policy) || isIntuitEnterpriseSuiteSyncInProgress);
    const connectedIntegrationDisplayName = connectedIntegration ? getAccountingIntegrationDisplayName(policy, connectedIntegration, translate) : undefined;
    const hasAccountingConnection = hasAccountingConnections(policy);
    const synchronizationError = connectedIntegration && getSynchronizationErrorMessage(policy, connectedIntegration, isSyncInProgress, translate, styles);

    const isSageIntacct = connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT;
    const hasAuthError = !!connectedIntegration && !!synchronizationError && isAuthenticationError(policy, connectedIntegration);
    // A QBO refresh token that is about to expire (or already has, without a sync failing yet) is warned about while the connection still looks healthy
    const qboTokenExpiryStatus =
        connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.QBO && !synchronizationError && !isSyncInProgress ? getQBORefreshTokenExpiryStatus(policy) : undefined;
    const isQBOTokenExpiringSoon = !!qboTokenExpiryStatus;
    const qboTokenExpiryDate = isQBOTokenExpiringSoon ? getQBORefreshTokenExpiryDate(policy) : undefined;
    const shouldShowEnterCredentials = !!connectedIntegration && (hasAuthError || isSageIntacct || isQBOTokenExpiringSoon);

    // Get the last successful date of the integration. Then, if `connectionSyncProgress` is the same integration displayed and the state is 'jobDone', get the more recent update time of the two.
    const successfulDate = getIntegrationLastSuccessfulDate(
        getLocalDateFromDatetime,
        connectedIntegration ? policy?.connections?.[connectedIntegration] : undefined,
        connectedIntegration === connectionSyncProgress?.connectionName ? connectionSyncProgress : undefined,
    );
    const datetimeToRelative = successfulDate ? getDatetimeToRelative(successfulDate) : '';

    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress, accountingIntegrations);
    const hasUnsupportedNDIntegration = !isEmptyObject(policy?.connections) && hasSupportedOnlyOnOldDotIntegration(policy);

    const tenants = getXeroTenants(policy);
    const currentXeroOrganization = findCurrentXeroOrganization(tenants, policy?.connections?.xero?.config?.tenantID);
    const shouldShowSynchronizationError = !!synchronizationError;
    const shouldShowReinstallConnectorMenuItem = shouldShowSynchronizationError && connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.QBD;
    const shouldShowCardReconciliationOption = Object.values(allCardSettings ?? {})?.some((cardSetting) => isExpensifyCardFullySetUp(policy, cardSetting));
    const shouldShowReconnect = hasAuthError && connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.CERTINIA;
    let credentialsMenuTextKey: Parameters<typeof translate>[0] = 'workspace.accounting.enterCredentials';
    if (shouldShowReconnect || isQBOTokenExpiringSoon) {
        credentialsMenuTextKey = 'workspace.accounting.reconnect';
    } else if (isSageIntacct && !hasAuthError) {
        credentialsMenuTextKey = 'workspace.accounting.updateCredentials';
    }

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = [
        ...(shouldShowReinstallConnectorMenuItem
            ? [
                  {
                      icon: icons.CircularArrowBackwards,
                      text: translate('workspace.accounting.reinstall'),
                      onSelected: () => startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.QBD}),
                      shouldCallAfterModalHide: true,
                      disabled: isOffline,
                      iconRight: icons.NewWindow,
                  },
              ]
            : []),
        ...(shouldShowEnterCredentials
            ? [
                  {
                      icon: icons.Key,
                      text: translate(credentialsMenuTextKey),
                      onSelected: () => {
                          if (isSageIntacct && policyID) {
                              Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS.getRoute(policyID));
                              return;
                          }
                          startIntegrationFlow({name: connectedIntegration, isIntuitEnterpriseSuite: isConnectedToIntuitEnterpriseSuite});
                      },
                      shouldCallAfterModalHide: true,
                      disabled: isOffline,
                      iconRight: icons.NewWindow,
                  },
              ]
            : []),
        ...(!hasAuthError
            ? [
                  {
                      icon: icons.Sync,
                      text: translate('workspace.accounting.syncNow'),
                      onSelected: () => syncConnection(policy, connectedIntegration),
                      disabled: isOffline,
                  },
              ]
            : []),
        {
            icon: icons.Trashcan,
            text: translate('workspace.accounting.disconnect'),
            onSelected: () => {
                showConfirmModal({
                    title: translate('workspace.accounting.disconnectTitle', connectedIntegrationDisplayName),
                    prompt: translate('workspace.accounting.disconnectPrompt', connectedIntegrationDisplayName),
                    confirmText: translate('workspace.accounting.disconnect'),
                    cancelText: translate('common.cancel'),
                    buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                }).then(({action}) => {
                    if (action !== ModalActions.CONFIRM || !connectedIntegration || !policyID) {
                        return;
                    }
                    onDisconnectConfirmed?.();
                    removePolicyConnection(policy, connectedIntegration);
                });
            },
            shouldCallAfterModalHide: true,
        },
    ];

    useEffect(() => {
        if (!policyID || !policy?.areExpensifyCardsEnabled || !workspaceAccountID) {
            return;
        }
        openPolicyExpensifyCardsPage(policyID, workspaceAccountID);
    }, [policyID, policy?.areExpensifyCardsEnabled, workspaceAccountID]);

    const getIntegrationSpecificMenuItems = () => {
        const sageIntacctEntityList = policy?.connections?.intacct?.data?.entities ?? [];
        const netSuiteSubsidiaryList = policy?.connections?.netsuite?.options?.data?.subsidiaryList ?? [];
        const rilletSubsidiaryList = policy?.connections?.rillet?.data?.subsidiaries;
        const dualEntryCompanyList = policy?.connections?.dualEntry?.data?.companies;
        const campfireSubsidiaryList = policy?.connections?.campfire?.data?.subsidiaries;
        const businessCentralCompanyList = policy?.connections?.businessCentral?.data?.companies;
        const certiniaConfig = policy?.connections?.financialforce?.config;
        const certiniaCompanies = policy?.connections?.financialforce?.data?.companies ?? [];
        const certiniaCompanyID = getCertiniaSelectedCompanyID(certiniaConfig);
        const certiniaCompanyField = certiniaConfig?.hasPSA ? CONST.CERTINIA_CONFIG.COMPANY_ID : CONST.CERTINIA_CONFIG.COMPANY;
        const selectedCertiniaCompany = certiniaCompanies.find((company) => company.id === certiniaCompanyID);
        switch (connectedIntegration) {
            case CONST.POLICY.CONNECTIONS.NAME.XERO:
                return !policy?.connections?.xero?.data?.tenants
                    ? {}
                    : {
                          description: translate('workspace.xero.organization'),
                          iconRight: icons.ArrowRight,
                          title: getCurrentXeroOrganizationName(policy),
                          wrapperStyle: menuItemWrapperStyle,
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: canWriteAccounting && tenants.length > 1,
                          shouldShowDescriptionOnTop: true,
                          interactive: canWriteAccounting,
                          onPress:
                              canWriteAccounting && tenants.length > 1
                                  ? () => {
                                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_ORGANIZATION.getRoute(policyID, currentXeroOrganization?.id));
                                    }
                                  : undefined,
                          pendingAction: settingsPendingAction([CONST.XERO_CONFIG.TENANT_ID], policy?.connections?.xero?.config?.pendingFields),
                          brickRoadIndicator: areSettingsInErrorFields([CONST.XERO_CONFIG.TENANT_ID], policy?.connections?.xero?.config?.errorFields)
                              ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                              : undefined,
                      };
            case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                return !policy?.connections?.netsuite?.options?.config?.subsidiary
                    ? {}
                    : {
                          description: translate('workspace.netsuite.subsidiary'),
                          iconRight: icons.ArrowRight,
                          title: policy?.connections?.netsuite?.options?.config?.subsidiary ?? '',
                          wrapperStyle: menuItemWrapperStyle,
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: canWriteAccounting && netSuiteSubsidiaryList?.length > 1,
                          shouldShowDescriptionOnTop: true,
                          interactive: canWriteAccounting,
                          pendingAction: policy?.connections?.netsuite?.options?.config?.pendingFields?.subsidiary,
                          brickRoadIndicator: policy?.connections?.netsuite?.options?.config?.errorFields?.subsidiary ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                          onPress:
                              canWriteAccounting && netSuiteSubsidiaryList?.length > 1
                                  ? () => {
                                        Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR.getRoute(policyID));
                                    }
                                  : undefined,
                      };
            case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                return !sageIntacctEntityList.length
                    ? {}
                    : {
                          description: translate('workspace.intacct.entity'),
                          iconRight: icons.ArrowRight,
                          title: getCurrentSageIntacctEntityName(policy, translate('workspace.common.topLevel')),
                          wrapperStyle: menuItemWrapperStyle,
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: canWriteAccounting,
                          shouldShowDescriptionOnTop: true,
                          interactive: canWriteAccounting,
                          pendingAction: policy?.connections?.intacct?.config?.pendingFields?.entity,
                          brickRoadIndicator: policy?.connections?.intacct?.config?.errorFields?.entity ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                          onPress: canWriteAccounting ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ENTITY.getRoute(policyID)) : undefined,
                      };
            case CONST.POLICY.CONNECTIONS.NAME.QBO:
                return !policy?.connections?.quickbooksOnline?.config?.companyName
                    ? {}
                    : {
                          description: translate(isConnectedToIntuitEnterpriseSuite ? 'workspace.qbo.entity' : 'workspace.qbo.connectedTo'),
                          iconRight: isConnectedToIntuitEnterpriseSuite ? icons.ArrowRight : undefined,
                          title: policy?.connections?.quickbooksOnline?.config?.companyName,
                          wrapperStyle: menuItemWrapperStyle,
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: isConnectedToIntuitEnterpriseSuite && canWriteAccounting,
                          shouldShowDescriptionOnTop: true,
                          interactive: isConnectedToIntuitEnterpriseSuite && canWriteAccounting,
                          pendingAction: policy?.connections?.quickbooksOnline?.config?.pendingFields?.realmId,
                          brickRoadIndicator: policy?.connections?.quickbooksOnline?.config?.errorFields?.realmId ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                          onPress:
                              isConnectedToIntuitEnterpriseSuite && canWriteAccounting && policyID
                                  ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_INTUIT_ENTERPRISE_SUITE_ENTITY_SELECTOR.getRoute(policyID))
                                  : undefined,
                      };
            case CONST.POLICY.CONNECTIONS.NAME.CERTINIA:
                return !isCertiniaFFAConnection(certiniaConfig)
                    ? {}
                    : {
                          description: translate('workspace.certinia.company'),
                          iconRight: icons.ArrowRight,
                          title: selectedCertiniaCompany?.name ?? certiniaCompanyID ?? translate('common.none'),
                          wrapperStyle: menuItemWrapperStyle,
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: canWriteAccounting,
                          shouldShowDescriptionOnTop: true,
                          interactive: canWriteAccounting,
                          pendingAction: settingsPendingAction([certiniaCompanyField], certiniaConfig?.pendingFields),
                          brickRoadIndicator: areSettingsInErrorFields([certiniaCompanyField], certiniaConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                          onPress: canWriteAccounting ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_COMPANY_SELECTOR.getRoute(policyID)) : undefined,
                      };
            case CONST.POLICY.CONNECTIONS.NAME.RILLET:
                return !rilletSubsidiaryList?.length
                    ? {}
                    : {
                          description: translate('workspace.rillet.subsidiary'),
                          iconRight: icons.ArrowRight,
                          title: rilletSubsidiaryList?.find((subsidiary) => subsidiary.id === policy?.connections?.rillet?.config?.subsidiaryID)?.tradeName ?? '',
                          wrapperStyle: menuItemWrapperStyle,
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: canWriteAccounting && rilletSubsidiaryList && rilletSubsidiaryList.length > 1,
                          shouldShowDescriptionOnTop: true,
                          interactive: canWriteAccounting,
                          pendingAction: policy?.connections?.rillet?.config.pendingFields?.subsidiaryID,
                          brickRoadIndicator: policy?.connections?.rillet?.config.errorFields?.subsidiaryID ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                          onPress:
                              policyID && canWriteAccounting && rilletSubsidiaryList && rilletSubsidiaryList.length > 1
                                  ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_RILLET_SUBSIDIARY_SELECTOR.getRoute(policyID))
                                  : undefined,
                      };
            case CONST.POLICY.CONNECTIONS.NAME.DUALENTRY:
                return !dualEntryCompanyList?.length
                    ? {}
                    : {
                          description: translate('workspace.dualEntry.subsidiary'),
                          iconRight: icons.ArrowRight,
                          title: dualEntryCompanyList?.find((company) => company.id === policy?.connections?.dualEntry?.config?.subsidiaryID)?.name ?? '',
                          wrapperStyle: menuItemWrapperStyle,
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: canWriteAccounting && dualEntryCompanyList && dualEntryCompanyList.length > 1,
                          shouldShowDescriptionOnTop: true,
                          interactive: canWriteAccounting,
                          pendingAction: policy?.connections?.dualEntry?.config.pendingFields?.subsidiaryID,
                          brickRoadIndicator: policy?.connections?.dualEntry?.config.errorFields?.subsidiaryID ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                          onPress:
                              policyID && canWriteAccounting && dualEntryCompanyList && dualEntryCompanyList.length > 1
                                  ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_DUALENTRY_SUBSIDIARY_SELECTOR.getRoute(policyID))
                                  : undefined,
                      };
            case CONST.POLICY.CONNECTIONS.NAME.CAMPFIRE:
                return !campfireSubsidiaryList?.length
                    ? {}
                    : {
                          description: translate('workspace.campfire.subsidiary'),
                          iconRight: icons.ArrowRight,
                          title: campfireSubsidiaryList?.find((subsidiary) => subsidiary.id === policy?.connections?.campfire?.config?.subsidiaryID)?.name ?? '',
                          wrapperStyle: menuItemWrapperStyle,
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: canWriteAccounting && campfireSubsidiaryList && campfireSubsidiaryList.length > 1,
                          shouldShowDescriptionOnTop: true,
                          interactive: canWriteAccounting,
                          pendingAction: policy?.connections?.campfire?.config.pendingFields?.subsidiaryID,
                          brickRoadIndicator: policy?.connections?.campfire?.config.errorFields?.subsidiaryID ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                          onPress:
                              policyID && canWriteAccounting && campfireSubsidiaryList && campfireSubsidiaryList.length > 1
                                  ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CAMPFIRE_SUBSIDIARY_SELECTOR.getRoute(policyID))
                                  : undefined,
                      };
            case CONST.POLICY.CONNECTIONS.NAME.BUSINESS_CENTRAL:
                return !businessCentralCompanyList?.length
                    ? {}
                    : {
                          description: translate('workspace.businessCentral.subsidiary'),
                          iconRight: icons.ArrowRight,
                          title: businessCentralCompanyList.find((company) => company.id === policy?.connections?.businessCentral?.config?.companyID)?.displayName ?? '',
                          wrapperStyle: menuItemWrapperStyle,
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: canWriteAccounting && businessCentralCompanyList.length > 1,
                          shouldShowDescriptionOnTop: true,
                          interactive: canWriteAccounting,
                          pendingAction: policy?.connections?.businessCentral?.config.pendingFields?.companyID,
                          brickRoadIndicator: policy?.connections?.businessCentral?.config.errorFields?.companyID ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                          onPress:
                              policyID && canWriteAccounting && businessCentralCompanyList.length > 1
                                  ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_BUSINESS_CENTRAL_COMPANY_SELECTOR.getRoute(policyID))
                                  : undefined,
                      };

            default:
                return undefined;
        }
    };
    const integrationSpecificMenuItems = getIntegrationSpecificMenuItems();

    const getConnectionDetails = () => {
        if (!connectedIntegration || !policyID) {
            return undefined;
        }
        const isConnectionVerified = !isConnectionUnverified(policy, connectedIntegration);
        const integrationData = getAccountingIntegrationData(connectedIntegration, policyID, translate, existingConnections, {
            policy,
            canUseNetSuiteUSATax: isBetaEnabled(CONST.BETAS.NETSUITE_USA_TAX),
            expensifyIcons: accountingIcons,
            cardFeeds,
            cardList: cardLists,
            isIntuitEnterpriseSuiteOverride: isConnectedToIntuitEnterpriseSuite,
            isUnifiedConnectionsBetaEnabled,
        });
        let connectionMessage;
        if (isSyncInProgress && connectionSyncStage) {
            connectionMessage = translate('workspace.accounting.connections.syncStageName', connectionSyncStage, integrationData?.title);
        } else if (!isConnectionVerified) {
            connectionMessage = translate('workspace.accounting.notSync');
        } else {
            connectionMessage = translate('workspace.accounting.lastSync', datetimeToRelative);
        }

        const configurationOptions = canWriteAccounting
            ? [
                  {
                      icon: icons.Pencil,
                      iconRight: icons.ArrowRight,
                      shouldShowRightIcon: true,
                      title: translate('workspace.accounting.import'),
                      wrapperStyle: menuItemWrapperStyle,
                      onPress: integrationData?.onImportPagePress,
                      brickRoadIndicator: areSettingsInErrorFields(integrationData?.subscribedImportSettings, integrationData?.errorFields)
                          ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                          : undefined,
                      pendingAction: settingsPendingAction(integrationData?.subscribedImportSettings, integrationData?.pendingFields),
                  },
                  {
                      icon: icons.Send,
                      iconRight: icons.ArrowRight,
                      shouldShowRightIcon: true,
                      title: translate('workspace.accounting.export'),
                      wrapperStyle: menuItemWrapperStyle,
                      onPress: integrationData?.onExportPagePress,
                      brickRoadIndicator:
                          areSettingsInErrorFields(integrationData?.subscribedExportSettings, integrationData?.errorFields) ||
                          shouldShowQBOReimbursableExportDestinationAccountError(policy) ||
                          integrationData?.externalSubscribedExportSettingsHasErrorFields
                              ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                              : undefined,
                      pendingAction:
                          settingsPendingAction(integrationData?.subscribedExportSettings, integrationData?.pendingFields) ?? integrationData?.externalSubscribedExportSettingsPendingAction,
                  },
                  ...(shouldShowCardReconciliationOption && integrationData?.onCardReconciliationPagePress
                      ? [
                            {
                                icon: icons.ExpensifyCard,
                                iconRight: icons.ArrowRight,
                                shouldShowRightIcon: true,
                                title: translate('workspace.accounting.cardReconciliation'),
                                wrapperStyle: menuItemWrapperStyle,
                                onPress: integrationData?.onCardReconciliationPagePress,
                            },
                        ]
                      : []),
                  {
                      icon: icons.Gear,
                      iconRight: icons.ArrowRight,
                      shouldShowRightIcon: true,
                      title: translate('workspace.accounting.advanced'),
                      wrapperStyle: menuItemWrapperStyle,
                      onPress: integrationData?.onAdvancedPagePress,
                      brickRoadIndicator: areSettingsInErrorFields(integrationData?.subscribedAdvancedSettings, integrationData?.errorFields)
                          ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                          : undefined,
                      pendingAction: settingsPendingAction(integrationData?.subscribedAdvancedSettings, integrationData?.pendingFields),
                  },
              ]
            : [];

        const settingsMenuItems: MenuItemData[] = [
            ...(isEmptyObject(integrationSpecificMenuItems) || shouldShowSynchronizationError || !hasAccountingConnection ? [] : [integrationSpecificMenuItems]),
            ...(!hasAccountingConnection || !isConnectionVerified ? [] : configurationOptions),
        ];
        return {icon: integrationData?.icon, title: integrationData?.title, connectionMessage, settingsMenuItems};
    };
    const connectionDetails = getConnectionDetails();

    let qboTokenExpiryHint;
    if (qboTokenExpiryDate && canWriteAccounting) {
        const formattedExpiryDate = DateUtils.formatWithUTCTimeZone(qboTokenExpiryDate.toISOString(), CONST.DATE.MONTH_DAY_YEAR_FORMAT, dateFnsLocale);
        qboTokenExpiryHint = (
            <>
                {translate(
                    qboTokenExpiryStatus === CONST.POLICY.CONNECTIONS.QBO_REFRESH_TOKEN_EXPIRY_STATUS.EXPIRED
                        ? 'workspace.accounting.qboConnectionExpired'
                        : 'workspace.accounting.qboConnectionExpiring',
                    {date: formattedExpiryDate},
                )}{' '}
                <TextLink onPress={() => startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.QBO, isIntuitEnterpriseSuite: isConnectedToIntuitEnterpriseSuite})}>
                    {translate('workspace.accounting.reconnect')}
                </TextLink>
            </>
        );
    }

    const oldDotPolicyConnectionsURL = policyID ? `${getOldDotURLFromEnvironment(environment)}/${CONST.OLDDOT_URLS.POLICY_CONNECTIONS_URL_ENCODED(policyID)}` : '';

    return {
        accountingIntegrations,
        connectedIntegration,
        connectedIntegrationDisplayName,
        isConnectedToIntuitEnterpriseSuite,
        isSyncInProgress,
        hasAccountingConnection,
        hasSyncError,
        hasUnsupportedNDIntegration,
        synchronizationError,
        canWriteAccounting,
        showReadOnlyModal,
        overflowMenu,
        connectionDetails,
        qboTokenExpiryHint,
        oldDotPolicyConnectionsURL,
        getAvailableIntegrationData,
    };
}

export default useConnectedAccountingIntegration;
