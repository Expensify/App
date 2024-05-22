import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyConnectionsProps} from '@pages/workspace/withPolicyConnections';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksOutOfPocketExpenseConfigurationPage({policy}: WithPolicyConnectionsProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {syncLocations, reimbursableExpensesAccount, reimbursableExpensesExportDestination, errorFields, syncTax, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isLocationEnabled = !!(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTaxesEnabled = !!syncTax;
    const shouldShowTaxError = isTaxesEnabled && reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY;
    const shouldShowLocationError = isLocationEnabled && reimbursableExpensesExportDestination !== CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY;
    const hasErrors = !!errorFields?.reimbursableExpensesExportDestination || shouldShowTaxError || shouldShowLocationError;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={QuickbooksOutOfPocketExpenseConfigurationPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.qbo.exportExpenses')} />
                <ScrollView contentContainerStyle={styles.pb2}>
                    {!isLocationEnabled && <Text style={[styles.ph5, styles.pb5]}>{translate('workspace.qbo.exportOutOfPocketExpensesDescription')}</Text>}
                    <OfflineWithFeedback pendingAction={pendingFields?.reimbursableExpensesExportDestination}>
                        <MenuItemWithTopDescription
                            title={reimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${reimbursableExpensesExportDestination}`) : undefined}
                            description={translate('workspace.qbo.exportAs')}
                            errorText={hasErrors && reimbursableExpensesExportDestination ? translate(`workspace.qbo.accounts.${reimbursableExpensesExportDestination}Error`) : undefined}
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT.getRoute(policyID))}
                            brickRoadIndicator={hasErrors ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            shouldShowRightIcon
                            hintText={
                                reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL && !isLocationEnabled
                                    ? translate('workspace.qbo.exportVendorBillDescription')
                                    : undefined
                            }
                        />
                    </OfflineWithFeedback>
                    {isLocationEnabled && <Text style={[styles.ph5, styles.mutedNormalTextLabel, styles.pt1]}>{translate('workspace.qbo.outOfPocketLocationEnabledDescription')}</Text>}
                    {!isLocationEnabled && (
                        <OfflineWithFeedback pendingAction={pendingFields?.reimbursableExpensesAccount}>
                            <MenuItemWithTopDescription
                                title={reimbursableExpensesAccount?.name}
                                description={translate('workspace.qbo.accountsPayable')}
                                onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT.getRoute(policyID))}
                                brickRoadIndicator={errorFields?.exportAccount ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                shouldShowRightIcon
                                errorText={errorFields?.exportAccount ? translate('common.genericErrorMessage') : undefined}
                            />
                        </OfflineWithFeedback>
                    )}
                </ScrollView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksOutOfPocketExpenseConfigurationPage.displayName = 'QuickbooksExportOutOfPocketExpensesPage';

export default withPolicyConnections(QuickbooksOutOfPocketExpenseConfigurationPage);
