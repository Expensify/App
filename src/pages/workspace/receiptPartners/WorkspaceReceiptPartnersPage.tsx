import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useConfirmModal from '@hooks/useConfirmModal';
import useGetReceiptPartnersIntegrationData from '@hooks/useGetReceiptPartnersIntegrationData';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useScreenBoundDynamicRoute from '@hooks/useScreenBoundDynamicRoute';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import useRedirectUnconnectedPanelToConnections from '@pages/workspace/connections/useRedirectUnconnectedPanelToConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {openExternalLink} from '@userActions/Link';
import {openPolicyReceiptPartnersPage, removePolicyReceiptPartnersConnection, togglePolicyUberAutoInvite, togglePolicyUberAutoRemove} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import React, {useCallback, useEffect} from 'react';

import getSynchronizationErrorMessage from './utils';

type WorkspaceReceiptPartnersPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS>;

function WorkspaceReceiptPartnersPage({route}: WorkspaceReceiptPartnersPageProps) {
    const policyID = route.params.policyID;
    const icons = useMemoizedLazyExpensifyIcons(['Key', 'Mail', 'NewWindow', 'Trashcan']);
    const {translate} = useLocalize();
    const buildDynamicRoute = useScreenBoundDynamicRoute();
    const styles = useThemeStyles();
    const {showConfirmModal} = useConfirmModal();
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.receiptPartners');
    const {getReceiptPartnersIntegrationData, shouldShowEnterCredentialsError, isUberConnected} = useGetReceiptPartnersIntegrationData(policyID);
    const isLoading = policy?.isLoading;
    useRedirectUnconnectedPanelToConnections(policyID, !!policy && !isLoading, isUberConnected || shouldShowEnterCredentialsError);
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

    const toggleWorkspaceUberAutoInvite = useCallback(() => {
        togglePolicyUberAutoInvite(policyID, !isAutoInvite);
    }, [isAutoInvite, policyID]);

    const toggleWorkspaceUberAutoRemove = useCallback(() => {
        togglePolicyUberAutoRemove(policyID, !isAutoRemove);
    }, [isAutoRemove, policyID]);

    const disconnectPartner = useCallback(
        (partner: ValueOf<typeof CONST.POLICY.RECEIPT_PARTNERS.NAME>) => {
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

    const uberData = policyID ? getReceiptPartnersIntegrationData(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER) : undefined;

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
                        title={uberData?.title ?? CONST.POLICY.RECEIPT_PARTNERS.NAME_USER_FRIENDLY[CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER]}
                        subtitle={uberData?.description}
                        titleStyles={[styles.textNormal, styles.lineHeightLarge]}
                        policyAvatar={uberData?.icon ? {source: uberData.icon, type: CONST.ICON_TYPE_AVATAR, name: uberData.title} : undefined}
                        shouldShowThreeDotsButton={!!uberData && canWriteMoreFeatures}
                        threeDotsMenuItems={getOverflowMenu(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER)}
                        threeDotsAnchorAlignment={{
                            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
                            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                        }}
                        onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID))}
                    />
                    <ScrollView
                        contentContainerStyle={styles.pt3}
                        addBottomSafeAreaPadding
                    >
                        {!!uberData && shouldShowEnterCredentialsError && (
                            <FormHelpMessage
                                isError
                                message={getSynchronizationErrorMessage(uberData.title, translate, styles)}
                                style={[styles.ph5, styles.mb3]}
                            />
                        )}
                        {isUberConnected && (
                            <>
                                <OfflineWithFeedback pendingAction={integrations?.uber?.pendingFields?.autoInvite}>
                                    <ToggleSettingOptionRow
                                        titleStyle={styles.pr3}
                                        title={translate('workspace.receiptPartners.uber.autoInvite')}
                                        switchAccessibilityLabel={translate('workspace.receiptPartners.uber.autoInvite')}
                                        onToggle={toggleWorkspaceUberAutoInvite}
                                        isActive={isAutoInvite}
                                        disabled={!canWriteMoreFeatures}
                                        disabledAction={withReadOnlyFallback()}
                                        showLockIcon={!canWriteMoreFeatures}
                                        wrapperStyle={[styles.pv2, styles.mh5]}
                                    />
                                </OfflineWithFeedback>
                                <OfflineWithFeedback pendingAction={integrations?.uber?.pendingFields?.autoRemove}>
                                    <ToggleSettingOptionRow
                                        titleStyle={styles.pr3}
                                        title={translate('workspace.receiptPartners.uber.autoRemove')}
                                        switchAccessibilityLabel={translate('workspace.receiptPartners.uber.autoRemove')}
                                        onToggle={toggleWorkspaceUberAutoRemove}
                                        isActive={isAutoRemove}
                                        disabled={!canWriteMoreFeatures}
                                        disabledAction={withReadOnlyFallback()}
                                        showLockIcon={!canWriteMoreFeatures}
                                        wrapperStyle={[styles.pv2, styles.mh5]}
                                    />
                                </OfflineWithFeedback>
                                {centralBillingAccountEmail && (
                                    <OfflineWithFeedback pendingAction={integrations?.uber?.pendingFields?.centralBillingAccountEmail}>
                                        <MenuItemField
                                            name={translate('workspace.receiptPartners.uber.centralBillingAccount')}
                                            value={integrations?.uber?.centralBillingAccountEmail}
                                            onPress={
                                                canWriteMoreFeatures
                                                    ? () =>
                                                          Navigation.navigate(
                                                              ROUTES.WORKSPACE_RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT.getRoute(policyID, CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER),
                                                          )
                                                    : undefined
                                            }
                                        />
                                    </OfflineWithFeedback>
                                )}
                                {canWriteMoreFeatures && (
                                    <MenuItem
                                        icon={icons.Mail}
                                        title={translate('workspace.receiptPartners.uber.manageInvites')}
                                        shouldShowRightIcon
                                        onPress={() =>
                                            Navigation.navigate(buildDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT.getRoute(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER)))
                                        }
                                    />
                                )}
                            </>
                        )}
                    </ScrollView>
                </ScreenWrapper>
            )}
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceReceiptPartnersPage;
