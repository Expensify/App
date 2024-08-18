import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Connections from '@libs/actions/connections';
import * as ConnectionUtils from '@libs/ConnectionUtils';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksCompanyCardExpenseAccountPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const {nonReimbursableBillDefaultVendor, autoCreateVendor, errorFields, pendingFields, nonReimbursableExpensesExportDestination, nonReimbursableExpensesAccount} =
        policy?.connections?.quickbooksOnline?.config ?? {};
    const {vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const nonReimbursableBillDefaultVendorObject = vendors?.find((vendor) => vendor.id === nonReimbursableBillDefaultVendor);
    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={QuickbooksCompanyCardExpenseAccountPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.accounting.exportCompanyCard')} />
                <ScrollView contentContainerStyle={styles.pb2}>
                    <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportCompanyCardsDescription')}</Text>
                    <OfflineWithFeedback pendingAction={pendingFields?.nonReimbursableExpensesExportDestination}>
                        <MenuItemWithTopDescription
                            title={nonReimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${nonReimbursableExpensesExportDestination}`) : undefined}
                            description={translate('workspace.accounting.exportAs')}
                            errorText={errorFields?.nonReimbursableExpensesExportDestination ? translate('common.genericErrorMessage') : undefined}
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_SELECT.getRoute(policyID))}
                            brickRoadIndicator={errorFields?.nonReimbursableExpensesExportDestination ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            shouldShowRightIcon
                            hintText={nonReimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${nonReimbursableExpensesExportDestination}Description`) : undefined}
                        />
                    </OfflineWithFeedback>
                    <OfflineWithFeedback pendingAction={pendingFields?.nonReimbursableExpensesAccount}>
                        <MenuItemWithTopDescription
                            title={nonReimbursableExpensesAccount?.name}
                            description={ConnectionUtils.getQBONonReimbursableExportAccountType(nonReimbursableExpensesExportDestination)}
                            errorText={errorFields?.nonReimbursableExpensesAccount ? translate('common.genericErrorMessage') : undefined}
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT.getRoute(policyID))}
                            brickRoadIndicator={errorFields?.nonReimbursableExpensesAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            shouldShowRightIcon
                        />
                    </OfflineWithFeedback>
                    {nonReimbursableExpensesExportDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL && (
                        <>
                            <ToggleSettingOptionRow
                                shouldPlaceSubtitleBelowSwitch
                                subtitle={translate('workspace.qbo.defaultVendorDescription')}
                                switchAccessibilityLabel={translate('workspace.qbo.defaultVendorDescription')}
                                errors={errorFields?.autoCreateVendor ?? undefined}
                                title={translate('workspace.accounting.defaultVendor')}
                                wrapperStyle={[styles.ph5, styles.mb3, styles.mt1]}
                                isActive={!!autoCreateVendor}
                                onToggle={(isOn) =>
                                    Connections.updateManyPolicyConnectionConfigs(
                                        policyID,
                                        CONST.POLICY.CONNECTIONS.NAME.QBO,
                                        {
                                            [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: isOn,
                                            [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]: isOn
                                                ? policy?.connections?.quickbooksOnline?.data?.vendors?.[0]?.id ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE
                                                : CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
                                        },
                                        {
                                            [CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR]: autoCreateVendor,
                                            [CONST.QUICK_BOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR]:
                                                nonReimbursableBillDefaultVendorObject?.id ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
                                        },
                                    )
                                }
                                pendingAction={pendingFields?.autoCreateVendor}
                            />
                            {autoCreateVendor && (
                                <OfflineWithFeedback pendingAction={pendingFields?.nonReimbursableBillDefaultVendor}>
                                    <MenuItemWithTopDescription
                                        title={nonReimbursableBillDefaultVendorObject?.name}
                                        description={translate('workspace.accounting.defaultVendor')}
                                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.getRoute(policyID))}
                                        brickRoadIndicator={errorFields?.nonReimbursableBillDefaultVendor ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                        shouldShowRightIcon
                                        errorText={errorFields?.nonReimbursableBillDefaultVendor ? translate('common.genericErrorMessage') : undefined}
                                    />
                                </OfflineWithFeedback>
                            )}
                        </>
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountPage.displayName = 'QuickbooksCompanyCardExpenseAccountPage';

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountPage);
