import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import ThreeDotsMenu from '@components/ThreeDotsMenu';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useThreeDotsAnchorPosition from '@hooks/useThreeDotsAnchorPosition';
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
import {getReceiptPartnersIntegrationData} from './utils';

type WorkspaceReceiptPartnersPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS>;

function WorkspaceReceiptPartnersPage({route}: WorkspaceReceiptPartnersPageProps) {
    const policyID = route.params.policyID;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const threeDotsAnchorPosition = useThreeDotsAnchorPosition(styles.threeDotsPopoverOffsetNoCloseButton);
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const receiptPartnerNames = CONST.POLICY.RECEIPT_PARTNERS.NAME;
    const receiptPartnerIntegrations = Object.values(receiptPartnerNames);
    const {isOffline} = useNetwork();
    const threeDotsMenuContainerRef = useRef<View>(null);
    const policy = usePolicy(policyID);
    const theme = useTheme();
    const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
    const isLoading = policy?.isLoading;
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);
    const integrations = policy?.receiptPartners;
    const isAutoRemove = !!integrations?.uber?.autoRemove;
    const isAutoInvite = !!integrations?.uber?.autoInvite;
    const [isConnected, setIsConnected] = useState(false);
    const isUberConnected = !!integrations?.uber?.organizationID || isConnected;

    const startIntegrationFlow = useCallback(
        ({name}: {name: string}) => {
            // TODO remove this when integration flow will be ready
            setIsConnected(true);
            switch (name) {
                case CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER: {
                    const {connectFormData} = integrations?.uber ?? {};
                    const hash = connectFormData?.hash;
                    const query = connectFormData?.query;
                    const userName = connectFormData?.name;
                    const id = connectFormData?.id;
                    openExternalLink(`${CONST.UBER_CONNECT_URL}?query=${query}&hash=${hash}&name=${userName}&id=${id}`);
                    break;
                }
                default: {
                    break;
                }
            }
        },
        [integrations],
    );

    const fetchReceiptPartners = useCallback(() => {
        openPolicyReceiptPartnersPage(policyID);
    }, [policyID]);

    useEffect(() => {
        fetchReceiptPartners();
        // eslint-disable-next-line react-compiler/react-compiler
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

    const getOverflowMenu = useCallback(
        (integration: string) => {
            switch (integration) {
                case CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER:
                    return [
                        {
                            icon: Expensicons.Key,
                            text: translate('workspace.accounting.enterCredentials'),
                            onSelected: () => startIntegrationFlow({name: CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER}),
                            shouldCallAfterModalHide: true,
                            disabled: isOffline,
                            iconRight: Expensicons.NewWindow,
                        },
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
        [translate, isOffline, startIntegrationFlow],
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
        setIsConnected(false);
        onCloseModal();
    }, [policyID, selectedPartner, integrations, onCloseModal]);

    const connectionsMenuItems: MenuItemData[] = useMemo(() => {
        if (policyID) {
            return receiptPartnerIntegrations
                .map((integration) => {
                    const integrationData = getReceiptPartnersIntegrationData(integration, translate);
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

                    return {
                        ...iconProps,
                        interactive: false,
                        wrapperStyle: [styles.sectionMenuItemTopDescription],
                        shouldShowRightComponent: true,
                        title: integrationData?.title,
                        numberOfLinesDescription: 5,
                        titleContainerStyle: [styles.pr2],
                        description: integrationData?.description,
                        brickRoadIndicator: policy?.receiptPartners?.uber?.errorFields ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
                        rightComponent: isUberConnected ? (
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
        translate,
        getOverflowMenu,
        styles.sectionMenuItemTopDescription,
        styles.pr2,
        styles.justifyContentCenter,
        policy?.receiptPartners?.uber?.errorFields,
        isUberConnected,
        calculateAndSetThreeDotsMenuPosition,
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
                <ActivityIndicator
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={styles.flex1}
                    color={theme.spinner}
                />
            ) : (
                <ScreenWrapper
                    testID={WorkspaceReceiptPartnersPage.displayName}
                    shouldShowOfflineIndicatorInWideScreen
                >
                    <HeaderWithBackButton
                        title={translate('workspace.common.receiptPartners')}
                        shouldShowBackButton={shouldUseNarrowLayout}
                        icon={Illustrations.ReceiptPartners}
                        shouldUseHeadlineHeader
                        threeDotsAnchorPosition={threeDotsAnchorPosition}
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
                                        <MenuItem
                                            title={translate('workspace.receiptPartners.uber.manageInvites')}
                                            shouldShowRightIcon
                                            icon={Expensicons.Mail}
                                            style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
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

WorkspaceReceiptPartnersPage.displayName = 'WorkspaceReceiptPartnersPage';

export default WorkspaceReceiptPartnersPage;
