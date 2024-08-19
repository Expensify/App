import {differenceInMinutes, isValid, parseISO} from 'date-fns';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CollapsibleSection from '@components/CollapsibleSection';
import ConfirmModal from '@components/ConfirmModal';
import ConnectToNetSuiteButton from '@components/ConnectToNetSuiteButton';
import ConnectToQuickbooksOnlineButton from '@components/ConnectToQuickbooksOnlineButton';
import ConnectToSageIntacctButton from '@components/ConnectToSageIntacctButton';
import ConnectToXeroButton from '@components/ConnectToXeroButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {MenuItemProps} from '@components/MenuItem';
import MenuItem from '@components/MenuItem';
import MenuItemList from '@components/MenuItemList';
import type {OfflineWithFeedbackProps} from '@components/OfflineWithFeedback';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import type ThreeDotsMenuProps from '@components/ThreeDotsMenu/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {getSynchronizationErrorMessage, isConnectionUnverified, removePolicyConnection, syncConnection} from '@libs/actions/connections';
import {
    areSettingsInErrorFields,
    findCurrentXeroOrganization,
    getConnectedIntegration,
    getCurrentSageIntacctEntityName,
    getCurrentXeroOrganizationName,
    getIntegrationLastSuccessfulDate,
    getXeroTenants,
    settingsPendingAction,
} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import type {AnchorPosition} from '@styles/index';
import {getTrackingCategories} from '@userActions/connections/ConnectToXero';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyConnectionSyncProgress} from '@src/types/onyx';
import type {ErrorFields, PendingFields} from '@src/types/onyx/OnyxCommon';
import type {PolicyConnectionName} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';

type MenuItemData = MenuItemProps & {pendingAction?: OfflineWithFeedbackProps['pendingAction']; errors?: OfflineWithFeedbackProps['errors']};

type PolicyAccountingPageOnyxProps = {
    connectionSyncProgress: OnyxEntry<PolicyConnectionSyncProgress>;
};

type PolicyAccountingPageProps = WithPolicyConnectionsProps &
    PolicyAccountingPageOnyxProps & {
        // This is not using OnyxEntry<OnyxTypes.Policy> because the HOC withPolicyConnections will only render this component if there is a policy
        policy: Policy;
    };

type AccountingIntegration = {
    title: string;
    icon: IconAsset;
    setupConnectionButton: React.ReactNode;
    onImportPagePress: () => void;
    subscribedImportSettings?: string[];
    onExportPagePress: () => void;
    subscribedExportSettings?: string[];
    onAdvancedPagePress: () => void;
    subscribedAdvancedSettings?: string[];
    onCardReconciliationPagePress: () => void;
    pendingFields?: PendingFields<string>;
    errorFields?: ErrorFields;
};

function accountingIntegrationData(
    connectionName: PolicyConnectionName,
    policyID: string,
    translate: LocaleContextProps['translate'],
    isConnectedToIntegration?: boolean,
    integrationToDisconnect?: PolicyConnectionName,
    policy?: Policy,
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
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.QBO)),
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
                subscribedImportSettings: [
                    CONST.XERO_CONFIG.ENABLE_NEW_CATEGORIES,
                    CONST.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES,
                    CONST.XERO_CONFIG.IMPORT_CUSTOMERS,
                    CONST.XERO_CONFIG.IMPORT_TAX_RATES,
                    ...getTrackingCategories(policy).map((category) => `${CONST.XERO_CONFIG.TRACKING_CATEGORY_PREFIX}${category.id}`),
                ],
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_EXPORT.getRoute(policyID)),
                subscribedExportSettings: [CONST.XERO_CONFIG.EXPORTER, CONST.XERO_CONFIG.BILL_DATE, CONST.XERO_CONFIG.BILL_STATUS, CONST.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT],
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.NAME.XERO)),
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_XERO_ADVANCED.getRoute(policyID)),
                subscribedAdvancedSettings: [
                    CONST.XERO_CONFIG.ENABLED,
                    CONST.XERO_CONFIG.SYNC_REIMBURSED_REPORTS,
                    CONST.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID,
                    CONST.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID,
                ],
                pendingFields: policy?.connections?.xero?.config?.pendingFields,
                errorFields: policy?.connections?.xero?.config?.errorFields,
            };
        case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
            return {
                title: translate('workspace.accounting.netsuite'),
                icon: Expensicons.NetSuiteSquare,
                setupConnectionButton: (
                    <ConnectToNetSuiteButton
                        policyID={policyID}
                        shouldDisconnectIntegrationBeforeConnecting={isConnectedToIntegration}
                        integrationToDisconnect={integrationToDisconnect}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_IMPORT.getRoute(policyID)),
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_EXPORT.getRoute(policyID)),
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.NAME.NETSUITE)),
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NETSUITE_ADVANCED.getRoute(policyID)),
            };
        case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
            return {
                title: translate('workspace.accounting.intacct'),
                icon: Expensicons.IntacctSquare,
                setupConnectionButton: (
                    <ConnectToSageIntacctButton
                        policyID={policyID}
                        shouldDisconnectIntegrationBeforeConnecting={isConnectedToIntegration}
                        integrationToDisconnect={integrationToDisconnect}
                    />
                ),
                onImportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT.getRoute(policyID)),
                subscribedImportSettings: [
                    CONST.SAGE_INTACCT_CONFIG.SYNC_ITEMS,
                    ...Object.values(CONST.SAGE_INTACCT_CONFIG.MAPPINGS),
                    CONST.SAGE_INTACCT_CONFIG.TAX,
                    ...(policy?.connections?.intacct?.config?.mappings?.dimensions ?? []).map((dimension) => `${CONST.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX}${dimension.dimension}`),
                ],
                onExportPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.getRoute(policyID)),
                subscribedExportSettings: [
                    CONST.SAGE_INTACCT_CONFIG.EXPORTER,
                    CONST.SAGE_INTACCT_CONFIG.EXPORT_DATE,
                    CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE,
                    CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR,
                    CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE,
                    CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                    policy?.connections?.intacct?.config?.export?.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL
                        ? CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR
                        : CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR,
                ],
                onCardReconciliationPagePress: () => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_CARD_RECONCILIATION.getRoute(policyID, CONST.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT)),
                onAdvancedPagePress: () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED.getRoute(policyID)),
                subscribedAdvancedSettings: [
                    CONST.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED,
                    CONST.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES,
                    CONST.SAGE_INTACCT_CONFIG.APPROVAL_MODE,
                    CONST.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS,
                    CONST.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID,
                ],
                pendingFields: policy?.connections?.intacct?.config?.pendingFields,
                errorFields: policy?.connections?.intacct?.config?.errorFields,
            };
        default:
            return undefined;
    }
}

function PolicyAccountingPage({policy}: PolicyAccountingPageProps) {
    const [connectionSyncProgress] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS}${policy.id}`);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate, datetimeToRelative: getDatetimeToRelative} = useLocalize();
    const {isOffline} = useNetwork();
    const {windowWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [threeDotsMenuPosition, setThreeDotsMenuPosition] = useState<AnchorPosition>({horizontal: 0, vertical: 0});
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const [datetimeToRelative, setDateTimeToRelative] = useState('');
    const threeDotsMenuContainerRef = useRef<View>(null);
    const {canUseWorkspaceFeeds} = usePermissions();

    const lastSyncProgressDate = parseISO(connectionSyncProgress?.timestamp ?? '');
    const isSyncInProgress =
        !!connectionSyncProgress?.stageInProgress &&
        (connectionSyncProgress.stageInProgress !== CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE || !policy.connections?.[connectionSyncProgress.connectionName]) &&
        isValid(lastSyncProgressDate) &&
        differenceInMinutes(new Date(), lastSyncProgressDate) < CONST.POLICY.CONNECTIONS.SYNC_STAGE_TIMEOUT_MINUTES;

    const accountingIntegrations = Object.values(CONST.POLICY.CONNECTIONS.NAME);
    const connectedIntegration = getConnectedIntegration(policy, accountingIntegrations) ?? connectionSyncProgress?.connectionName;

    const policyID = policy?.id ?? '-1';
    // Get the last successful date of the integration. Then, if `connectionSyncProgress` is the same integration displayed and the state is 'jobDone', get the more recent update time of the two.
    const successfulDate = getIntegrationLastSuccessfulDate(
        connectedIntegration ? policy?.connections?.[connectedIntegration] : undefined,
        connectedIntegration === connectionSyncProgress?.connectionName ? connectionSyncProgress : undefined,
    );

    const tenants = useMemo(() => getXeroTenants(policy), [policy]);
    const currentXeroOrganization = findCurrentXeroOrganization(tenants, policy?.connections?.xero?.config?.tenantID);

    const overflowMenu: ThreeDotsMenuProps['menuItems'] = useMemo(
        () => [
            {
                icon: Expensicons.Sync,
                text: translate('workspace.accounting.syncNow'),
                onSelected: () => syncConnection(policyID, connectedIntegration),
                disabled: isOffline,
            },
            {
                icon: Expensicons.Trashcan,
                text: translate('workspace.accounting.disconnect'),
                onSelected: () => Modal.close(() => setIsDisconnectModalOpen(true)),
            },
        ],
        [translate, policyID, isOffline, connectedIntegration],
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
                return {
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
                return {
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
        const synchronizationError = getSynchronizationErrorMessage(policy, connectedIntegration, isSyncInProgress);
        const shouldShowSynchronizationError = !!synchronizationError;
        const shouldHideConfigurationOptions = isConnectionUnverified(policy, connectedIntegration);
        const integrationData = accountingIntegrationData(connectedIntegration, policyID, translate, undefined, undefined, policy);
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
                description: isSyncInProgress
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
        policyID,
        translate,
        styles.sectionMenuItemTopDescription,
        styles.pb0,
        styles.mt5,
        styles.popoverMenuIcon,
        canUseWorkspaceFeeds,
        connectionSyncProgress?.stageInProgress,
        datetimeToRelative,
        theme.spinner,
        overflowMenu,
        threeDotsMenuPosition,
        integrationSpecificMenuItems,
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
                            {connectionsMenuItems.map((menuItem) => (
                                <OfflineWithFeedback
                                    pendingAction={menuItem.pendingAction}
                                    key={menuItem.title}
                                >
                                    <MenuItem
                                        brickRoadIndicator={menuItem.brickRoadIndicator}
                                        key={menuItem.title}
                                        // eslint-disable-next-line react/jsx-props-no-spreading
                                        {...menuItem}
                                    />
                                </OfflineWithFeedback>
                            ))}
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

PolicyAccountingPage.displayName = 'PolicyAccountingPage';

export default withPolicyConnections(PolicyAccountingPage);
