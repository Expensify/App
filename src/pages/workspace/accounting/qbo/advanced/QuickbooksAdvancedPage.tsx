import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SpacerView from '@components/SpacerView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksAdvancedPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();
    const waitForNavigate = useWaitForNavigation();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '';
    const {autoSync, syncPeople, autoCreateVendor, reimbursementAccountID, collectionAccountID, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const {bankAccounts} = policy?.connections?.quickbooksOnline?.data ?? {};

    const qboSyncToggleSettings = [
        {
            title: translate('workspace.qbo.advancedConfig.autoSync'),
            subTitle: translate('workspace.qbo.advancedConfig.autoSyncDescription'),
            isActive: Boolean(autoSync),
            onToggle: () => Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC, !autoSync),
            pendingAction: pendingFields?.autoSync,
        },
        {
            title: translate('workspace.qbo.advancedConfig.inviteEmployees'),
            subTitle: translate('workspace.qbo.advancedConfig.inviteEmployeesDescription'),
            isActive: Boolean(syncPeople),
            onToggle: () => Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.SYNCE_PEOPLE, !syncPeople),
            pendingAction: pendingFields?.syncPeople,
        },
        {
            title: translate('workspace.qbo.advancedConfig.createEntities'),
            subTitle: translate('workspace.qbo.advancedConfig.createEntitiesDescription'),
            isActive: Boolean(autoCreateVendor),
            onToggle: () => Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR, !autoCreateVendor),
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

                        <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                            {qboSyncToggleSettings.map((item) => (
                                <OfflineWithFeedback
                                    key={item.title}
                                    pendingAction={item.pendingAction}
                                    style={styles.mv3}
                                >
                                    <ToggleSettingOptionRow
                                        title={item.title}
                                        subtitle={item.subTitle}
                                        isActive={item.isActive}
                                        onToggle={item.onToggle}
                                    />
                                </OfflineWithFeedback>
                            ))}

                            <View style={styles.mv3}>
                                <SpacerView
                                    shouldShow
                                    style={[styles.chatItemComposeBoxColor]}
                                />
                            </View>

                            <OfflineWithFeedback
                                style={styles.mv3}
                                pendingAction={pendingFields?.reimbursementAccountID && pendingFields?.collectionAccountID}
                            >
                                <ToggleSettingOptionRow
                                    title={translate('workspace.qbo.advancedConfig.reimbursedReports')}
                                    subtitle={translate('workspace.qbo.advancedConfig.reimbursedReportsDescription')}
                                    isActive={Boolean(reimbursementAccountID && collectionAccountID)}
                                    onToggle={() => Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID, bankAccounts?.[0].id ?? '')}
                                />
                            </OfflineWithFeedback>

                            <MenuItemWithTopDescription
                                shouldShowRightIcon
                                title={translate('workspace.qbo.advancedConfig.croissantCo.CroissantCoPayrollAccount')}
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
                                descriptionTextStyle={[styles.pr9]}
                                wrapperStyle={[styles.sectionMenuItemTopDescription]}
                                interactive={false}
                            />

                            <MenuItem
                                title={translate('workspace.qbo.advancedConfig.croissantCo.CroissantCoMoneyInClearing')}
                                shouldShowRightIcon
                                shouldShowBasicTitle
                                wrapperStyle={[styles.sectionMenuItemTopDescription]}
                                onPress={waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR.getRoute(policyID)))}
                            />
                        </ScrollView>
                    </ScreenWrapper>
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

QuickbooksAdvancedPage.displayName = 'QuickbooksAdvancedPage';

export default withPolicy(QuickbooksAdvancedPage);
