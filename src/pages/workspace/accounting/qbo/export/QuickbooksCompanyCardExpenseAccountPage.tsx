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
    const policyID = policy?.id ?? '';
    const {nonReimbursableBillDefaultVendor, autoCreateVendor, errorFields, pendingFields, nonReimbursableExpensesExportDestination, nonReimbursableExpensesAccount} =
        policy?.connections?.quickbooksOnline?.config ?? {};
    const {vendors} = policy?.connections?.quickbooksOnline?.data ?? {};
    const isVendorSelected = nonReimbursableExpensesExportDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL;
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
                <HeaderWithBackButton title={translate('workspace.qbo.exportCompany')} />
                <ScrollView contentContainerStyle={styles.pb2}>
                    <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportCompanyCardsDescription')}</Text>
                    <OfflineWithFeedback pendingAction={pendingFields?.nonReimbursableExpensesExportDestination}>
                        <MenuItemWithTopDescription
                            title={nonReimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${nonReimbursableExpensesExportDestination}`) : undefined}
                            description={translate('workspace.qbo.exportCompany')}
                            errorText={errorFields?.nonReimbursableExpensesExportDestination ? translate('common.genericErrorMessage') : undefined}
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_SELECT.getRoute(policyID))}
                            brickRoadIndicator={errorFields?.nonReimbursableExpensesExportDestination ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            shouldShowRightIcon
                            hintText={nonReimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${nonReimbursableExpensesExportDestination}Description`) : undefined}
                        />
                    </OfflineWithFeedback>
                    {isVendorSelected && (
                        <>
                            <OfflineWithFeedback pendingAction={pendingFields?.nonReimbursableExpensesAccount}>
                                <MenuItemWithTopDescription
                                    title={nonReimbursableExpensesAccount?.name}
                                    description={translate('workspace.qbo.accountsPayable')}
                                    errorText={errorFields?.nonReimbursableExpensesAccount ? translate('common.genericErrorMessage') : undefined}
                                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_PAYABLE_SELECT.getRoute(policyID))}
                                    brickRoadIndicator={errorFields?.nonReimbursableExpensesAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                    shouldShowRightIcon
                                />
                            </OfflineWithFeedback>
                            <ToggleSettingOptionRow
                                subtitle={translate('workspace.qbo.defaultVendorDescription')}
                                switchAccessibilityLabel={translate('workspace.qbo.defaultVendorDescription')}
                                errors={errorFields?.autoCreateVendor ?? undefined}
                                title={translate('workspace.qbo.defaultVendor')}
                                titleStyle={styles.textStrong}
                                wrapperStyle={[styles.ph5, styles.mb3, styles.mt1]}
                                isActive={Boolean(autoCreateVendor)}
                                onToggle={(isOn) => Connections.updatePolicyConnectionConfig(policyID, CONST.POLICY.CONNECTIONS.NAME.QBO, CONST.QUICK_BOOKS_CONFIG.AUTO_CREATE_VENDOR, isOn)}
                                pendingAction={pendingFields?.autoCreateVendor}
                            />
                        </>
                    )}
                    <OfflineWithFeedback pendingAction={pendingFields?.nonReimbursableBillDefaultVendor}>
                        <MenuItemWithTopDescription
                            title={nonReimbursableBillDefaultVendorObject?.name}
                            description={isVendorSelected ? translate('workspace.qbo.vendor') : translate('workspace.qbo.account')}
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT.getRoute(policyID))}
                            brickRoadIndicator={errorFields?.nonReimbursableBillDefaultVendor ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            shouldShowRightIcon
                            errorText={errorFields?.nonReimbursableBillDefaultVendor ? translate('common.genericErrorMessage') : undefined}
                        />
                    </OfflineWithFeedback>
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksCompanyCardExpenseAccountPage.displayName = 'QuickbooksCompanyCardExpenseAccountPage';

export default withPolicyConnections(QuickbooksCompanyCardExpenseAccountPage);
