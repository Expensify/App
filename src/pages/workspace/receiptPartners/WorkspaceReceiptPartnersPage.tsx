import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import {loadIllustration} from '@components/Icon/IllustrationLoader';
import type {IllustrationName} from '@components/Icon/IllustrationLoader';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import {useMemoizedLazyAsset, useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {MenuItemData} from '@pages/workspace/accounting/types';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {openExternalLink} from '@userActions/Link';
import {openPolicyReceiptPartnersPage, removePolicyReceiptPartnersConnection, togglePolicyUberAutoInvite, togglePolicyUberAutoRemove} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {AnchorPosition} from '@src/styles';
import getSynchronizationErrorMessage from './utils';

type WorkspaceReceiptPartnersPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS>;

function WorkspaceReceiptPartnersPage({route}: WorkspaceReceiptPartnersPageProps) {
    const policyID = route.params.policyID;
    const icons = useMemoizedLazyExpensifyIcons(['Key', 'NewWindow', 'Mail']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const receiptPartnerNames = CONST.POLICY.RECEIPT_PARTNERS.NAME;
    const receiptPartnerIntegrations = Object.values(receiptPartnerNames);
    const threeDotsMenuContainerRef = useRef<View>(null);
    const policy = usePolicy(policyID);
    const {getReceiptPartnersIntegrationData, shouldShowEnterCredentialsError, isUberConnected} = useGetReceiptPartnersIntegrationData(policyID);
    const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
    const isLoading = policy?.isLoading;
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const integrations = policy?.receiptPartners;
    const isAutoRemove = !!integrations?.uber?.autoRemove;
    const isAutoInvite = !!integrations?.uber?.autoInvite;
    const centralBillingAccountEmail = !!integrations?.uber?.centralBillingAccountEmail;
    const {asset: ReceiptPartners} = useMemoizedLazyAsset(() => loadIllustration('ReceiptPartners' as IllustrationName));
    // Track focus and connection change to route to the invite flow once after successful connection
    const prevIsUberConnected = usePrevious(isUberConnected);

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

    // When Uber connection status flips from false -> true, navigate to the invite flow once
    useEffect(() => {
        if (!isUberConnected || prevIsUberConnected) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE.getRoute(policyID, CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER));
    }, [prevIsUberConnected, isUberConnected, policyID]);

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

    const getOverflowMenu = useCallback(
        (integration: string) => {
            switch (integration) {
                case CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER:
                    if (shouldShowEnterCredentialsError) {
                        return [
                            {
                                icon: icons.Key,
                                text: translate('workspace.accounting.enterCredentials'),
                                onSelected: () => startIntegrationFlow({name: CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER}),
                                shouldCallAfterModalHide: true,
                                disabled: isOffline,
                                iconRight: icons.NewWindow,
                            },
                        ];
                    }

                    return [
                        {
                            icon: Expensicons.Trashcan,
                            text: translate('workspace.accounting.disconnect'),
                            onSelected: () => {
                                setIsDisconnectModalOpen(true);
                                setSelectedPartner(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER);
                            },
                            shouldCallAfterModalHide: true,
                        },
                    ];
                default:
                    return [];
            }
        },
        [icons.Key, icons.NewWindow, shouldShowEnterCredentialsError, translate, isOffline, startIntegrationFlow],
    );

    const onCloseModal = useCallback(() => {
        setIsDisconnectModalOpen(false);
        setSelectedPartner(null);
    }, []);

    const onDisconnectPartner = useCallback(() => {
        if (!policyID || !selectedPartner) {
            return;
        }
        removePolicyReceiptPartnersConnection(policyID, selectedPartner, integrations?.[selectedPartner]);
        fetchReceiptPartners();
        onCloseModal();
    }, [policyID, selectedPartner, integrations, onCloseModal, fetchReceiptPartners]);

    const connectionsMenuItems: MenuItemData[] = useMemo(() => {
        if (policyID) {
            return receiptPartnerIntegrations
                .map((integration) => {
                    const integrationData = getReceiptPartnersIntegrationData(integration);
                    if (!integrationData) {
                        return undefined;
                    }
                    const overflowMenu = getOverflowMenu(integration);

                    const iconProps = integrationData?.icon
                        ? {
                              icon: integrationData.icon,
                              iconType: CONST.ICON_TYPE_AVATAR,
                          }
                        : {};

                    const isUber = integration === CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER;

                    return {
                        ...iconProps,
                        ...integrationData,
                        interactive: false,
                        errorText: shouldShowEnterCredentialsError ? getSynchronizationErrorMessage(integrationData.title, translate, styles) : undefined,
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        shouldShowRightComponent: true,
                        title: integrationData?.title,
                        badgeText: isUber ? translate('workspace.accounting.claimOffer.badgeText') : undefined,
                        onBadgePress: isUber
                            ? () => {
                                  Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CLAIM_OFFER.getRoute(policyID, CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER));
                              }
                            : undefined,
                        badgeStyle: styles.mr3,
                        badgeSuccess: isUber,
                        shouldShowBadgeInSeparateRow: shouldUseNarrowLayout,
                        numberOfLinesDescription: 5,
                        titleContainerStyle: [styles.pr2],
                        description: integrationData?.description,
                        brickRoadIndicator: !!integrationData?.errorFields || shouldShowEnterCredentialsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                        rightComponent:
                            isUberConnected || shouldShowEnterCredentialsError ? (
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
                            ) : (
                                <Button
                                    onPress={() => startIntegrationFlow({name: integration})}
                                    text={translate('workspace.accounting.setup')}
                                    style={styles.justifyContentCenter}
                                    small
                                    isLoading={!policy?.receiptPartners?.uber && !isOffline && !!policy?.isLoadingReceiptPartners}
                                    isDisabled={isOffline}
                                />
                            ),
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
        shouldShowEnterCredentialsError,
        translate,
        styles,
        shouldUseNarrowLayout,
        isUberConnected,
        calculateAndSetThreeDotsMenuPosition,
        policy?.receiptPartners?.uber,
        isOffline,
        startIntegrationFlow,
    ]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED}
        >
            {isLoading ? (
                <FullScreenLoadingIndicator
                    shouldUseGoBackButton
                    style={styles.flex1}
                />
            ) : (
                <ScreenWrapper
                    testID="WorkspaceReceiptPartnersPage"
                    shouldShowOfflineIndicatorInWideScreen
                >
                    <HeaderWithBackButton
                        title={translate('workspace.common.receiptPartners')}
                        shouldShowBackButton={shouldUseNarrowLayout}
                        icon={ReceiptPartners}
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
                                isCentralPane
                                subtitleMuted
                                titleStyles={styles.accountSettingsSectionTitle}
                                childrenStyles={styles.pt5}
                            >
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
                                            // eslint-disable-next-line react/jsx-props-no-spreading
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
                                                />
                                            </View>
                                        </OfflineWithFeedback>
                                        {centralBillingAccountEmail && (
                                            <OfflineWithFeedback pendingAction={integrations?.uber?.pendingFields?.centralBillingAccountEmail}>
                                                <MenuItemWithTopDescription
                                                    description={translate('workspace.receiptPartners.uber.centralBillingAccount')}
                                                    title={integrations.uber.centralBillingAccountEmail}
                                                    shouldShowRightIcon
                                                    style={[styles.sectionMenuItemTopDescription, styles.mt5]}
                                                    onPress={() =>
                                                        Navigation.navigate(
                                                            ROUTES.WORKSPACE_RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT.getRoute(policyID, CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER),
                                                        )
                                                    }
                                                />
                                            </OfflineWithFeedback>
                                        )}
                                        <MenuItem
                                            title={translate('workspace.receiptPartners.uber.manageInvites')}
                                            shouldShowRightIcon
                                            icon={icons.Mail}
                                            style={[styles.sectionMenuItemTopDescription, styles.mbn3, !centralBillingAccountEmail && styles.mt6]}
                                            onPress={() => Navigation.navigate(ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT.getRoute(policyID, CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER))}
                                        />
                                    </>
                                )}
                            </Section>
                        </View>
                    </ScrollView>
                    <ConfirmModal
                        title={translate('workspace.moreFeatures.receiptPartnersWarningModal.featureEnabledTitle')}
                        isVisible={isDisconnectModalOpen}
                        onConfirm={onDisconnectPartner}
                        onCancel={onCloseModal}
                        prompt={translate('workspace.moreFeatures.receiptPartnersWarningModal.description')}
                        confirmText={translate('workspace.accounting.disconnect')}
                        cancelText={translate('common.cancel')}
                        danger
                    />
                </ScreenWrapper>
            )}
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceReceiptPartnersPage;
