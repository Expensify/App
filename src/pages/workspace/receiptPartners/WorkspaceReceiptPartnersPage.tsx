import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRoot from '@components/MenuItem/presets/MenuItemSectionRoot';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Section from '@components/Section';

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

import {openPolicyReceiptPartnersPage, togglePolicyUberAutoInvite, togglePolicyUberAutoRemove} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import type {ReceiptPartnerName, ReceiptPartnerRowComponent} from './connectionRows/types';

import UberConnectionRow from './connectionRows/UberConnectionRow';

const CONNECTION_ROWS: Record<ReceiptPartnerName, ReceiptPartnerRowComponent> = {
    [CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER]: UberConnectionRow,
};

const receiptPartnerNames = Object.values(CONST.POLICY.RECEIPT_PARTNERS.NAME);

type WorkspaceReceiptPartnersPageProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.RECEIPT_PARTNERS>;

function WorkspaceReceiptPartnersPage({route}: WorkspaceReceiptPartnersPageProps) {
    const policyID = route.params.policyID;
    const icons = useMemoizedLazyExpensifyIcons(['Mail']);
    const {translate} = useLocalize();
    const buildDynamicRoute = useScreenBoundDynamicRoute();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const policy = usePolicy(policyID);
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.receiptPartners');
    const {isUberConnected} = useGetReceiptPartnersIntegrationData(policyID);
    const isLoading = policy?.isLoading;
    const integrations = policy?.receiptPartners;
    const isAutoRemove = !!integrations?.uber?.autoRemove;
    const isAutoInvite = !!integrations?.uber?.autoInvite;
    const centralBillingAccountEmail = !!integrations?.uber?.centralBillingAccountEmail;
    // Track focus and connection change to route to the invite flow once after successful connection
    const prevIsUberConnected = usePrevious(isUberConnected);
    const {canWrite: canWriteMoreFeatures, withReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.MORE_FEATURES);

    const fetchReceiptPartners = useCallback(() => {
        openPolicyReceiptPartnersPage(policyID);
    }, [policyID]);

    useNetwork({onReconnect: fetchReceiptPartners});

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

    const toggleWorkspaceUberAutoInvite = useCallback(() => {
        togglePolicyUberAutoInvite(policyID, !isAutoInvite);
    }, [isAutoInvite, policyID]);

    const toggleWorkspaceUberAutoRemove = useCallback(() => {
        togglePolicyUberAutoRemove(policyID, !isAutoRemove);
    }, [isAutoRemove, policyID]);

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
                                {receiptPartnerNames.map((name) => {
                                    const ConnectionRow = CONNECTION_ROWS[name];
                                    return (
                                        <ConnectionRow
                                            key={name}
                                            policyID={policyID}
                                        />
                                    );
                                })}
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
