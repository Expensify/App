import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import useConfirmModal from '@hooks/useConfirmModal';
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScreenBoundDynamicRoute from '@hooks/useScreenBoundDynamicRoute';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {MenuItemData} from '@pages/workspace/accounting/types';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {openExternalLink} from '@userActions/Link';
import {openPolicyReceiptPartnersPage, removePolicyReceiptPartnersConnection, togglePolicyUberAutoInvite, togglePolicyUberAutoRemove} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {AnchorPosition} from '@src/styles';

import type {ComponentRef} from 'react';

import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';

import getSynchronizationErrorMessage from './utils';

type WorkspaceReceiptPartnersPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS>;

function WorkspaceReceiptPartnersPage({route}: WorkspaceReceiptPartnersPageProps) {
    const policyID = route.params.policyID;
    const icons = useMemoizedLazyExpensifyIcons(['Key', 'Mail', 'NewWindow', 'Trashcan']);
    const {translate} = useLocalize();
    const buildDynamicRoute = useScreenBoundDynamicRoute();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {showConfirmModal} = useConfirmModal();
    const receiptPartnerNames = CONST.POLICY.RECEIPT_PARTNERS.NAME;
    const receiptPartnerIntegrations = Object.values(receiptPartnerNames);
    const threeDotsMenuContainerRef = useRef<ComponentRef<typeof View>>(null);
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.receiptPartners');
    const {getReceiptPartnersIntegrationData, shouldShowEnterCredentialsError, isUberConnected} = useGetReceiptPartnersIntegrationData(policyID);
    const isLoading = policy?.isLoading;
    const integrations = policy?.receiptPartners;
    const isAutoRemove = !!integrations?.uber?.autoRemove;
    const isAutoInvite = !!integrations?.uber?.autoInvite;
    const centralBillingAccountEmail = !!integrations?.uber?.centralBillingAccountEmail;
    const {canWrite: canWriteMoreFeatures, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);

    const startIntegrationFlow = useCallback(
        ({name}: {name: string}) => {
            switch (name) {
                case CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER: {
                    openExternalLink(`${CONST.UBER_CONNECT_URL}?${integrations?.uber?.connectFormData}`);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [integrations?.uber?.connectFormData],
    );

    const fetchReceiptPartners = useCallback(() => {
        openPolicyReceiptPartnersPage(policyID);
    }, [policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchReceiptPartners});

    useEffect(() => {
        fetchReceiptPartners();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const calculateAndSetThreeDotsMenuPosition = useCallback(() => {
        if (shouldUseNarrowLayout) {
            return Promise.resolve({horizontal: 0, vertical: 0});
        }
        return new Promise<AnchorPosition>((resolve) => {
            threeDotsMenuContainerRef.current?.measureInWindow((x, y, width, height) => {
                resolve({
                    horizontal: x + width,
                    vertical: y + height,
                });
            });
        });
    }, [shouldUseNarrowLayout]);

    const toggleWorkspaceUberAutoInvite = useCallback(() => {
        togglePolicyUberAutoInvite(policyID, !isAutoInvite);
    }, [isAutoInvite, policyID]);

    const toggleWorkspaceUberAutoRemove = useCallback(() => {
        togglePolicyUberAutoRemove(policyID, !isAutoRemove);
    }, [isAutoRemove, policyID]);

    const disconnectPartner = useCallback(
        (partner: (typeof receiptPartnerNames)[keyof typeof receiptPartnerNames]) => {
            if (!policyID) {
                return;
            }
            removePolicyReceiptPartnersConnection(policyID, partner, integrations?.[partner]);
            fetchReceiptPartners();
        },
        [policyID, integrations, fetchReceiptPartners],
    );

    const getOverflowMenu = useCallback(
        (integration: string) => {
            switch (integration) {
                case CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER:
                    if (shouldShowEnterCredentialsError) {
                        return [
                            {
                                icon: icons.Key,
                                text: translate('workspace.accounting.enterCredentials'),
                                onSelected: () =>
                                    startIntegrationFlow({
                                        name: CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER,
                                    }),
                                shouldCallAfterModalHide: true,
                                disabled: isOffline,
                                iconRight: icons.NewWindow,
                            },
                        ];
                    }

                    return [
                        {
                            icon: icons.Trashcan,
                            text: translate('workspace.accounting.disconnect'),
                            onSelected: () => {
                                showConfirmModal({
                                    title: translate('workspace.moreFeatures.receiptPartnersWarningModal.featureEnabledTitle'),
                                    prompt: translate('workspace.moreFeatures.receiptPartnersWarningModal.description'),
                                    confirmText: translate('workspace.accounting.disconnect'),
                                    cancelText: translate('common.cancel'),
                                    buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                                }).then(({action}) => {
                                    if (action !== ModalActions.CONFIRM) {
                                        return;
                                    }
                                    // These settings have nothing to show once Uber is disconnected
                                    Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID));
                                    disconnectPartner(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER);
                                });
                            },
                            shouldCallAfterModalHide: true,
                        },
                    ];
                default:
                    return [];
            }
        },
        [icons.Key, icons.NewWindow, icons.Trashcan, shouldShowEnterCredentialsError, translate, isOffline, startIntegrationFlow, showConfirmModal, disconnectPartner, policyID],
    );

    const connectionsMenuItems: MenuItemData[] = useMemo(() => {
        if (policyID) {
            return receiptPartnerIntegrations
                .map((integration) => {
                    const integrationData = getReceiptPartnersIntegrationData(integration);
                    if (!integrationData) {
                        return undefined;
                    }
                    const overflowMenu = canWriteMoreFeatures ? getOverflowMenu(integration) : [];

                    const iconProps = integrationData?.icon
                        ? {
                              icon: integrationData.icon,
                              iconType: CONST.ICON_TYPE_AVATAR,
                          }
                        : {};

                    let rightComponent: React.ReactNode;
                    if (canWriteMoreFeatures) {
                        rightComponent = (
                            <View ref={threeDotsMenuContainerRef}>
                                <ThreeDotsMenu
                                    getAnchorPosition={calculateAndSetThreeDotsMenuPosition}
                                    menuItems={overflowMenu}
                                    anchorAlignment={{
                                        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                                        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                                    }}
                                />
                            </View>
                        );
                    }

                    return {
                        ...iconProps,
                        ...integrationData,
                        interactive: false,
                        errorText: shouldShowEnterCredentialsError ? getSynchronizationErrorMessage(integrationData.title, translate, styles) : undefined,
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        shouldShowRightComponent: !!rightComponent,
                        title: integrationData?.title,
                        numberOfLinesDescription: 5,
                        titleContainerStyle: [styles.pr2],
                        description: integrationData?.description,
                        brickRoadIndicator: !!integrationData?.errorFields || shouldShowEnterCredentialsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                        rightComponent,
                    };
                })
                .filter(Boolean) as MenuItemData[];
        }

        return [];
    }, [
        policyID,
        receiptPartnerIntegrations,
        getReceiptPartnersIntegrationData,
        getOverflowMenu,
        canWriteMoreFeatures,
        shouldShowEnterCredentialsError,
        translate,
        styles,
        calculateAndSetThreeDotsMenuPosition,
    ]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
            shouldBeBlocked={!isLoading && !isUberConnected && !shouldShowEnterCredentialsError}
        >
            {isLoading ? (
                <FullScreenLoadingIndicator
                    shouldUseGoBackButton
                    style={styles.flex1}
                />
            ) : (
                <ScreenWrapper
                    testID="WorkspaceReceiptPartnersPage"
                    enableEdgeToEdgeBottomSafeAreaPadding
                >
                    <HeaderWithBackButton
                        title={CONST.POLICY.RECEIPT_PARTNERS.NAME_USER_FRIENDLY[CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER]}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID))}
                    />
                    <ScrollView
                        contentContainerStyle={styles.pt3}
                        addBottomSafeAreaPadding
                    >
                        <View style={[styles.flex1, styles.ph5]}>
                            {connectionsMenuItems.map((menuItem) => (
                                <OfflineWithFeedback
                                    pendingAction={menuItem.pendingAction}
                                    key={menuItem.title}
                                    shouldDisableStrikeThrough
                                >
                                    <MenuItem
                                        errorTextStyle={styles.mt3}
                                        brickRoadIndicator={menuItem.brickRoadIndicator}
                                        key={menuItem.title}
                                        {...menuItem}
                                    />
                                </OfflineWithFeedback>
                            ))}
                            {isUberConnected && (
                                <>
                                    <OfflineWithFeedback pendingAction={integrations?.uber?.pendingFields?.autoInvite}>
                                        <View style={styles.mt5}>
                                            <ToggleSettingOptionRow
                                                titleStyle={styles.pr3}
                                                title={translate('workspace.receiptPartners.uber.autoInvite')}
                                                switchAccessibilityLabel={translate('workspace.receiptPartners.uber.autoInvite')}
                                                onToggle={toggleWorkspaceUberAutoInvite}
                                                isActive={isAutoInvite}
                                                disabled={!canWriteMoreFeatures}
                                                disabledAction={withReadOnlyFallback()}
                                                showLockIcon={!canWriteMoreFeatures}
                                            />
                                        </View>
                                    </OfflineWithFeedback>
                                    <OfflineWithFeedback pendingAction={integrations?.uber?.pendingFields?.autoRemove}>
                                        <View style={styles.mt5}>
                                            <ToggleSettingOptionRow
                                                titleStyle={styles.pr3}
                                                title={translate('workspace.receiptPartners.uber.autoRemove')}
                                                switchAccessibilityLabel={translate('workspace.receiptPartners.uber.autoRemove')}
                                                onToggle={toggleWorkspaceUberAutoRemove}
                                                isActive={isAutoRemove}
                                                disabled={!canWriteMoreFeatures}
                                                disabledAction={withReadOnlyFallback()}
                                                showLockIcon={!canWriteMoreFeatures}
                                            />
                                        </View>
                                    </OfflineWithFeedback>
                                    {centralBillingAccountEmail && (
                                        <OfflineWithFeedback pendingAction={integrations?.uber?.pendingFields?.centralBillingAccountEmail}>
                                            <View style={styles.mt5}>
                                                <MenuItemSectionRoot
                                                    onPress={
                                                        canWriteMoreFeatures
                                                            ? () =>
                                                                  Navigation.navigate(
                                                                      ROUTES.WORKSPACE_RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT.getRoute(policyID, CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER),
                                                                  )
                                                            : undefined
                                                    }
                                                >
                                                    <MenuItemField.Row
                                                        name={translate('workspace.receiptPartners.uber.centralBillingAccount')}
                                                        value={integrations?.uber?.centralBillingAccountEmail}
                                                    >
                                                        {canWriteMoreFeatures && <MenuItem.Chevron />}
                                                    </MenuItemField.Row>
                                                </MenuItemSectionRoot>
                                            </View>
                                        </OfflineWithFeedback>
                                    )}
                                    {canWriteMoreFeatures && (
                                        <View style={[styles.mbn3, !centralBillingAccountEmail && styles.mt6]}>
                                            <MenuItemSectionRoot
                                                onPress={() =>
                                                    Navigation.navigate(
                                                        buildDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT.getRoute(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER)),
                                                    )
                                                }
                                            >
                                                <MenuItem.Row>
                                                    <MenuItem.Leading>
                                                        <MenuItem.Icon src={icons.Mail} />
                                                    </MenuItem.Leading>
                                                    <MenuItem.Content>
                                                        <MenuItem.Title>{translate('workspace.receiptPartners.uber.manageInvites')}</MenuItem.Title>
                                                    </MenuItem.Content>
                                                    <MenuItem.Trailing>
                                                        <MenuItem.Chevron />
                                                    </MenuItem.Trailing>
                                                </MenuItem.Row>
                                            </MenuItemSectionRoot>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    </ScrollView>
                </ScreenWrapper>
            )}
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceReceiptPartnersPage;
