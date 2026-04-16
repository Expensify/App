import React from 'react';
import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateManyPolicyConnectionConfigs} from '@libs/actions/connections';
import {getQBONonReimbursableExportAccountType} from '@libs/ConnectionUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

function DynamicQuickbooksCompanyCardExpenseAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const {vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const nonReimbursableBillDefaultVendorObject = vendors?.find((vendor) => vendor.id === qboConfig?.nonReimbursableBillDefaultVendor);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT.path);
    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(!!qboConfig?.autoCreateVendor);

    const sections = [
        {
            title: qboConfig?.nonReimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${qboConfig?.nonReimbursableExpensesExportDestination}`) : undefined,
            description: translate('workspace.accounting.exportAs'),
            onPress: () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_CARD_SELECT.path)),
            hintText: qboConfig?.nonReimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${qboConfig?.nonReimbursableExpensesExportDestination}Description`) : undefined,
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_EXPORT_DESTINATION],
        },
        {
            title: qboConfig?.nonReimbursableExpensesAccount?.name,
            description: getQBONonReimbursableExportAccountType(translate, qboConfig?.nonReimbursableExpensesExportDestination),
            onPress: () => {
                if (!policyID) {
                    return;
                }
                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.path));
            },
            subscribedSettings: [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSE_ACCOUNT],
        },
    ];

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName="DynamicQuickbooksCompanyCardExpenseAccountPage"
            headerTitle="workspace.accounting.exportCompanyCard"
            title="workspace.qbo.exportCompanyCardsDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(backPath)}
        >
            {sections.map((section) => (
                <OfflineWithFeedback
                    key={section.title}
                    pendingAction={settingsPendingAction(section.subscribedSettings, qboConfig?.pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        onPress={section.onPress}
                        brickRoadIndicator={areSettingsInErrorFields(section.subscribedSettings, qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        shouldShowRightIcon
                        hintText={section.hintText}
                    />
                </OfflineWithFeedback>
            ))}
            {qboConfig?.nonReimbursableExpensesExportDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL && (
                <>
                    <ToggleSettingOptionRow
                        title={translate('workspace.accounting.defaultVendor')}
                        subtitle={translate('workspace.qbo.defaultVendorDescription')}
                        switchAccessibilityLabel={translate('workspace.qbo.defaultVendorDescription')}
                        wrapperStyle={[styles.ph5, styles.mb3, styles.mt1]}
                        isActive={!!qboConfig?.autoCreateVendor}
                        pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR], qboConfig?.pendingFields)}
                        errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR)}
                        onToggle={(isOn) =>
                            updateManyPolicyConnectionConfigs(
                                policyID,
                                CONST.POLICY.CONNECTIONS.NAME.QBO,
                                {
                                    [CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR]: isOn,
                                    [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: isOn
                                        ? (policy?.connections?.quickbooksOnline?.data?.vendors?.[0]?.id ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE)
                                        : CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
                                },
                                {
                                    [CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR]: qboConfig?.autoCreateVendor,
                                    [CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: nonReimbursableBillDefaultVendorObject?.id ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
                                },
                            )
                        }
                        onCloseError={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR)}
                        shouldPlaceSubtitleBelowSwitch
                    />
                    <Accordion
                        isExpanded={isAccordionExpanded}
                        isToggleTriggered={shouldAnimateAccordionSection}
                    >
                        <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qboConfig?.pendingFields)}>
                            <MenuItemWithTopDescription
                                title={nonReimbursableBillDefaultVendorObject?.name}
                                description={translate('workspace.accounting.defaultVendor')}
                                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.getRoute(policyID))}
                                brickRoadIndicator={
                                    areSettingsInErrorFields([CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR], qboConfig?.errorFields)
                                        ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR
                                        : undefined
                                }
                                shouldShowRightIcon
                            />
                        </OfflineWithFeedback>
                    </Accordion>
                </>
            )}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(DynamicQuickbooksCompanyCardExpenseAccountPage);
