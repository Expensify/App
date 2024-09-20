import {useFocusEffect, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CollapsibleSection from '@components/CollapsibleSection';
import ConfirmModal from '@components/ConfirmModal';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isAuthenticationError, isConnectionInProgress, isConnectionUnverified, removePolicyConnection, syncConnection} from '@libs/actions/connections';
import * as PolicyUtils from '@libs/PolicyUtils';
import {
    areSettingsInErrorFields,
    findCurrentXeroOrganization,
    getConnectedIntegration,
    getCurrentSageIntacctEntityName,
    getCurrentXeroOrganizationName,
    getIntegrationLastSuccessfulDate,
    getXeroTenants,
    isControlPolicy,
    settingsPendingAction,
} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {AnchorPosition} from '@styles/index';
import * as Link from '@userActions/Link';
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
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy?.id}`);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, datetimeToRelative: getDatetimeToRelative} = useLocalize();
    const {isOffline} = useNetwork();
    const {canUseNetSuiteUSATax} = usePermissions();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const [datetimeToRelative, setDateTimeToRelative] = useState('');
    const threeDotsMenuContainerRef = useRef<View>(null);
    const {canUseWorkspaceFeeds} = usePermissions();
    const {startIntegrationFlow, popoverAnchorRefs} = useAccountingContext();

    const route = useRoute();
    const params = route.params as RouteParams | undefined;
    const newConnectionName = params?.newConnectionName;
    const integrationToDisconnect = params?.integrationToDisconnect;
    const shouldDisconnectIntegrationBeforeConnecting = params?.shouldDisconnectIntegrationBeforeConnecting;

    const isSyncInProgress = isConnectionInProgress(connectionSyncProgress, policy);

    const accountingIntegrations = Object.values(CONST.POLICY.CONNECTIONS.NAME);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? connectionSyncProgress?.connectionName;
    const synchronizationError = connectedIntegration && getSynchronizationErrorMessage(policy, connectedIntegration, isSyncInProgress, translate, styles);

    // Enter credentials item shouldn't be shown for SageIntacct and NetSuite integrations
    const shouldShowEnterCredentials =
        connectedIntegration && !!synchronizationError && isAuthenticationError(policy, connectedIntegration) && connectedIntegration !== CONST.POLICY.CONNECTIONS.NAME.NETSUITE;

    const policyID = policy?.id ?? '-1';
    // Get the last successful date of the integration. Then, if `connectionSyncProgress` is the same integration displayed and the state is 'jobDone', get the more recent update time of the two.
    const successfulDate = getIntegrationLastSuccessfulDate(
        connectedIntegration ? policy?.connections?.[connectedIntegration] : undefined,
        connectedIntegration === connectionSyncProgress?.connectionName ? connectionSyncProgress : undefined,
    );

    const hasSyncError = PolicyUtils.hasSyncError(policy, isSyncInProgress);
    const hasUnsupportedNDIntegration = PolicyUtils.hasUnsupportedIntegration(policy, accountingIntegrations);

    const tenants = useMemo(() => getXeroTenants(policy), [policy]);
    const currentXeroOrganization = findCurrentXeroOrganization(tenants, policy?.connections?.xero?.config?.tenantID);

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            ...(shouldShowEnterCredentials
                ? [
                      {
                          icon: Expensicons.Key,
                          text: translate('workspace.accounting.enterCredentials'),
                          onSelected: () => startIntegrationFlow({name: connectedIntegration}),
                          shouldCallAfterModalHide: true,
                          disabled: isOffline,
                          iconRight: Expensicons.NewWindow,
                          shouldShowRightIcon: connectedIntegration !== CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
                      },
                  ]
                : [
                      {
                          icon: Expensicons.Sync,
                          text: translate('workspace.accounting.syncNow'),
                          onSelected: () => syncConnection(policyID, connectedIntegration),
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
        [shouldShowEnterCredentials, translate, isOffline, policyID, connectedIntegration, startIntegrationFlow],
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
                              Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_ORGANIZATION.getRoute(policyID, currentXeroOrganization?.id ?? '-1'));
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
            default:
                return undefined;
        }
    }, [connectedIntegration, currentXeroOrganization?.id, policy, policyID, styles.fontWeightNormal, styles.sectionMenuItemTopDescription, tenants.length, translate]);

    const connectionsMenuItems: MenuItemData[] = useMemo(() => {
        if (isEmptyObject(policy?.connections) && !isSyncInProgress) {
            return accountingIntegrations.map((integration) => {
                const integrationData = getAccountingIntegrationData(integration, policyID, translate);
                const iconProps = integrationData?.icon ? {icon: integrationData.icon, iconType: CONST.ICON_TYPE_AVATAR} : {};
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
            });
        }

        if (!connectedIntegration) {
            return [];
        }
        const shouldShowSynchronizationError = !!synchronizationError;
        const shouldHideConfigurationOptions = isConnectionUnverified(policy, connectedIntegration);
        const integrationData = getAccountingIntegrationData(connectedIntegration, policyID, translate, policy, undefined, undefined, undefined, canUseNetSuiteUSATax);
        const iconProps = integrationData?.icon ? {icon: integrationData.icon, iconType: CONST.ICON_TYPE_AVATAR} : {};

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
                brickRoadIndicator: areSettingsInErrorFields(integrationData?.subscribedExportSettings, integrationData?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                pendingAction: settingsPendingAction(integrationData?.subscribedExportSettings, integrationData?.pendingFields),
            },
            {
                icon: Expensicons.ExpensifyCard,
                iconRight: Expensicons.ArrowRight,
                shouldShowRightIcon: true,
                title: translate('workspace.accounting.cardReconciliation'),
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                onPress: integrationData?.onCardReconciliationPagePress,
            },
            {
                icon: Expensicons.Gear,
                iconRight: Expensicons.ArrowRight,
                shouldShowRightIcon: true,
                title: translate('workspace.accounting.advanced'),
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                onPress: integrationData?.onAdvancedPagePress,
                brickRoadIndicator: areSettingsInErrorFields(integrationData?.subscribedAdvancedSettings, integrationData?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                pendingAction: settingsPendingAction(integrationData?.subscribedAdvancedSettings, integrationData?.pendingFields),
            },
        ];

        if (!canUseWorkspaceFeeds || !policy?.areExpensifyCardsEnabled) {
            configurationOptions.splice(2, 1);
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
                description:
                    isSyncInProgress && connectionSyncProgress?.stageInProgress
                        ? translate('workspace.accounting.connections.syncStageName', connectionSyncProgress.stageInProgress)
                        : translate('workspace.accounting.lastSync', datetimeToRelative),
                rightComponent: isSyncInProgress ? (
                    <ActivityIndicator
                        style={[styles.popoverMenuIcon]}
                        color={theme.spinner}
                    />
                ) : (
                    <View ref={threeDotsMenuContainerRef}>
                        <ThreeDotsMenu
                            onIconPress={() => {
                                threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
                                    setThreeDotsMenuPosition({
                                        horizontal: x + width,
                                        vertical: y + height,
                                    });
                                });
                            }}
                            menuItems={overflowMenu}
                            anchorPosition={threeDotsMenuPosition}
                            anchorAlignment={{horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT, vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP}}
                        />
                    </View>
                ),
            },
            ...(isEmptyObject(integrationSpecificMenuItems) || shouldShowSynchronizationError || isEmptyObject(policy?.connections) ? [] : [integrationSpecificMenuItems]),
            ...(isEmptyObject(policy?.connections) || shouldHideConfigurationOptions ? [] : configurationOptions),
        ];
    }, [
        policy,
        isSyncInProgress,
        connectedIntegration,
        synchronizationError,
        policyID,
        translate,
        styles.sectionMenuItemTopDescription,
        styles.pb0,
        styles.mt5,
        styles.popoverMenuIcon,
        canUseWorkspaceFeeds,
        styles.justifyContentCenter,
        connectionSyncProgress?.stageInProgress,
        datetimeToRelative,
        theme.spinner,
        overflowMenu,
        threeDotsMenuPosition,
        integrationSpecificMenuItems,
        accountingIntegrations,
        isOffline,
        startIntegrationFlow,
        popoverAnchorRefs,
        canUseNetSuiteUSATax,
    ]);

    const otherIntegrationsItems = useMemo(() => {
        if (isEmptyObject(policy?.connections) && !isSyncInProgress && !(hasUnsupportedNDIntegration && hasSyncError)) {
            return;
        }
        const otherIntegrations = accountingIntegrations.filter(
            (integration) => (isSyncInProgress && integration !== connectionSyncProgress?.connectionName) || integration !== connectedIntegration,
        );
        return otherIntegrations.map((integration) => {
            const integrationData = getAccountingIntegrationData(integration, policyID, translate);
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
        });
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
        hasUnsupportedNDIntegration,
        hasSyncError,
    ]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                testID={PolicyAccountingPage.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldShowOfflineIndicatorInWideScreen
            >
                <HeaderWithBackButton
                    title={translate('workspace.common.accounting')}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    icon={Illustrations.Accounting}
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                />
                <ScrollView contentContainerStyle={styles.pt3}>
                    <View style={[styles.flex1, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section
                            title={translate('workspace.accounting.title')}
                            subtitle={translate('workspace.accounting.subtitle')}
                            isCentralPane
                            subtitleMuted
                            titleStyles={styles.accountSettingsSectionTitle}
                            childrenStyles={styles.pt5}
                        >
                            {!(hasUnsupportedNDIntegration && hasSyncError) &&
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
                            {hasUnsupportedNDIntegration && hasSyncError && (
                                <FormHelpMessage
                                    isError
                                    shouldShowRedDotIndicator
                                    style={styles.menuItemError}
                                >
                                    <Text style={[{color: theme.textError}]}>
                                        {translate('workspace.accounting.errorODIntegration')}
                                        <TextLink
                                            onPress={() => {
                                                // Go to Expensify Classic.
                                                Link.openOldDotLink(CONST.OLDDOT_URLS.POLICY_CONNECTIONS_URL(policyID));
                                            }}
                                        >
                                            {translate('workspace.accounting.goToODToFix')}
                                        </TextLink>
                                    </Text>
                                </FormHelpMessage>
                            )}
                            {otherIntegrationsItems && (
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
                        </Section>
                    </View>
                </ScrollView>
                <ConfirmModal
                    title={translate('workspace.accounting.disconnectTitle', connectedIntegration)}
                    isVisible={isDisconnectModalOpen}
                    onConfirm={() => {
                        if (connectedIntegration) {
                            removePolicyConnection(policyID, connectedIntegration);
                        }
                        setIsDisconnectModalOpen(false);
                    }}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.accounting.disconnectPrompt', connectedIntegration)}
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
