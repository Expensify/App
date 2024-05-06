import React, {useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CollapsibleSection from '@components/CollapsibleSection';
import ConfirmModal from '@components/ConfirmModal';
import ConnectToQuickbooksOnlineButton from '@components/ConnectToQuickbooksOnlineButton';
import ConnectToXeroButton from '@components/ConnectToXeroButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {removePolicyConnection} from '@libs/actions/connections';
import {syncConnection} from '@libs/actions/connections/QuickBooksOnline';
import {findCurrentXeroOrganization, getXeroTenants} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {AnchorPosition} from '@styles/index';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyConnectionSyncProgress} from '@src/types/onyx';
import type {PolicyConnectionName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

type PolicyAccountingPageOnyxProps = {
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>;
};

type PolicyAccountingPageProps = WithPolicyProps &
    PolicyAccountingPageOnyxProps & {
        // This is not using OnyxEntry<OnyxTypes.Policy> because the HOC withPolicyConnections will only render this component if there is a policy
        policy: Policy;
    };

type AccountingIntegration = {
    title: string;
    icon: IconAsset;
    setupConnectionButton: React.ReactNode;
    onImportPagePress: () => void;
    onExportPagePress: () => void;
    onAdvancedPagePress: () => void;
};
function accountingIntegrationData(
    connectionName: PolicyConnectionName,
    policyID: string,
    translate: LocaleContextProps['translate'],
    isConnectedToIntegration?: boolean,
    integrationToDisconnect?: PolicyConnectionName,
): AccountingIntegration | undefined {
    switch (connectionName) {
        case CONST.POLICY.CONNECTIONS.NAME.QBO:
            return {
                title: translate('workspace.accounting.qbo'),
                icon: Expensicons.QBOSquare,
                setupConnectionButton: (
                    <ConnectToQuickbooksOnlineButton
                        policyID={policyID}
                        shouldDisconnectIntegrationBeforeConnecting={isConnectedToIntegration}
                        integrationToDisconnect={integrationToDisconnect}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID)),
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT.getRoute(policyID)),
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED.getRoute(policyID)),
            };
        case CONST.POLICY.CONNECTIONS.NAME.XERO:
            return {
                title: translate('workspace.accounting.xero'),
                icon: Expensicons.XeroSquare,
                setupConnectionButton: (
                    <ConnectToXeroButton
                        policyID={policyID}
                        shouldDisconnectIntegrationBeforeConnecting={isConnectedToIntegration}
                        integrationToDisconnect={integrationToDisconnect}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_IMPORT.getRoute(policyID)),
                onExportPagePress: () => {},
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID)),
            };
        default:
            return undefined;
    }
}

function PolicyAccountingPage({policy, connectionSyncProgress}: PolicyAccountingPageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {canUseXeroIntegration} = usePermissions();
    const {isSmallScreenWidth, windowWidth} = useWindowDimensions();
    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const threeDotsMenuContainerRef = useRef<View>(null);

    const isSyncInProgress = !!connectionSyncProgress?.stageInProgress && connectionSyncProgress.stageInProgress !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE;

    const accountingIntegrations = Object.values(CONST.POLICY.CONNECTIONS.NAME).filter((name) => !(name === CONST.POLICY.CONNECTIONS.NAME.XERO && !canUseXeroIntegration));
    const connectedIntegration = accountingIntegrations.find((integration) => !!policy?.connections?.[integration]) ?? connectionSyncProgress?.connectionName;
    const policyID = policy?.id ?? '';

    const policyConnectedToXero = connectedIntegration === CONST.POLICY.CONNECTIONS.NAME.XERO;

    const tenants = useMemo(() => getXeroTenants(policy), [policy]);

    const currentXeroOrganization = findCurrentXeroOrganization(tenants, policy?.connections?.xero?.config?.tenantID);

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: Expensicons.Sync,
                text: translate('workspace.accounting.syncNow'),
                onSelected: () => syncConnection(policyID),
                disabled: isOffline,
            },
            {
                icon: Expensicons.Trashcan,
                text: translate('workspace.accounting.disconnect'),
                onSelected: () => setIsDisconnectModalOpen(true),
            },
        ],
        [translate, policyID, isOffline],
    );

    const connectionsMenuItems: MenuItemProps[] = useMemo(() => {
        if (isEmptyObject(policy?.connections) && !isSyncInProgress) {
            return accountingIntegrations.map((integration) => {
                const integrationData = accountingIntegrationData(integration, policyID, translate);
                const iconProps = integrationData?.icon ? {icon: integrationData.icon, iconType: CONST.ICON_TYPE_AVATAR} : {};
                return {
                    ...iconProps,
                    interactive: false,
                    wrapperStyle: [styles.sectionMenuItemTopDescription],
                    shouldShowRightComponent: true,
                    title: integrationData?.title,
                    rightComponent: integrationData?.setupConnectionButton,
                };
            });
        }

        if (!connectedIntegration) {
            return [];
        }
        const integrationData = accountingIntegrationData(connectedIntegration, policyID, translate);
        const iconProps = integrationData?.icon ? {icon: integrationData.icon, iconType: CONST.ICON_TYPE_AVATAR} : {};
        return [
            {
                ...iconProps,
                interactive: false,
                wrapperStyle: [styles.sectionMenuItemTopDescription],
                shouldShowRightComponent: true,
                title: integrationData?.title,

                description: isSyncInProgress
                    ? translate('workspace.accounting.connections.syncStageName', connectionSyncProgress.stageInProgress)
                    : translate('workspace.accounting.lastSync'),
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
            ...(policyConnectedToXero
                ? [
                      {
                          description: translate('workspace.xero.organization'),
                          iconRight: Expensicons.ArrowRight,
                          title: currentXeroOrganization?.name,
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          titleStyle: styles.fontWeightNormal,
                          shouldShowRightIcon: tenants.length > 1,
                          shouldShowDescriptionOnTop: true,
                          onPress: () => {
                              if (!(tenants.length > 1)) {
                                  return;
                              }
                              Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_ORGANIZATION.getRoute(policyID, currentXeroOrganization?.id ?? ''));
                          },
                      },
                  ]
                : []),
            ...(isEmptyObject(policy?.connections)
                ? []
                : [
                      {
                          icon: Expensicons.Pencil,
                          iconRight: Expensicons.ArrowRight,
                          shouldShowRightIcon: true,
                          title: translate('workspace.accounting.import'),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          onPress: integrationData?.onImportPagePress,
                      },
                      {
                          icon: Expensicons.Send,
                          iconRight: Expensicons.ArrowRight,
                          shouldShowRightIcon: true,
                          title: translate('workspace.accounting.export'),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          onPress: integrationData?.onExportPagePress,
                      },
                      {
                          icon: Expensicons.Gear,
                          iconRight: Expensicons.ArrowRight,
                          shouldShowRightIcon: true,
                          title: translate('workspace.accounting.advanced'),
                          wrapperStyle: [styles.sectionMenuItemTopDescription],
                          onPress: integrationData?.onAdvancedPagePress,
                      },
                  ]),
        ];
    }, [
        connectedIntegration,
        connectionSyncProgress?.stageInProgress,
        currentXeroOrganization,
        tenants,
        isSyncInProgress,
        overflowMenu,
        policy?.connections,
        policyConnectedToXero,
        policyID,
        styles,
        theme.spinner,
        threeDotsMenuPosition,
        translate,
        accountingIntegrations,
    ]);

    const otherIntegrationsItems = useMemo(() => {
        if (isEmptyObject(policy?.connections) && !isSyncInProgress) {
            return;
        }
        const otherIntegrations = accountingIntegrations.filter(
            (integration) => (isSyncInProgress && integration !== connectionSyncProgress?.connectionName) || integration !== connectedIntegration,
        );
        return otherIntegrations.map((integration) => {
            const integrationData = accountingIntegrationData(integration, policyID, translate, true, connectedIntegration);
            const iconProps = integrationData?.icon ? {icon: integrationData.icon, iconType: CONST.ICON_TYPE_AVATAR} : {};
            return {
                ...iconProps,
                title: integrationData?.title,
                rightComponent: integrationData?.setupConnectionButton,
                interactive: false,
                shouldShowRightComponent: true,
                wrapperStyle: styles.sectionMenuItemTopDescription,
            };
        });
    }, [
        connectedIntegration,
        connectionSyncProgress?.connectionName,
        isSyncInProgress,
        policy?.connections,
        policyID,
        styles.sectionMenuItemTopDescription,
        translate,
        accountingIntegrations,
    ]);

    const headerThreeDotsMenuItems: ThreeDotsMenuProps['menuItems'] = [
        {
            icon: Expensicons.Key,
            shouldShowRightIcon: true,
            iconRight: Expensicons.NewWindow,
            text: translate('workspace.accounting.enterCredentials'),
            onSelected: () => {},
        },
        {
            icon: Expensicons.Trashcan,
            text: translate('workspace.accounting.disconnect'),
            onSelected: () => setIsDisconnectModalOpen(true),
        },
    ];

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
                    shouldShowBackButton={isSmallScreenWidth}
                    icon={Illustrations.Accounting}
                    shouldShowThreeDotsButton
                    threeDotsAnchorPosition={styles.threeDotsPopoverOffsetNoCloseButton(windowWidth)}
                    threeDotsMenuItems={headerThreeDotsMenuItems}
                />
                <ScrollView contentContainerStyle={styles.pt3}>
                    <View style={[styles.flex1, isSmallScreenWidth ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                        <Section
                            title={translate('workspace.accounting.title')}
                            subtitle={translate('workspace.accounting.subtitle')}
                            isCentralPane
                            subtitleMuted
                            titleStyles={styles.accountSettingsSectionTitle}
                            childrenStyles={styles.pt5}
                        >
                            <MenuItemList
                                menuItems={connectionsMenuItems}
                                shouldUseSingleExecution
                            />
                            {otherIntegrationsItems && (
                                <CollapsibleSection
                                    title={translate('workspace.accounting.other')}
                                    wrapperStyle={styles.pr3}
                                    titleStyle={[styles.textNormal, styles.colorMuted]}
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
                        removePolicyConnection(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO);
                        setIsDisconnectModalOpen(false);
                    }}
                    onCancel={() => setIsDisconnectModalOpen(false)}
                    prompt={translate('workspace.accounting.disconnectPrompt', undefined, connectedIntegration)}
                    confirmText={translate('workspace.accounting.disconnect')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

PolicyAccountingPage.displayName = 'PolicyAccountingPage';

export default withPolicyConnections(
    withOnyx<PolicyAccountingPageProps, PolicyAccountingPageOnyxProps>({
        connectionSyncProgress: {
            key: (props) => `${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${props.route.params.policyID}`,
        },
    })(PolicyAccountingPage),
);
