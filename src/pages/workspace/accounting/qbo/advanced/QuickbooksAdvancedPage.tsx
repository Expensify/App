import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import {updateQuickbooksOnlineAutoCreateVendor, updateQuickbooksOnlineSyncPeople, updateQuickbooksOnlineSyncReimbursedReports} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';

const reimbursementOrCollectionAccountIDs = [CONST.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID, CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID];
const collectionAccountIDs = [CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID];

function QuickbooksAdvancedPage({policy}: WithPolicyConnectionsProps) {
    const styles = useThemeStyles();
    const waitForNavigate = useWaitForNavigation();
    const {translate} = useLocalize();

    const policyID = policy?.id;
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const accountingMethod = policy?.connections?.quickbooksOnline?.config?.accountingMethod;
    const {bankAccounts, creditCards, otherCurrentAssetAccounts, vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const nonReimbursableBillDefaultVendorObject = vendors?.find((vendor) => vendor.id === qboConfig?.nonReimbursableBillDefaultVendor);

    const qboAccountOptions = useMemo(() => [...(bankAccounts ?? []), ...(creditCards ?? [])], [bankAccounts, creditCards]);
    const invoiceAccountCollectionOptions = useMemo(() => [...(bankAccounts ?? []), ...(otherCurrentAssetAccounts ?? [])], [bankAccounts, otherCurrentAssetAccounts]);

    const isSyncReimbursedSwitchOn = useMemo(
        () => !!qboConfig?.collectionAccountID || !!qboConfig?.reimbursementAccountID,
        [qboConfig?.collectionAccountID, qboConfig?.reimbursementAccountID],
    );

    const reimbursementAccountID = qboConfig?.reimbursementAccountID;
    const selectedQboAccountName = useMemo(() => qboAccountOptions?.find(({id}) => id === reimbursementAccountID)?.name, [qboAccountOptions, reimbursementAccountID]);
    const collectionAccountID = qboConfig?.collectionAccountID;

    const selectedInvoiceCollectionAccountName = useMemo(
        () => invoiceAccountCollectionOptions?.find(({id}) => id === collectionAccountID)?.name,
        [invoiceAccountCollectionOptions, collectionAccountID],
    );
    const autoCreateVendorConst = CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR;
    const defaultVendorConst = CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR;

    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(isSyncReimbursedSwitchOn);

    const AccordionMenuItems = [
        {
            key: 'qboBillPaymentAccount',
            title: selectedQboAccountName,
            description: translate('workspace.qbo.advancedConfig.qboBillPaymentAccount'),
            onPress: waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR.getRoute(policyID))),
            subscribedSettings: reimbursementOrCollectionAccountIDs,
            brickRoadIndicator: areSettingsInErrorFields(reimbursementOrCollectionAccountIDs, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            pendingAction: settingsPendingAction(reimbursementOrCollectionAccountIDs, qboConfig?.pendingFields),
        },
        {
            key: 'qboInvoiceCollectionAccount',
            title: selectedInvoiceCollectionAccountName,
            description: translate('workspace.qbo.advancedConfig.qboInvoiceCollectionAccount'),
            onPress: waitForNavigate(() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR.getRoute(policyID))),
            subscribedSettings: collectionAccountIDs,
            brickRoadIndicator: areSettingsInErrorFields(collectionAccountIDs, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            pendingAction: settingsPendingAction(collectionAccountIDs, qboConfig?.pendingFields),
        },
    ];

    const syncReimbursedSubMenuItems = () => (
        <View style={[styles.mt3]}>
            {AccordionMenuItems.map((item) => (
                <OfflineWithFeedback
                    key={item.key}
                    pendingAction={item.pendingAction}
                >
                    <MenuItemWithTopDescription
                        shouldShowRightIcon
                        title={item.title}
                        description={item.description}
                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                        onPress={item.onPress}
                        brickRoadIndicator={item.brickRoadIndicator}
                    />
                </OfflineWithFeedback>
            ))}
        </View>
    );

    const qboToggleSettingItems = [
        {
            title: translate('workspace.qbo.advancedConfig.inviteEmployees'),
            subtitle: translate('workspace.qbo.advancedConfig.inviteEmployeesDescription'),
            switchAccessibilityLabel: translate('workspace.qbo.advancedConfig.inviteEmployeesDescription'),
            isActive: !!qboConfig?.syncPeople,
            onToggle: () => updateQuickbooksOnlineSyncPeople(policyID, !qboConfig?.syncPeople),
            subscribedSetting: CONST.QUICKBOOKS_CONFIG.SYNC_PEOPLE,
            errors: getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.SYNC_PEOPLE),
            pendingAction: settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_PEOPLE], qboConfig?.pendingFields),
        },
        {
            title: translate('workspace.qbo.advancedConfig.createEntities'),
            subtitle: translate('workspace.qbo.advancedConfig.createEntitiesDescription'),
            switchAccessibilityLabel: translate('workspace.qbo.advancedConfig.createEntitiesDescription'),
            isActive: !!qboConfig?.autoCreateVendor,
            onToggle: (isOn: boolean) => {
                const nonReimbursableVendorUpdateValue = isOn
                    ? (policy?.connections?.quickbooksOnline?.data?.vendors?.[0]?.id ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE)
                    : CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE;
                const nonReimbursableVendorCurrentValue = nonReimbursableBillDefaultVendorObject?.id ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE;

                updateQuickbooksOnlineAutoCreateVendor(
                    policyID,
                    {
                        [autoCreateVendorConst]: isOn,
                        [defaultVendorConst]: nonReimbursableVendorUpdateValue,
                    },
                    {
                        [autoCreateVendorConst]: !!qboConfig?.autoCreateVendor,
                        [defaultVendorConst]: nonReimbursableVendorCurrentValue,
                    },
                );
            },
            subscribedSetting: CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR,
            errors: getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR),
            pendingAction: settingsPendingAction([CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR], qboConfig?.pendingFields),
        },
        {
            title: translate('workspace.accounting.reimbursedReports'),
            subtitle: translate('workspace.qbo.advancedConfig.reimbursedReportsDescription'),
            switchAccessibilityLabel: translate('workspace.qbo.advancedConfig.reimbursedReportsDescription'),
            isActive: isSyncReimbursedSwitchOn,
            onToggle: () => {
                updateQuickbooksOnlineSyncReimbursedReports(
                    policyID,
                    isSyncReimbursedSwitchOn ? '' : [...qboAccountOptions, ...invoiceAccountCollectionOptions].at(0)?.id,
                    qboConfig?.collectionAccountID,
                    qboConfig?.reimbursementAccountID,
                );
            },
            subscribedSetting: CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID,
            errors: getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID),
            pendingAction: settingsPendingAction([CONST.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID], qboConfig?.pendingFields),
        },
    ];

    return (
        <ConnectionLayout
            displayName="QuickbooksAdvancedPage"
            headerTitle="workspace.accounting.advanced"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
        >
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.AUTO_SYNC, CONST.QUICKBOOKS_CONFIG.ACCOUNTING_METHOD], qboConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={qboConfig?.autoSync?.enabled ? translate('common.enabled') : translate('common.disabled')}
                    description={translate('workspace.accounting.autoSync')}
                    shouldShowRightIcon
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC.getRoute(policyID))}
                    brickRoadIndicator={
                        areSettingsInErrorFields([CONST.QUICKBOOKS_CONFIG.AUTO_SYNC, CONST.QUICKBOOKS_CONFIG.ACCOUNTING_METHOD], qboConfig?.errorFields)
                            ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                            : undefined
                    }
                    hintText={(() => {
                        if (!qboConfig?.autoSync?.enabled) {
                            return undefined;
                        }
                        return translate(`workspace.qbo.accountingMethods.alternateText.${accountingMethod ?? COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH}` as TranslationPaths);
                    })()}
                />
            </OfflineWithFeedback>
            {qboToggleSettingItems.map((item) => (
                <ToggleSettingOptionRow
                    key={item.title}
                    title={item.title}
                    subtitle={item.subtitle}
                    switchAccessibilityLabel={item.switchAccessibilityLabel}
                    shouldPlaceSubtitleBelowSwitch
                    wrapperStyle={styles.mv3}
                    isActive={item.isActive}
                    onToggle={item.onToggle}
                    pendingAction={item.pendingAction}
                    errors={item.errors}
                    onCloseError={() => clearQBOErrorField(policyID, item.subscribedSetting)}
                />
            ))}
            <Accordion
                isExpanded={isAccordionExpanded}
                isToggleTriggered={shouldAnimateAccordionSection}
            >
                {syncReimbursedSubMenuItems()}
            </Accordion>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksAdvancedPage);
