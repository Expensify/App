import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
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
import type {ToggleSettingOptionRowProps} from '@pages/workspace/workflows/ToggleSettingsOptionRow';
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

    const qboToggleSettingItems: ToggleSettingOptionRowProps[] = [
        {
            title: translate('workspace.qbo.advancedConfig.autoSync'),
            subtitle: translate('workspace.qbo.advancedConfig.autoSyncDescription'),
            isActive: Boolean(autoSync),
            onToggle: () => Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC, !autoSync),
            pendingAction: pendingFields?.autoSync,
        },
        {
            title: translate('workspace.qbo.advancedConfig.inviteEmployees'),
            subtitle: translate('workspace.qbo.advancedConfig.inviteEmployeesDescription'),
            isActive: Boolean(syncPeople),
            onToggle: () => Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.SYNCE_PEOPLE, !syncPeople),
            pendingAction: pendingFields?.syncPeople,
        },
        {
            title: translate('workspace.qbo.advancedConfig.createEntities'),
            subtitle: translate('workspace.qbo.advancedConfig.createEntitiesDescription'),
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
                                isActive={Boolean(reimbursementAccountID && collectionAccountID)}
                                onToggle={() => Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID, bankAccounts?.[0].id ?? '')}
                            />

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

                            <ToggleSettingOptionRow
                                title={translate('workspace.qbo.advancedConfig.collectionAccount')} // TODO: set to the current selected value
                                subtitle={translate('workspace.qbo.advancedConfig.collectionAccountDescription')}
                                shouldPlaceSubtitleBelowSwitch
                                wrapperStyle={styles.mv3}
                                pendingAction={pendingFields?.collectionAccountID}
                                isActive={Boolean(collectionAccountID)}
                                onToggle={() => Policy.updatePolicyConnectionConfig(policyID, CONST.QUICK_BOOKS_CONFIG.COLLECTION_ACCOUNT_ID, !collectionAccountID)}
                            />

                            <MenuItemWithTopDescription
                                title="Croissant Co Money in Clearing"
                                shouldShowRightIcon
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
