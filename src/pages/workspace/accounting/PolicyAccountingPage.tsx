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
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
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
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isAuthenticationError, isConnectionInProgress, isConnectionUnverified, removePolicyConnection, syncConnection} from '@libs/actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import {isExpensifyCardFullySetUp} from '@libs/CardUtils';
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
    isControlPolicy,
    settingsPendingAction,
    shouldShowSyncError,
} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import {openOldDotLink} from '@userActions/Link';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {ConnectionName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {AccountingContextProvider, useAccountingContext} from './AccountingContext';
import type {MenuItemData, PolicyAccountingPageProps} from './types';
import {getAccountingIntegrationData, getSynchronizationErrorMessage} from './utils';

type RouteParams = {
    newConnectionName?: ConnectionName;
    integrationToDisconnect?: ConnectionName;
    shouldDisconnectIntegrationBeforeConnecting?: boolean;
};

function PolicyAccountingPage({policy}: PolicyAccountingPageProps) {
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`, {canBeMissing: true});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
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
    const {startIntegrationFlow, popoverAnchorRefs} = useAccountingContext();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const {isLargeScreenWidth} = useResponsiveLayout();
    const route = useRoute();
    const params = route.params as RouteParams | undefined;
    const newConnectionName = params?.newConnectionName;
    const integrationToDisconnect = params?.integrationToDisconnect;
    const shouldDisconnectIntegrationBeforeConnecting = params?.shouldDisconnectIntegrationBeforeConnecting;
    const policyID = policy?.id;
    const allCardSettings = useExpensifyCardFeeds(policyID);
    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'NewWindow', 'ExpensifyCard'] as const);
    const illustrations = useMemoizedLazyIllustrations(['Accounting'] as const);

    const connectionNames = CONST.POLICY.CONNECTIONS.NAME;
    const accountingIntegrations = Object.values(connectionNames);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? connectionSyncProgress?.connectionName;
    const synchronizationError = connectedIntegration && getSynchronizationErrorMessage(policy, connectedIntegration, isSyncInProgress, translate, styles);

    const shouldShowEnterCredentials = connectedIntegration && !!synchronizationError && isAuthenticationError(policy, connectedIntegration);

    // Get the last successful date of the integration. Then, if `connectionSyncProgress` is the same integration displayed and the state is 'jobDone', get the more recent update time of the two.
    const successfulDate = getIntegrationLastSuccessfulDate(
        getLocalDateFromDatetime,
        connectedIntegration ? policy?.connections?.[connectedIntegration] : undefined,
        connectedIntegration === connectionSyncProgress?.connectionName ? connectionSyncProgress : undefined,
    );

    const hasSyncError = shouldShowSyncError(policy, isSyncInProgress);
    const hasUnsupportedNDIntegration = !isEmptyObject(policy?.connections) && hasSupportedOnlyOnOldDotIntegration(policy);

    const tenants = useMemo(() => getXeroTenants(policy), [policy]);
    const currentXeroOrganization = findCurrentXeroOrganization(tenants, policy?.connections?.xero?.config?.tenantID);
    const shouldShowSynchronizationError = !!synchronizationError;
    const shouldShowReinstallConnectorMenuItem = shouldShowSynchronizationError && connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.QBD;
    const shouldShowCardReconciliationOption = Object.values(allCardSettings ?? {})?.some((cardSetting) => isExpensifyCardFullySetUp(policy, cardSetting));
    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            ...(shouldShowReinstallConnectorMenuItem
                ? [
                      {
                          icon: Expensicons.CircularArrowBackwards,
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
                          icon: Expensicons.Key,
                          text: translate('workspace.accounting.enterCredentials'),
                          onSelected: () => startIntegrationFlow({name: connectedIntegration}),
                          shouldCallAfterModalHide: true,
                          disabled: isOffline,
                          iconRight: icons.NewWindow,
                      },
                  ]
                : [
                      {
                          icon: Expensicons.Sync,
                          text: translate('workspace.accounting.syncNow'),
                          onSelected: () => syncConnection(policy, connectedIntegration),
                          disabled: isOffline,
                      },
                  ]),
            {
                icon: Expensicons.Trashcan,
                text: translate('workspace.accounting.disconnect'),
                onSelected: () => setIsDisconnectModalOpen(true),
                shouldCallAfterModalHide: true,
            },
        ],
        [icons.NewWindow, shouldShowEnterCredentials, shouldShowReinstallConnectorMenuItem, translate, isOffline, policy, connectedIntegration, startIntegrationFlow],
    );

    useFocusEffect(
        useCallback(() => {
            if (!newConnectionName || !isControlPolicy(policy)) {
                return;
            }

            startIntegrationFlow({
                name: newConnectionName,
                integrationToDisconnect,
                shouldDisconnectIntegrationBeforeConnecting,
            });
        }, [newConnectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting, policy, startIntegrationFlow]),
    );

    useEffect(() => {
        if (successfulDate) {
            setDateTimeToRelative(getDatetimeToRelative(successfulDate));
            return;
        }
        setDateTimeToRelative('');
    }, [getDatetimeToRelative, successfulDate]);

    const integrationSpecificMenuItems = useMemo(() => {
        const sageIntacctEntityList = policy?.connections?.intacct?.data?.entities ?? [];
        const netSuiteSubsidiaryList = policy?.connections?.netsuite?.options?.data?.subsidiaryList ?? [];
        switch (connectedIntegration) {
            case CONST.POLICY.CONNECTIONS.NAME.XERO:
                return !policy?.connections?.xero?.data?.tenants
                    ? {}
                    : {
                          description: translate('workspace.xero.organization'),
                          iconRight: Expensicons.ArrowRight,
                          title: getCurrentXeroOrganizationName(policy),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: tenants.length > 1,
                          shouldShowDescriptionOnTop: true,
                          onPress: () => {
                              if (!(tenants.length > 1)) {
                                  return;
                              }
                              Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_ORGANIZATION.getRoute(policyID, currentXeroOrganization?.id));
                          },
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
                          iconRight: Expensicons.ArrowRight,
                          title: policy?.connections?.netsuite?.options?.config?.subsidiary ?? '',
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: netSuiteSubsidiaryList?.length > 1,
                          shouldShowDescriptionOnTop: true,
                          pendingAction: policy?.connections?.netsuite?.options?.config?.pendingFields?.subsidiary,
                          brickRoadIndicator: policy?.connections?.netsuite?.options?.config?.errorFields?.subsidiary ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                          onPress: () => {
                              if (!(netSuiteSubsidiaryList?.length > 1)) {
                                  return;
                              }
                              Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR.getRoute(policyID));
                          },
                      };
            case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                return !sageIntacctEntityList.length
                    ? {}
                    : {
                          description: translate('workspace.intacct.entity'),
                          iconRight: Expensicons.ArrowRight,
                          title: getCurrentSageIntacctEntityName(policy, translate('workspace.common.topLevel')),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: true,
                          shouldShowDescriptionOnTop: true,
                          pendingAction: policy?.connections?.intacct?.config?.pendingFields?.entity,
                          brickRoadIndicator: policy?.connections?.intacct?.config?.errorFields?.entity ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                          onPress: () => {
                              if (!sageIntacctEntityList.length) {
                                  return;
                              }
                              Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ENTITY.getRoute(policyID));
                          },
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

            default:
                return undefined;
        }
    }, [connectedIntegration, currentXeroOrganization?.id, policy, policyID, styles.fontWeightNormal, styles.sectionMenuItemTopDescription, tenants.length, translate]);

    const connectionsMenuItems: MenuItemData[] = useMemo(() => {
        if (isEmptyObject(policy?.connections) && !isSyncInProgress && policyID) {
            return accountingIntegrations
                .map((integration) => {
                    const integrationData = getAccountingIntegrationData(integration, policyID, translate);
                    if (!integrationData) {
                        return undefined;
                    }

                    const iconProps = integrationData?.icon
                        ? {
                              icon: integrationData.icon,
                              iconType: CONST.ICON_TYPE_AVATAR,
                          }
                        : {};

                    return {
                        ...iconProps,
                        interactive: false,
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        shouldShowRightComponent: true,
                        title: integrationData?.title,
                        rightComponent: (
                            <Button
                                onPress={() => startIntegrationFlow({name: integration})}
                                text={translate('workspace.accounting.setup')}
                                style={styles.justifyContentCenter}
                                small
                                isDisabled={isOffline}
                                ref={(ref) => {
                                    if (!popoverAnchorRefs?.current) {
                                        return;
                                    }
                                    // eslint-disable-next-line react-compiler/react-compiler
                                    popoverAnchorRefs.current[integration].current = ref;
                                }}
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
        const integrationData = getAccountingIntegrationData(connectedIntegration, policyID, translate, policy, undefined, undefined, undefined, isBetaEnabled(CONST.BETAS.NETSUITE_USA_TAX));
        const iconProps = integrationData?.icon ? {icon: integrationData.icon, iconType: CONST.ICON_TYPE_AVATAR} : {};

        let connectionMessage;
        if (isSyncInProgress && connectionSyncProgress?.stageInProgress) {
            connectionMessage = translate('workspace.accounting.connections.syncStageName', {stage: connectionSyncProgress?.stageInProgress});
        } else if (!isConnectionVerified) {
            connectionMessage = translate('workspace.accounting.notSync');
        } else {
            connectionMessage = translate('workspace.accounting.lastSync', {relativeDate: datetimeToRelative});
        }

        const configurationOptions = [
            {
                icon: Expensicons.Pencil,
                iconRight: Expensicons.ArrowRight,
                shouldShowRightIcon: true,
                title: translate('workspace.accounting.import'),
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                onPress: integrationData?.onImportPagePress,
                brickRoadIndicator: areSettingsInErrorFields(integrationData?.subscribedImportSettings, integrationData?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                pendingAction: settingsPendingAction(integrationData?.subscribedImportSettings, integrationData?.pendingFields),
            },
            {
                icon: Expensicons.Send,
                iconRight: Expensicons.ArrowRight,
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
            ...(shouldShowCardReconciliationOption
                ? [
                      {
                          icon: icons.ExpensifyCard,
                          iconRight: Expensicons.ArrowRight,
                          shouldShowRightIcon: true,
                          title: translate('workspace.accounting.cardReconciliation'),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          onPress: integrationData?.onCardReconciliationPagePress,
                      },
                  ]
                : []),
            {
                icon: icons.Gear,
                iconRight: Expensicons.ArrowRight,
                shouldShowRightIcon: true,
                title: translate('workspace.accounting.advanced'),
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                onPress: integrationData?.onAdvancedPagePress,
                brickRoadIndicator: areSettingsInErrorFields(integrationData?.subscribedAdvancedSettings, integrationData?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                pendingAction: settingsPendingAction(integrationData?.subscribedAdvancedSettings, integrationData?.pendingFields),
            },
        ];

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
                rightComponent: isSyncInProgress ? (
                    <ActivityIndicator style={[styles.popoverMenuIcon]} />
                ) : (
                    <ThreeDotsMenu
                        shouldSelfPosition
                        menuItems={overflowMenu}
                        anchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                        }}
                    />
                ),
            },
            ...(isEmptyObject(integrationSpecificMenuItems) || shouldShowSynchronizationError || isEmptyObject(policy?.connections) ? [] : [integrationSpecificMenuItems]),
            ...(isEmptyObject(policy?.connections) || !isConnectionVerified ? [] : configurationOptions),
        ];
    }, [
        icons.Gear,
        policy,
        isSyncInProgress,
        policyID,
        connectedIntegration,
        translate,
        isBetaEnabled,
        connectionSyncProgress?.stageInProgress,
        styles.sectionMenuItemTopDescription,
        styles.pb0,
        styles.mt5,
        styles.popoverMenuIcon,
        styles.justifyContentCenter,
        shouldShowCardReconciliationOption,
        shouldShowSynchronizationError,
        synchronizationError,
        overflowMenu,
        integrationSpecificMenuItems,
        accountingIntegrations,
        isOffline,
        startIntegrationFlow,
        popoverAnchorRefs,
        datetimeToRelative,
        icons.ExpensifyCard,
    ]);

    const otherIntegrationsItems = useMemo(() => {
        if ((isEmptyObject(policy?.connections) && !isSyncInProgress) || !policyID) {
            return;
        }
        const otherIntegrations = accountingIntegrations.filter(
            (integration) => (isSyncInProgress && integration !== connectionSyncProgress?.connectionName) || integration !== connectedIntegration,
        );
        return otherIntegrations
            .map((integration) => {
                const integrationData = getAccountingIntegrationData(integration, policyID, translate);
                if (!integrationData) {
                    return undefined;
                }

                const iconProps = integrationData?.icon ? {icon: integrationData.icon, iconType: CONST.ICON_TYPE_AVATAR} : {};

                return {
                    ...iconProps,
                    title: integrationData?.title,
                    rightComponent: (
                        <Button
                            onPress={() =>
                                startIntegrationFlow({
                                    name: integration,
                                    integrationToDisconnect: connectedIntegration,
                                    shouldDisconnectIntegrationBeforeConnecting: true,
                                })
                            }
                            text={translate('workspace.accounting.setup')}
                            style={styles.justifyContentCenter}
                            small
                            isDisabled={isOffline}
                            ref={(r) => {
                                if (!popoverAnchorRefs?.current) {
                                    return;
                                }
                                popoverAnchorRefs.current[integration].current = r;
                            }}
                        />
                    ),
                    interactive: false,
                    shouldShowRightComponent: true,
                    wrapperStyle: styles.sectionMenuItemTopDescription,
                };
            })
            .filter(Boolean) as MenuItemWithLink[];
    }, [
        policy?.connections,
        isSyncInProgress,
        accountingIntegrations,
        connectionSyncProgress?.connectionName,
        connectedIntegration,
        policyID,
        translate,
        styles.justifyContentCenter,
        styles.sectionMenuItemTopDescription,
        isOffline,
        startIntegrationFlow,
        popoverAnchorRefs,
    ]);

    const [chatTextLink, chatReportID] = useMemo(() => {
        // If they have an onboarding specialist assigned display the following and link to the #admins room with the setup specialist.
        if (policy?.chatReportIDAdmins) {
            return [translate('workspace.accounting.talkYourOnboardingSpecialist'), policy?.chatReportIDAdmins];
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
        >
            <ScreenWrapper
                testID={PolicyAccountingPage.displayName}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.accounting')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    icon={illustrations.Accounting}
                    shouldUseHeadlineHeader
                    onBackButtonPress={Navigation.popToSidebar}
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
                                            // eslint-disable-next-line react/jsx-props-no-spreading
                                            {...menuItem}
                                        />
                                    </OfflineWithFeedback>
                                ))}
                            {hasUnsupportedNDIntegration && hasSyncError && !!policyID && (
                                <FormHelpMessage
                                    isError
                                    style={styles.menuItemError}
                                    message={translate('workspace.accounting.errorODIntegration', {oldDotPolicyConnectionsURL})}
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
                            {!!account?.guideDetails?.email && !hasAccountingConnections(policy) && (
                                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt7]}>
                                    <Icon
                                        src={Expensicons.QuestionMark}
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
            <PolicyAccountingPage
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        </AccountingContextProvider>
    );
}

PolicyAccountingPage.displayName = 'PolicyAccountingPage';

export default withPolicyConnections(PolicyAccountingPageWrapper);
