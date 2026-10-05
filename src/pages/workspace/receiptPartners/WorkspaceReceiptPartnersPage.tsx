import UserAvatar from '@components/Avatar/UserAvatar';
import Badge from '@components/Badge';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';
import ThreeDotsMenu from '@components/ThreeDotsMenu';

import useConfirmModal from '@hooks/useConfirmModal';
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useScreenBoundDynamicRoute from '@hooks/useScreenBoundDynamicRoute';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
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

type WorkspaceReceiptPartnersPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS>;

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
    // Track focus and connection change to route to the invite flow once after successful connection
    const prevIsUberConnected = usePrevious(isUberConnected);
    const {canWrite: canWriteMoreFeatures, showReadOnlyModal, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);

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
        if (!isUberConnected || prevIsUberConnected || !canWriteMoreFeatures) {
            return;
        }
        Navigation.navigate(buildDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE.getRoute(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER)));
    }, [prevIsUberConnected, isUberConnected, policyID, canWriteMoreFeatures, buildDynamicRoute]);

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
        [icons.Key, icons.NewWindow, icons.Trashcan, shouldShowEnterCredentialsError, translate, isOffline, startIntegrationFlow, showConfirmModal, disconnectPartner],
    );

    const connectionRows = useMemo(() => {
        if (policyID) {
            return receiptPartnerIntegrations.map((integration) => {
                const integrationData = getReceiptPartnersIntegrationData(integration);
                if (!integrationData) {
                    return null;
                }
                const overflowMenu = canWriteMoreFeatures ? getOverflowMenu(integration) : [];

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

                const errorText = shouldShowEnterCredentialsError ? getSynchronizationErrorMessage(integrationData.title, translate, styles) : undefined;
                const brickRoadIndicator = !!integrationData.errorFields || shouldShowEnterCredentialsError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined;
                const onBadgePress =
                    isUber && canWriteMoreFeatures
                        ? () => {
                              Navigation.navigate(ROUTES.POLICY_ACCOUNTING_CLAIM_OFFER.getRoute(policyID, CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER));
                          }
                        : undefined;
                const badge = isUber && (
                    <Badge
                        text={translate('workspace.accounting.claimOffer.badgeText')}
                        success
                        onPress={onBadgePress}
                        pressable={!!onBadgePress}
                        badgeStyles={shouldUseNarrowLayout ? [styles.alignSelfStart, styles.ml13, styles.mt2] : [styles.ml0, !!brickRoadIndicator && styles.mr1]}
                    />
                );

                return (
                    <OfflineWithFeedback
                        key={integration}
                        shouldDisableStrikeThrough
                    >
                        <MenuItemSectionRoot>
                            <MenuItem.Row>
                                {!!integrationData.icon && (
                                    <MenuItem.Leading>
                                        <UserAvatar
                                            source={integrationData.icon}
                                            accountID={CONST.DEFAULT_NUMBER_ID}
                                        />
                                    </MenuItem.Leading>
                                )}
                                <MenuItem.Content>
                                    <MenuItem.Title>{integrationData.title}</MenuItem.Title>
                                    <MenuItem.Description numberOfLines={5}>{integrationData.description}</MenuItem.Description>
                                </MenuItem.Content>
                                <MenuItem.Trailing>
                                    {!shouldUseNarrowLayout && badge}
                                    {!!brickRoadIndicator && <MenuItem.BrickRoadIndicator status={brickRoadIndicator} />}
                                    {rightComponent}
                                </MenuItem.Trailing>
                            </MenuItem.Row>
                            {shouldUseNarrowLayout && badge}
                            {!!errorText && (
                                <FormHelpMessage
                                    isError
                                    shouldShowRedDotIndicator={false}
                                    message={errorText}
                                    style={[styles.menuItemError, styles.mt3]}
                                />
                            )}
                        </MenuItemSectionRoot>
                    </OfflineWithFeedback>
                );
            });
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
        shouldUseNarrowLayout,
        isUberConnected,
        calculateAndSetThreeDotsMenuPosition,
        policy?.receiptPartners?.uber,
        policy?.isLoadingReceiptPartners,
        isOffline,
        startIntegrationFlow,
        showReadOnlyModal,
    ]);

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
                                {connectionRows}
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

export default WorkspaceReceiptPartnersPage;
