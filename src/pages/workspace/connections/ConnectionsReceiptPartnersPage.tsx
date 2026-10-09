import UserAvatar from '@components/Avatar/UserAvatar';
import FormHelpMessage from '@components/FormHelpMessage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';

import useIsUnifiedConnectionsBetaEnabled from '@hooks/useIsUnifiedConnectionsBetaEnabled';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useScreenBoundDynamicRoute from '@hooks/useScreenBoundDynamicRoute';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import useReceiptPartnersSettings from '@pages/workspace/receiptPartners/useReceiptPartnersSettings';
import getSynchronizationErrorMessage from '@pages/workspace/receiptPartners/utils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type ConnectionsReceiptPartnersPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.CONNECTIONS_RECEIPT_PARTNERS>;

function ConnectionsReceiptPartnersPage({route}: ConnectionsReceiptPartnersPageProps) {
    const policyID = route.params.policyID;
    const icons = useMemoizedLazyExpensifyIcons(['Mail']);
    const {translate} = useLocalize();
    const buildDynamicRoute = useScreenBoundDynamicRoute();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const isUnifiedConnectionsBetaEnabled = useIsUnifiedConnectionsBetaEnabled();
    const {
        policy,
        integrations,
        isAutoInvite,
        isAutoRemove,
        isUberConnected,
        shouldShowEnterCredentialsError,
        getReceiptPartnersIntegrationData,
        canWriteMoreFeatures,
        withReadOnlyFallback,
        toggleUberAutoInvite,
        toggleUberAutoRemove,
        getOverflowMenu,
    } = useReceiptPartnersSettings(policyID, {
        // These settings have nothing to show once Uber is disconnected
        onDisconnectConfirmed: () => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID)),
    });
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.receiptPartners');
    const isLoading = policy?.isLoading;
    const centralBillingAccountEmail = !!integrations?.uber?.centralBillingAccountEmail;

    const uberData = policyID ? getReceiptPartnersIntegrationData(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER) : undefined;

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
            shouldBeBlocked={!isUnifiedConnectionsBetaEnabled || (!isLoading && !isUberConnected && !shouldShowEnterCredentialsError)}
        >
            {isLoading ? (
                <FullScreenLoadingIndicator
                    shouldUseGoBackButton
                    style={styles.flex1}
                />
            ) : (
                <ScreenWrapper
                    testID="ConnectionsReceiptPartnersPage"
                    enableEdgeToEdgeBottomSafeAreaPadding
                >
                    <Header>
                        <Header.BackButton onPress={() => Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID))} />
                        {!!uberData?.icon && (
                            <UserAvatar
                                containerStyles={[StyleUtils.getWidthAndHeightStyle(StyleUtils.getAvatarSize(CONST.AVATAR_SIZE.DEFAULT)), styles.mr3]}
                                size={CONST.AVATAR_SIZE.DEFAULT}
                                source={uberData.icon}
                                accountID={CONST.DEFAULT_NUMBER_ID}
                            />
                        )}
                        <Header.Title
                            title={uberData?.title ?? CONST.POLICY.RECEIPT_PARTNERS.NAME_USER_FRIENDLY[CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER]}
                            subtitle={uberData?.description}
                            titleStyles={[styles.textNormal, styles.lineHeightLarge]}
                        />
                        {!!uberData && canWriteMoreFeatures && (
                            <Header.Right>
                                <Header.ThreeDotsMenu items={getOverflowMenu(CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER)} />
                            </Header.Right>
                        )}
                    </Header>
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
                                        onToggle={toggleUberAutoInvite}
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
                                        onToggle={toggleUberAutoRemove}
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

export default ConnectionsReceiptPartnersPage;
