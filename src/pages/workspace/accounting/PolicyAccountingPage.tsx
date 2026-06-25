import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import CollapsibleSection from '@components/CollapsibleSection';
import ConfirmModal from '@components/ConfirmModal';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import type {MenuItemWithLink} from '@components/MenuItemList';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useEnvironment from '@hooks/useEnvironment';
import useExpensifyCardFeeds from '@hooks/useExpensifyCardFeeds';
import useHasReusablePoliciesConnectedTo from '@hooks/useHasReusablePoliciesConnectedTo';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {isAuthenticationError, isConnectionInProgress, isConnectionUnverified, removePolicyConnection, syncConnection} from '@libs/actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {isExpensifyCardFullySetUp} from '@libs/CardUtils';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import getPlatform from '@libs/getPlatform';
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
    isControlPolicy,
    settingsPendingAction,
    shouldShowSyncError,
} from '@libs/PolicyUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {openOldDotLink} from '@userActions/Link';
import {openPolicyExpensifyCardsPage} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {AccountingContextProvider, useAccountingActions, useAccountingState} from './AccountingContext';
import {isCertiniaSRPConnection} from './certinia/utils';
import type {MenuItemData, PolicyAccountingPageProps} from './types';
import {getAccountingIntegrationData, getSynchronizationErrorMessage} from './utils';

type RouteParams = {
    newConnectionName?: ConnectionName;
    integrationToDisconnect?: ConnectionName;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
};

function PolicyAccountingPage({policy}: PolicyAccountingPageProps) {
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.accounting');
    const hasReusablePoliciesConnectedToSageIntacct = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT, policy?.id);
    const hasReusablePoliciesConnectedToQBD = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.QBD, policy?.id);
    const hasReusablePoliciesConnectedToCertinia = useHasReusablePoliciesConnectedTo(CONST.POLICY.CONNECTIONS.NAME.CERTINIA, policy?.id);
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, datetimeToRelative: getDatetimeToRelative, getLocalDateFromDatetime} = useLocalize();
    const {environment} = useEnvironment();
    const oldDotEnvironmentURL = getOldDotURLFromEnvironment(environment);
    const {isOffline} = useNetwork();
    const {isBetaEnabled} = usePermissions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const [datetimeToRelative, setDateTimeToRelative] = useState('');
    const {popoverAnchorRefs} = useAccountingState();
    const {startIntegrationFlow} = useAccountingActions();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const {isLargeScreenWidth} = useResponsiveLayout();
    const route = useRoute();
    const params = route.params as RouteParams | undefined;
    const newConnectionName = params?.newConnectionName;
    const integrationToDisconnect = params?.integrationToDisconnect;
    const shouldDisconnectIntegrationBeforeConnecting = params?.shouldDisconnectIntegrationBeforeConnecting;
    const policyID = policy?.id;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const allCardSettings = useExpensifyCardFeeds(policyID);
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'CircularArrowBackwards', 'ExpensifyCard', 'Gear', 'Key', 'NewWindow', 'Pencil', 'QuestionMark', 'Send', 'Sync', 'Trashcan']);
    const accountingIcons = useMemoizedLazyExpensifyIcons(['IntacctSquare', 'QBOSquare', 'XeroSquare', 'NetSuiteSquare', 'QBDSquare', 'CertiniaSquare']);
    const illustrations = useMemoizedLazyIllustrations(['Accounting']);

    const canUseCertiniaIntegration = isBetaEnabled(CONST.BETAS.CERTINIA) || !!policy?.connections?.financialforce;
    const accountingIntegrations = useMemo(
        () => CONST.POLICY.CONNECTIONS.ACCOUNTING_CONNECTION_NAMES.filter((name) => name !== CONST.POLICY.CONNECTIONS.NAME.CERTINIA || canUseCertiniaIntegration),
        [canUseCertiniaIntegration],
    );
    const syncingAccountingIntegration = accountingIntegrations.find((integration) => integration === connectionSyncProgress?.connectionName);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? syncingAccountingIntegration;
    const hasAccountingConnection = hasAccountingConnections(policy);
    const {canWrite: canWriteAccounting, showReadOnlyModal} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.ACCOUNTING);
    const synchronizationError = connectedIntegration && getSynchronizationErrorMessage(policy, connectedIntegration, isSyncInProgress, translate, styles);

    const isSageIntacct = connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT;
    const hasAuthError = !!connectedIntegration && !!synchronizationError && isAuthenticationError(policy, connectedIntegration);
    const shouldShowEnterCredentials = !!connectedIntegration && (hasAuthError || isSageIntacct);

    // Get the last successful date of the integration. Then, if `connectionSyncProgress` is the same integration displayed and the state is 'jobDone', get the more recent update time of the two.
    const successfulDate = getIntegrationLastSuccessfulDate(
        getLocalDateFromDatetime,
        connectedIntegration ? policy?.connections?.[connectedIntegration] : undefined,
        connectedIntegration === connectionSyncProgress?.connectionName ? connectionSyncProgress : undefined,
    );

    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress, accountingIntegrations);
    const hasUnsupportedNDIntegration = !isEmptyObject(policy?.connections) && hasSupportedOnlyOnOldDotIntegration(policy) && !canUseCertiniaIntegration;

    const tenants = useMemo(() => getXeroTenants(policy), [policy]);
    const currentXeroOrganization = findCurrentXeroOrganization(tenants, policy?.connections?.xero?.config?.tenantID);
    const shouldShowSynchronizationError = !!synchronizationError;
    const shouldShowReinstallConnectorMenuItem = shouldShowSynchronizationError && connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.QBD;
    const shouldShowCardReconciliationOption = Object.values(allCardSettings ?? {})?.some((cardSetting) => isExpensifyCardFullySetUp(policy, cardSetting));
    const shouldShowReconnect = hasAuthError && connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.CERTINIA;
    let credentialsMenuTextKey: Parameters<typeof translate>[0] = 'workspace.accounting.enterCredentials';
    if (shouldShowReconnect) {
        credentialsMenuTextKey = 'workspace.accounting.reconnect';
    } else if (isSageIntacct && !hasAuthError) {
        credentialsMenuTextKey = 'workspace.accounting.updateCredentials';
    }

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
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
                              startIntegrationFlow({name: connectedIntegration});
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
                onSelected: () => setIsDisconnectModalOpen(true),
                shouldCallAfterModalHide: true,
            },
        ],
        [
            icons.NewWindow,
            icons.CircularArrowBackwards,
            icons.Key,
            icons.Sync,
            icons.Trashcan,
            shouldShowEnterCredentials,
            shouldShowReinstallConnectorMenuItem,
            translate,
            isOffline,
            policy,
            connectedIntegration,
            startIntegrationFlow,
            isSageIntacct,
            hasAuthError,
            credentialsMenuTextKey,
            policyID,
        ],
    );

    useFocusEffect(
        useCallback(() => {
            if (!newConnectionName || !isControlPolicy(policy) || !canWriteAccounting) {
                return;
            }

            startIntegrationFlow({
                name: newConnectionName,
                integrationToDisconnect,
                shouldDisconnectIntegrationBeforeConnecting,
            });
        }, [newConnectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting, policy, startIntegrationFlow, canWriteAccounting]),
    );

    useEffect(() => {
        if (successfulDate) {
            setDateTimeToRelative(getDatetimeToRelative(successfulDate));
            return;
        }
        setDateTimeToRelative('');
    }, [getDatetimeToRelative, successfulDate]);

    useEffect(() => {
        if (!policyID || !policy?.areExpensifyCardsEnabled || !workspaceAccountID) {
            return;
        }
        openPolicyExpensifyCardsPage(policyID, workspaceAccountID);
    }, [policyID, policy?.areExpensifyCardsEnabled, workspaceAccountID]);

    const integrationSpecificMenuItems = useMemo(() => {
        const sageIntacctEntityList = policy?.connections?.intacct?.data?.entities ?? [];
        const netSuiteSubsidiaryList = policy?.connections?.netsuite?.options?.data?.subsidiaryList ?? [];
        const certiniaConfig = policy?.connections?.financialforce?.config;
        const certiniaCompanies = policy?.connections?.financialforce?.data?.companies ?? [];
        const certiniaCompanyID = certiniaConfig?.credentials?.companyID;
        const selectedCertiniaCompany = certiniaCompanies.find((company) => company.id === certiniaCompanyID);
        switch (connectedIntegration) {
            case CONST.POLICY.CONNECTIONS.NAME.XERO:
                return !policy?.connections?.xero?.data?.tenants
                    ? {}
                    : {
                          description: translate('workspace.xero.organization'),
                          iconRight: icons.ArrowRight,
                          title: getCurrentXeroOrganizationName(policy),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
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
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
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
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
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
                          description: translate('workspace.qbo.connectedTo'),
                          title: policy?.connections?.quickbooksOnline?.config?.companyName,
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          titleStyle: styles.fontWeightNormal,
                          shouldShowDescriptionOnTop: true,
                          interactive: false,
                      };
            case CONST.POLICY.CONNECTIONS.NAME.CERTINIA:
                return !isCertiniaSRPConnection(certiniaConfig)
                    ? {}
                    : {
                          description: translate('workspace.certinia.company'),
                          iconRight: icons.ArrowRight,
                          title: selectedCertiniaCompany?.name ?? certiniaCompanyID ?? translate('common.none'),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: canWriteAccounting,
                          shouldShowDescriptionOnTop: true,
                          interactive: canWriteAccounting,
                          pendingAction: settingsPendingAction([CONST.CERTINIA_CONFIG.COMPANY_ID], certiniaConfig?.pendingFields),
                          brickRoadIndicator: areSettingsInErrorFields([CONST.CERTINIA_CONFIG.COMPANY_ID], certiniaConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                          onPress: canWriteAccounting ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CERTINIA_COMPANY_SELECTOR.getRoute(policyID)) : undefined,
                      };

            default:
                return undefined;
        }
    }, [
        canWriteAccounting,
        connectedIntegration,
        currentXeroOrganization?.id,
        policy,
        policyID,
        styles.fontWeightNormal,
        styles.sectionMenuItemTopDescription,
        tenants.length,
        translate,
        icons.ArrowRight,
    ]);

    const connectionsMenuItems: MenuItemData[] = useMemo(() => {
        if (!hasAccountingConnection && !isSyncInProgress && policyID) {
            return accountingIntegrations
                .map((integration) => {
                    const integrationData = getAccountingIntegrationData(
                        integration,
                        policyID,
                        translate,
                        {sageIntacct: hasReusablePoliciesConnectedToSageIntacct, qbd: hasReusablePoliciesConnectedToQBD, certinia: hasReusablePoliciesConnectedToCertinia},
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        accountingIcons,
                    );
                    if (!integrationData) {
                        return undefined;
                    }

                    const isXero = integration === CONST.POLICY.CONNECTIONS.NAME.XERO;
                    const iconProps = integrationData?.icon
                        ? {
                              icon: integrationData.icon,
                              iconType: CONST.ICON_TYPE_AVATAR,
                          }
                        : {};

                    return {
                        ...iconProps,
                        interactive: false,
                        // On native iOS, `accessible={true}` collapses the row and all its descendants into a single accessibility element,
                        // so VoiceOver focuses the whole row instead of the nested Connect button. Disabling it only on native iOS lets
                        // VoiceOver focus/activate the button on its own. Other platforms (Android/TalkBack, web, iOS mWeb→WEB) keep grouping.
                        shouldBeAccessible: getPlatform() !== CONST.PLATFORM.IOS,
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        shouldShowRightComponent: true,
                        title: integrationData?.title,
                        badgeText: isXero ? translate('workspace.accounting.claimOffer.badgeText') : undefined,
                        onBadgePress:
                            isXero && canWriteAccounting
                                ? () => {
                                      Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CLAIM_OFFER.getRoute(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO));
                                  }
                                : undefined,
                        badgeStyle: styles.mr3,
                        isBadgeSuccess: isXero,
                        shouldShowBadgeBelow: shouldUseNarrowLayout,
                        rightComponent: (
                            <Button
                                onPress={() => {
                                    if (!canWriteAccounting) {
                                        showReadOnlyModal();
                                        return;
                                    }
                                    startIntegrationFlow({name: integration});
                                }}
                                text={translate('workspace.accounting.setup')}
                                style={styles.justifyContentCenter}
                                innerStyles={!canWriteAccounting ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                                hoverStyles={!canWriteAccounting ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                                small
                                isDisabled={isOffline}
                                ref={(ref) => {
                                    if (!popoverAnchorRefs?.current) {
                                        return;
                                    }
                                    popoverAnchorRefs.current[integration].current = ref;
                                }}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.SETUP_BUTTON}
                            />
                        ),
                    };
                })
                .filter(Boolean) as MenuItemData[];
        }

        if (!connectedIntegration || !policyID) {
            return [];
        }
        const isConnectionVerified = !isConnectionUnverified(policy, connectedIntegration);
        const integrationData = getAccountingIntegrationData(
            connectedIntegration,
            policyID,
            translate,
            {sageIntacct: hasReusablePoliciesConnectedToSageIntacct, qbd: hasReusablePoliciesConnectedToQBD, certinia: hasReusablePoliciesConnectedToCertinia},
            policy,
            undefined,
            undefined,
            undefined,
            isBetaEnabled(CONST.BETAS.NETSUITE_USA_TAX),
            accountingIcons,
        );
        const iconProps = integrationData?.icon ? {icon: integrationData.icon, iconType: CONST.ICON_TYPE_AVATAR} : {};

        let connectionMessage;
        if (isSyncInProgress && connectionSyncProgress?.stageInProgress) {
            connectionMessage = translate('workspace.accounting.connections.syncStageName', {stage: connectionSyncProgress?.stageInProgress});
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
                      wrapperStyle: [styles.sectionMenuItemTopDescription],
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
                      wrapperStyle: [styles.sectionMenuItemTopDescription],
                      onPress: integrationData?.onExportPagePress,
                      brickRoadIndicator:
                          areSettingsInErrorFields(integrationData?.subscribedExportSettings, integrationData?.errorFields) || shouldShowQBOReimbursableExportDestinationAccountError(policy)
                              ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                              : undefined,
                      pendingAction: settingsPendingAction(integrationData?.subscribedExportSettings, integrationData?.pendingFields),
                  },
                  ...(shouldShowCardReconciliationOption && integrationData?.onCardReconciliationPagePress
                      ? [
                            {
                                icon: icons.ExpensifyCard,
                                iconRight: icons.ArrowRight,
                                shouldShowRightIcon: true,
                                title: translate('workspace.accounting.cardReconciliation'),
                                wrapperStyle: [styles.sectionMenuItemTopDescription],
                                onPress: integrationData?.onCardReconciliationPagePress,
                            },
                        ]
                      : []),
                  {
                      icon: icons.Gear,
                      iconRight: icons.ArrowRight,
                      shouldShowRightIcon: true,
                      title: translate('workspace.accounting.advanced'),
                      wrapperStyle: [styles.sectionMenuItemTopDescription],
                      onPress: integrationData?.onAdvancedPagePress,
                      brickRoadIndicator: areSettingsInErrorFields(integrationData?.subscribedAdvancedSettings, integrationData?.errorFields)
                          ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                          : undefined,
                      pendingAction: settingsPendingAction(integrationData?.subscribedAdvancedSettings, integrationData?.pendingFields),
                  },
              ]
            : [];

        const syncActivityReasonAttributes: SkeletonSpanReasonAttributes = {
            context: 'PolicyAccountingPage.connectionsMenuItems',
            isSyncInProgress,
        };
        let rightComponent;
        if (isSyncInProgress) {
            rightComponent = (
                <ActivityIndicator
                    style={[styles.popoverMenuIcon]}
                    reasonAttributes={syncActivityReasonAttributes}
                />
            );
        } else if (canWriteAccounting) {
            rightComponent = (
                <ThreeDotsMenu
                    shouldSelfPosition
                    menuItems={overflowMenu}
                    anchorAlignment={{
                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                    }}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.THREE_DOT_MENU}
                />
            );
        }

        return [
            {
                ...iconProps,
                interactive: false,
                wrapperStyle: [styles.sectionMenuItemTopDescription, shouldShowSynchronizationError && styles.pb0],
                shouldShowRightComponent: true,
                title: integrationData?.title,
                errorText: synchronizationError,
                errorTextStyle: [styles.mt5],
                shouldShowRedDotIndicator: true,
                description: connectionMessage,
                rightComponent,
            },
            ...(isEmptyObject(integrationSpecificMenuItems) || shouldShowSynchronizationError || !hasAccountingConnection ? [] : [integrationSpecificMenuItems]),
            ...(!hasAccountingConnection || !isConnectionVerified ? [] : configurationOptions),
        ];
    }, [
        policy,
        hasAccountingConnection,
        isSyncInProgress,
        policyID,
        connectedIntegration,
        translate,
        isBetaEnabled,
        accountingIcons,
        connectionSyncProgress?.stageInProgress,
        icons.Pencil,
        icons.ArrowRight,
        icons.ExpensifyCard,
        icons.Gear,
        icons.Send,
        styles.sectionMenuItemTopDescription,
        styles.pb0,
        styles.mt5,
        styles.popoverMenuIcon,
        styles.mr3,
        styles.justifyContentCenter,
        styles.buttonOpacityDisabled,
        styles.buttonDisabled,
        shouldShowCardReconciliationOption,
        shouldShowSynchronizationError,
        synchronizationError,
        overflowMenu,
        integrationSpecificMenuItems,
        accountingIntegrations,
        shouldUseNarrowLayout,
        isOffline,
        startIntegrationFlow,
        popoverAnchorRefs,
        datetimeToRelative,
        hasReusablePoliciesConnectedToSageIntacct,
        hasReusablePoliciesConnectedToCertinia,
        hasReusablePoliciesConnectedToQBD,
        canWriteAccounting,
        showReadOnlyModal,
    ]);

    const otherIntegrationsItems = useMemo(() => {
        if ((!hasAccountingConnection && !isSyncInProgress) || !policyID) {
            return;
        }
        const otherIntegrations = accountingIntegrations.filter(
            (integration) => (isSyncInProgress && integration !== connectionSyncProgress?.connectionName) || integration !== connectedIntegration,
        );
        return otherIntegrations
            .map((integration) => {
                const integrationData = getAccountingIntegrationData(
                    integration,
                    policyID,
                    translate,
                    {sageIntacct: hasReusablePoliciesConnectedToSageIntacct, qbd: hasReusablePoliciesConnectedToQBD, certinia: hasReusablePoliciesConnectedToCertinia},
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    accountingIcons,
                );
                if (!integrationData) {
                    return undefined;
                }

                const iconProps = integrationData?.icon ? {icon: integrationData.icon, iconType: CONST.ICON_TYPE_AVATAR} : {};

                return {
                    ...iconProps,
                    title: integrationData?.title,
                    rightComponent: (
                        <Button
                            onPress={() => {
                                if (!canWriteAccounting) {
                                    showReadOnlyModal();
                                    return;
                                }
                                startIntegrationFlow({
                                    name: integration,
                                    integrationToDisconnect: connectedIntegration,
                                    shouldDisconnectIntegrationBeforeConnecting: true,
                                });
                            }}
                            text={translate('workspace.accounting.setup')}
                            style={styles.justifyContentCenter}
                            innerStyles={!canWriteAccounting ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                            hoverStyles={!canWriteAccounting ? [styles.buttonOpacityDisabled, styles.buttonDisabled] : undefined}
                            small
                            isDisabled={isOffline}
                            ref={(r) => {
                                if (!popoverAnchorRefs?.current) {
                                    return;
                                }
                                popoverAnchorRefs.current[integration].current = r;
                            }}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.ACCOUNTING.SETUP_BUTTON}
                        />
                    ),
                    interactive: false,
                    // On native iOS, `accessible={true}` collapses the row and all its descendants into a single accessibility element,
                    // so VoiceOver focuses the whole row instead of the nested Connect button. Disabling it only on native iOS lets
                    // VoiceOver focus/activate the button on its own. Other platforms (Android/TalkBack, web, iOS mWeb→WEB) keep grouping.
                    shouldBeAccessible: getPlatform() !== CONST.PLATFORM.IOS,
                    shouldShowRightComponent: true,
                    wrapperStyle: styles.sectionMenuItemTopDescription,
                };
            })
            .filter(Boolean) as MenuItemWithLink[];
    }, [
        hasAccountingConnection,
        isSyncInProgress,
        accountingIntegrations,
        connectionSyncProgress?.connectionName,
        connectedIntegration,
        policyID,
        translate,
        hasReusablePoliciesConnectedToSageIntacct,
        hasReusablePoliciesConnectedToCertinia,
        hasReusablePoliciesConnectedToQBD,
        styles.justifyContentCenter,
        styles.buttonOpacityDisabled,
        styles.buttonDisabled,
        styles.sectionMenuItemTopDescription,
        isOffline,
        startIntegrationFlow,
        popoverAnchorRefs,
        accountingIcons,
        canWriteAccounting,
        showReadOnlyModal,
    ]);

    const [chatTextLink, chatReportID] = useMemo(() => {
        // If they have an onboarding specialist assigned display the following and link to the #admins room with the account executive.
        if (policy?.chatReportIDAdmins) {
            return [translate('workspace.accounting.talkYourOnboardingSpecialist'), policy?.chatReportIDAdmins?.toString()];
        }

        // If not, if they have an account manager assigned display the following and link to the DM with their account manager.
        if (account?.accountManagerAccountID) {
            return [translate('workspace.accounting.talkYourAccountManager'), account?.accountManagerReportID];
        }
        // Else, display the following and link to their Concierge DM.
        return [translate('workspace.accounting.talkToConcierge'), conciergeReportID];
    }, [account?.accountManagerAccountID, account?.accountManagerReportID, conciergeReportID, policy?.chatReportIDAdmins, translate]);

    const oldDotPolicyConnectionsURL = policyID ? `${oldDotEnvironmentURL}/${CONST.OLDDOT_URLS.POLICY_CONNECTIONS_URL_ENCODED(policyID)}` : '';

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.ACCOUNTING}
        >
            <ScreenWrapper
                testID="PolicyAccountingPage"
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.accounting')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    icon={illustrations.Accounting}
                    shouldUseHeadlineHeader
                    shouldDisplayHelpButton
                    onBackButtonPress={Navigation.goBack}
                />
                <ScrollView
                    contentContainerStyle={styles.pt3}
                    addBottomSafeAreaPadding
                >
                    <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section
                            title={translate('workspace.accounting.title')}
                            subtitle={translate('workspace.accounting.subtitle')}
                            isCentralPane
                            subtitleMuted
                            titleStyles={styles.accountSettingsSectionTitle}
                            childrenStyles={styles.pt5}
                        >
                            {!hasUnsupportedNDIntegration &&
                                connectionsMenuItems.map((menuItem) => (
                                    <OfflineWithFeedback
                                        pendingAction={menuItem.pendingAction}
                                        key={menuItem.title}
                                        shouldDisableStrikeThrough
                                    >
                                        <MenuItem
                                            brickRoadIndicator={menuItem.brickRoadIndicator}
                                            key={menuItem.title}
                                            {...menuItem}
                                        />
                                    </OfflineWithFeedback>
                                ))}
                            {hasUnsupportedNDIntegration && hasSyncError && !!policyID && (
                                <FormHelpMessage
                                    isError
                                    style={styles.menuItemError}
                                    message={translate('workspace.accounting.errorODIntegration', oldDotPolicyConnectionsURL)}
                                    shouldRenderMessageAsHTML
                                />
                            )}
                            {hasUnsupportedNDIntegration && !hasSyncError && !!policyID && (
                                <FormHelpMessage shouldShowRedDotIndicator={false}>
                                    <Text>
                                        <TextLink
                                            onPress={() => {
                                                // Go to Expensify Classic.
                                                openOldDotLink(CONST.OLDDOT_URLS.POLICY_CONNECTIONS_URL(policyID));
                                            }}
                                        >
                                            {translate('workspace.accounting.goToODToSettings')}
                                        </TextLink>
                                    </Text>
                                </FormHelpMessage>
                            )}
                            {!!otherIntegrationsItems && (
                                <CollapsibleSection
                                    title={translate('workspace.accounting.other')}
                                    wrapperStyle={[styles.pr3, styles.mt5, styles.pv3]}
                                    titleStyle={[styles.textNormal, styles.colorMuted]}
                                    textStyle={[styles.flex1, styles.userSelectNone, styles.textNormal, styles.colorMuted]}
                                >
                                    <MenuItemList
                                        menuItems={otherIntegrationsItems}
                                        shouldUseSingleExecution
                                    />
                                </CollapsibleSection>
                            )}
                            {!!account?.guideDetails?.email && !hasAccountingConnections(policy) && canWriteAccounting && (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt7]}>
                                    <Icon
                                        src={icons.QuestionMark}
                                        width={20}
                                        height={20}
                                        fill={theme.icon}
                                        additionalStyles={styles.mr3}
                                    />
                                    <View style={[!isLargeScreenWidth ? styles.flexColumn : styles.flexRow]}>
                                        <Text style={styles.textSupporting}>{translate('workspace.accounting.needAnotherAccounting')}</Text>
                                        <TextLink onPress={() => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(String(chatReportID)))}>{chatTextLink}</TextLink>
                                    </View>
                                </View>
                            )}
                        </Section>
                    </View>
                </ScrollView>
                <ConfirmModal
                    title={translate('workspace.accounting.disconnectTitle', {connectionName: connectedIntegration})}
                    isVisible={isDisconnectModalOpen}
                    onConfirm={() => {
                        if (connectedIntegration && policyID) {
                            removePolicyConnection(policy, connectedIntegration);
                        }
                        setIsDisconnectModalOpen(false);
                    }}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.accounting.disconnectPrompt', {connectionName: connectedIntegration})}
                    confirmText={translate('workspace.accounting.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

function PolicyAccountingPageWrapper(props: PolicyAccountingPageProps) {
    return (
        <AccountingContextProvider policy={props.policy}>
            <PolicyAccountingPage {...props} />
        </AccountingContextProvider>
    );
}

export default withPolicyConnections(PolicyAccountingPageWrapper);
