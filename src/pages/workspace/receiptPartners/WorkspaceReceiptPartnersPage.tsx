import Button from '@components/Button';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScreenBoundDynamicRoute from '@hooks/useScreenBoundDynamicRoute';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {MenuItemData} from '@pages/workspace/accounting/types';
import withUnifiedConnectionsBeta from '@pages/workspace/connections/withUnifiedConnectionsBeta';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {AnchorPosition} from '@src/styles';

import type {ComponentRef} from 'react';

import React, {useEffect, useRef} from 'react';
import {View} from 'react-native';

import useReceiptPartnersSettings from './useReceiptPartnersSettings';
import getSynchronizationErrorMessage from './utils';

type WorkspaceReceiptPartnersPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS>;

function WorkspaceReceiptPartnersPage({route}: WorkspaceReceiptPartnersPageProps) {
    const policyID = route.params.policyID;
    const icons = useMemoizedLazyExpensifyIcons(['Mail']);
    const {translate} = useLocalize();
    const buildDynamicRoute = useScreenBoundDynamicRoute();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const receiptPartnerIntegrations = Object.values(CONST.POLICY.RECEIPT_PARTNERS.NAME);
    const threeDotsMenuContainerRef = useRef<ComponentRef<typeof View>>(null);
    const {
        policy,
        integrations,
        isAutoInvite,
        isAutoRemove,
        isUberConnected,
        shouldShowEnterCredentialsError,
        getReceiptPartnersIntegrationData,
        isOffline,
        canWriteMoreFeatures,
        showReadOnlyModal,
        withReadOnlyFallback,
        startIntegrationFlow,
        toggleUberAutoInvite,
        toggleUberAutoRemove,
        getOverflowMenu,
    } = useReceiptPartnersSettings(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.receiptPartners');
    const isLoading = policy?.isLoading;
    const centralBillingAccountEmail = !!integrations?.uber?.centralBillingAccountEmail;
    // Track focus and connection change to route to the invite flow once after successful connection
    const prevIsUberConnected = usePrevious(isUberConnected);

    // When Uber connection status flips from false -> true, navigate to the invite flow once
    useEffect(() => {
        if (!isUberConnected || prevIsUberConnected || !canWriteMoreFeatures) {
            return;
        }
        Navigation.navigate(buildDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE.getRoute(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER)));
    }, [prevIsUberConnected, isUberConnected, policyID, canWriteMoreFeatures, buildDynamicRoute]);

    const calculateAndSetThreeDotsMenuPosition = () => {
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
    };

    const getConnectionsMenuItems = (): MenuItemData[] => {
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

                    const isUber = integration === CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER;
                    let rightComponent: React.ReactNode;
                    if (canWriteMoreFeatures && (isUberConnected || shouldShowEnterCredentialsError)) {
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
                    } else {
                        rightComponent = (
                            <Button
                                onPress={() => {
                                    if (!canWriteMoreFeatures) {
                                        showReadOnlyModal();
                                        return;
                                    }
                                    startIntegrationFlow({name: integration});
                                }}
                                style={styles.justifyContentCenter}
                                innerStyles={!canWriteMoreFeatures ? styles.buttonOpacityDisabled : undefined}
                                hoverStyles={!canWriteMoreFeatures ? styles.buttonOpacityDisabled : undefined}
                                size={CONST.BUTTON_SIZE.SMALL}
                                isLoading={!policy?.receiptPartners?.uber && !isOffline && !!policy?.isLoadingReceiptPartners}
                                isDisabled={canWriteMoreFeatures && isOffline}
                            >
                                <Button.Text>{translate('workspace.accounting.setup')}</Button.Text>
                            </Button>
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
                        badgeText: isUber ? translate('workspace.accounting.claimOffer.badgeText') : undefined,
                        onBadgePress:
                            isUber && canWriteMoreFeatures
                                ? () => {
                                      Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CLAIM_OFFER.getRoute(policyID, CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER));
                                  }
                                : undefined,
                        badgeStyle: styles.mr3,
                        isBadgeSuccess: isUber,
                        shouldShowBadgeInSeparateRow: shouldUseNarrowLayout,
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
    };
    const connectionsMenuItems = getConnectionsMenuItems();

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
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
                                                    onToggle={toggleUberAutoInvite}
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
                                                    onToggle={toggleUberAutoRemove}
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
                                                                          ROUTES.WORKSPACE_RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT.getRoute(
                                                                              policyID,
                                                                              CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER,
                                                                          ),
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
                            </Section>
                        </View>
                    </ScrollView>
                </ScreenWrapper>
            )}
        </AccessOrNotFoundWrapper>
    );
}

export default withUnifiedConnectionsBeta(WorkspaceReceiptPartnersPage);
