import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SpacerView from '@components/SpacerView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import * as Connections from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import type {ToggleSettingOptionRowProps} from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksAdvancedPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();
    const waitForNavigate = useWaitForNavigation();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '';
    const {autoSync, syncPeople, autoCreateVendor, pendingFields, collectionAccountID} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isSyncReimbursedSwitchOn = Boolean(collectionAccountID !== '');
    const selectedAccount = '92345'; // TODO: use fake selected account temporarily.

    const qboToggleSettingItems: ToggleSettingOptionRowProps[] = [
        {
            title: translate('workspace.qbo.advancedConfig.autoSync'),
            subtitle: translate('workspace.qbo.advancedConfig.autoSyncDescription'),
            isActive: Boolean(autoSync?.enabled),
            onToggle: () =>
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC, {
                    jobID: autoSync?.jobID ?? '',
                    enabled: !autoSync?.enabled,
                }),
            pendingAction: pendingFields?.autoSync,
        },
        {
            title: translate('workspace.qbo.advancedConfig.inviteEmployees'),
            subtitle: translate('workspace.qbo.advancedConfig.inviteEmployeesDescription'),
            isActive: Boolean(syncPeople),
            onToggle: () => Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.SYNCE_PEOPLE, !syncPeople),
            pendingAction: pendingFields?.syncPeople,
        },
        {
            title: translate('workspace.qbo.advancedConfig.createEntities'),
            subtitle: translate('workspace.qbo.advancedConfig.createEntitiesDescription'),
            isActive: Boolean(autoCreateVendor),
            onToggle: () => Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR, !autoCreateVendor),
            pendingAction: pendingFields?.autoCreateVendor,
        },
    ];

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
                    policyID={policyID}
                    featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
                >
                    <ScreenWrapper
                        includeSafeAreaPaddingBottom={false}
                        shouldEnableMaxHeight
                        testID={QuickbooksAdvancedPage.displayName}
                    >
                        <HeaderWithBackButton title={translate('workspace.qbo.advancedConfig.advanced')} />

                        <ScrollView contentContainerStyle={[styles.ph5, styles.pb5]}>
                            {qboToggleSettingItems.map((item) => (
                                <ToggleSettingOptionRow
                                    key={item.title}
                                    title={item.title}
                                    subtitle={item.subtitle}
                                    shouldPlaceSubtitleBelowSwitch
                                    wrapperStyle={styles.mv3}
                                    isActive={item.isActive}
                                    onToggle={item.onToggle}
                                    pendingAction={item.pendingAction}
                                />
                            ))}

                            <View style={styles.mv3}>
                                <SpacerView
                                    shouldShow
                                    style={[styles.chatItemComposeBoxColor]}
                                />
                            </View>

                            <ToggleSettingOptionRow
                                title={translate('workspace.qbo.advancedConfig.reimbursedReports')}
                                subtitle={translate('workspace.qbo.advancedConfig.reimbursedReportsDescription')}
                                shouldPlaceSubtitleBelowSwitch
                                wrapperStyle={styles.mv3}
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                pendingAction={pendingFields?.reimbursementAccountID || pendingFields?.collectionAccountID}
                                isActive={isSyncReimbursedSwitchOn} // TODO
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                onToggle={() =>
                                    Connections.updatePolicyConnectionConfig(
                                        policyID,
                                        CONST.POLICY.CONNECTIONS.NAME.QBO,
                                        CONST.QUICK_BOOKS_CONFIG.COLLECTION_ACCOUNT_ID,
                                        isSyncReimbursedSwitchOn ? '' : selectedAccount,
                                    )
                                }
                            />

                            {collectionAccountID && (
                                <>
                                    <MenuItemWithTopDescription
                                        shouldShowRightIcon
                                        title="Croissant Co Payroll Account" // TODO: set to the current selected value
                                        description={translate('workspace.qbo.advancedConfig.qboAccount')}
                                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                                        onPress={waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR.getRoute(policyID)))}
                                    />

                                    <View style={styles.mv3}>
                                        <SpacerView
                                            shouldShow
                                            style={[styles.chatItemComposeBoxColor]}
                                        />
                                    </View>

                                    <MenuItem
                                        title={translate('workspace.qbo.advancedConfig.collectionAccount')}
                                        description={translate('workspace.qbo.advancedConfig.collectionAccountDescription')}
                                        shouldShowBasicTitle
                                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                                        interactive={false}
                                    />

                                    <MenuItemWithTopDescription
                                        title="Croissant Co Money in Clearing" // TODO: set to the current selected value
                                        shouldShowRightIcon
                                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                                        onPress={waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR.getRoute(policyID)))}
                                    />
                                </>
                            )}
                        </ScrollView>
                    </ScreenWrapper>
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

QuickbooksAdvancedPage.displayName = 'QuickbooksAdvancedPage';

export default withPolicy(QuickbooksAdvancedPage);
