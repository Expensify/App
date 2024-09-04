import React, {useMemo} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import * as Connections from '@libs/actions/connections';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import type {ToggleSettingOptionRowProps} from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const waitForNavigate = useWaitForNavigation();
    const {translate} = useLocalize();

    const policyID = policy?.id ?? '-1';
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {autoSync, syncPeople, autoCreateVendor, pendingFields, collectionAccountID, reimbursementAccountID, errorFields} = qboConfig ?? {};
    const {bankAccounts, creditCards, otherCurrentAssetAccounts, vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const {nonReimbursableBillDefaultVendor} = policy?.connections?.quickbooksOnline?.config ?? {};
    const nonReimbursableBillDefaultVendorObject = vendors?.find((vendor) => vendor.id === nonReimbursableBillDefaultVendor);
    const qboAccountOptions = useMemo(() => [...(bankAccounts ?? []), ...(creditCards ?? [])], [bankAccounts, creditCards]);
    const invoiceAccountCollectionOptions = useMemo(() => [...(bankAccounts ?? []), ...(otherCurrentAssetAccounts ?? [])], [bankAccounts, otherCurrentAssetAccounts]);

    const isSyncReimbursedSwitchOn = !!collectionAccountID;

    const selectedQboAccountName = useMemo(() => qboAccountOptions?.find(({id}) => id === reimbursementAccountID)?.name, [qboAccountOptions, reimbursementAccountID]);
    const selectedInvoiceCollectionAccountName = useMemo(
        () => invoiceAccountCollectionOptions?.find(({id}) => id === collectionAccountID)?.name,
        [invoiceAccountCollectionOptions, collectionAccountID],
    );

    const syncReimbursedSubMenuItems = () => (
        <View style={[styles.mt3]}>
            <OfflineWithFeedback pendingAction={pendingFields?.reimbursementAccountID}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={selectedQboAccountName}
                    description={translate('workspace.qbo.advancedConfig.qboBillPaymentAccount')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    onPress={waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR.getRoute(policyID)))}
                    errorText={errorFields?.reimbursementAccountID ? translate('common.genericErrorMessage') : undefined}
                    brickRoadIndicator={errorFields?.reimbursementAccountID ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <OfflineWithFeedback pendingAction={pendingFields?.collectionAccountID}>
                <MenuItemWithTopDescription
                    shouldShowRightIcon
                    title={selectedInvoiceCollectionAccountName}
                    description={translate('workspace.qbo.advancedConfig.qboInvoiceCollectionAccount')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    onPress={waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR.getRoute(policyID)))}
                    errorText={errorFields?.collectionAccountID ? translate('common.genericErrorMessage') : undefined}
                    brickRoadIndicator={errorFields?.collectionAccountID ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
        </View>
    );

    const qboToggleSettingItems: ToggleSettingOptionRowProps[] = [
        {
            title: translate('workspace.accounting.autoSync'),
            subtitle: translate('workspace.qbo.advancedConfig.autoSyncDescription'),
            switchAccessibilityLabel: translate('workspace.qbo.advancedConfig.autoSyncDescription'),
            isActive: !!autoSync?.enabled,
            onToggle: () =>
                Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC, {
                    enabled: !autoSync?.enabled,
                }),
            pendingAction: pendingFields?.autoSync,
            errors: ErrorUtils.getLatestErrorField(qboConfig ?? {}, CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC),
            onCloseError: () => Policy.clearQBOErrorField(policyID, CONST.QUICK_BOOKS_CONFIG.AUTO_SYNC),
            wrapperStyle: styles.mv3,
        },
        {
            title: translate('workspace.qbo.advancedConfig.inviteEmployees'),
            subtitle: translate('workspace.qbo.advancedConfig.inviteEmployeesDescription'),
            switchAccessibilityLabel: translate('workspace.qbo.advancedConfig.inviteEmployeesDescription'),
            isActive: !!syncPeople,
            onToggle: () => Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE, !syncPeople),
            pendingAction: pendingFields?.syncPeople,
            errors: ErrorUtils.getLatestErrorField(qboConfig ?? {}, CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE),
            onCloseError: () => Policy.clearQBOErrorField(policyID, CONST.QUICK_BOOKS_CONFIG.SYNC_PEOPLE),
            wrapperStyle: styles.mv3,
        },
        {
            title: translate('workspace.qbo.advancedConfig.createEntities'),
            subtitle: translate('workspace.qbo.advancedConfig.createEntitiesDescription'),
            switchAccessibilityLabel: translate('workspace.qbo.advancedConfig.createEntitiesDescription'),
            isActive: !!autoCreateVendor,
            onToggle: (isOn) => {
                const nonReimbursableVendorUpdateValue = isOn
                    ? policy?.connections?.quickbooksOnline?.data?.vendors?.[0]?.id ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE
                    : CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE;
                const nonReimbursableVendorCurrentValue = nonReimbursableBillDefaultVendorObject?.id ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE;

                QuickbooksOnline.updateQuickbooksOnlineAutoCreateVendor(
                    policyID,
                    {
                        [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: isOn,
                        [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: nonReimbursableVendorUpdateValue,
                    },
                    {
                        [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: !!autoCreateVendor,
                        [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: nonReimbursableVendorCurrentValue,
                    },
                );
            },
            pendingAction: pendingFields?.autoCreateVendor,
            errors: ErrorUtils.getLatestErrorField(qboConfig ?? {}, CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR),
            onCloseError: () => Policy.clearQBOErrorField(policyID, CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR),
            wrapperStyle: styles.mv3,
        },
        {
            title: translate('workspace.accounting.reimbursedReports'),
            subtitle: translate('workspace.qbo.advancedConfig.reimbursedReportsDescription'),
            switchAccessibilityLabel: translate('workspace.qbo.advancedConfig.reimbursedReportsDescription'),
            isActive: isSyncReimbursedSwitchOn,
            onToggle: () =>
                Connections.updatePolicyConnectionConfig(
                    policyID,
                    CONST.POLICY.CONNECTIONS.NAME.QBO,
                    CONST.QUICK_BOOKS_CONFIG.COLLECTION_ACCOUNT_ID,
                    isSyncReimbursedSwitchOn ? '' : [...qboAccountOptions, ...invoiceAccountCollectionOptions][0].id,
                ),
            pendingAction: pendingFields?.collectionAccountID,
            errors: ErrorUtils.getLatestErrorField(qboConfig ?? {}, CONST.QUICK_BOOKS_CONFIG.COLLECTION_ACCOUNT_ID),
            onCloseError: () => Policy.clearQBOErrorField(policyID, CONST.QUICK_BOOKS_CONFIG.COLLECTION_ACCOUNT_ID),
            subMenuItems: syncReimbursedSubMenuItems(),
            wrapperStyle: styles.mv3,
        },
    ];

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={QuickbooksAdvancedPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.accounting.advanced')} />

                <ScrollView contentContainerStyle={[styles.ph5, styles.pb5]}>
                    {qboToggleSettingItems.map((item) => (
                        <ToggleSettingOptionRow
                            key={item.title}
                            errors={item.errors}
                            onCloseError={item.onCloseError}
                            title={item.title}
                            subtitle={item.subtitle}
                            switchAccessibilityLabel={item.switchAccessibilityLabel}
                            shouldPlaceSubtitleBelowSwitch
                            wrapperStyle={item.wrapperStyle}
                            isActive={item.isActive}
                            onToggle={item.onToggle}
                            pendingAction={item.pendingAction}
                            subMenuItems={item.subMenuItems}
                        />
                    ))}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksAdvancedPage.displayName = 'QuickbooksAdvancedPage';

export default withPolicyConnections(QuickbooksAdvancedPage);
